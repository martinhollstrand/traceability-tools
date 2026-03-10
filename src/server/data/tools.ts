import "server-only";

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/server/db";
import { reportMetadataTable, toolsTable } from "@/server/db/schema";
import { revalidatePath } from "next/cache";
import type { Tool } from "@/lib/validators/tool";
import type { ReportMetadata } from "@/lib/validators/report";
import { normalizeReportKeyFindings } from "@/lib/report-key-findings";
import {
  CATEGORY_FILTER_QUESTION_CODES,
  getSearchFilterCategories,
} from "@/server/data/tool-categories";

type SortOption = "name" | "category" | "updated";

type ToolFilters = {
  query?: string;
  categories?: string[];
  featured?: boolean;
  sortBy?: SortOption;
};

export const listTools = cache(async (filters: ToolFilters = {}): Promise<Tool[]> => {
  const { query, categories, featured, sortBy = "name" } = filters;
  const conditions = [eq(toolsTable.status, "published")];

  if (featured) {
    conditions.push(eq(toolsTable.isFeatured, true));
  }

  if (query) {
    const pattern = `%${query}%`;
    // drizzle-orm `or()` can be typed as possibly undefined; use raw SQL to keep types strict.
    conditions.push(sql`
      (
        ${toolsTable.name} ILIKE ${pattern}
        OR coalesce(${toolsTable.vendor}, '') ILIKE ${pattern}
        OR coalesce(${toolsTable.category}, '') ILIKE ${pattern}
        OR coalesce(${toolsTable.secondaryCategory}, '') ILIKE ${pattern}
        OR coalesce(${toolsTable.summary}, '') ILIKE ${pattern}
        OR coalesce(${toolsTable.website}, '') ILIKE ${pattern}
        OR ${toolsTable.name} % ${query}
        OR coalesce(${toolsTable.vendor}, '') % ${query}
        OR coalesce(${toolsTable.category}, '') % ${query}
        OR coalesce(${toolsTable.secondaryCategory}, '') % ${query}
        OR coalesce(${toolsTable.summary}, '') % ${query}
        OR coalesce(${toolsTable.website}, '') % ${query}
      )
    `);
  }

  if (categories?.length) {
    // Filter by the dedicated category metadata values in raw_data.
    // When multiple categories are selected, apply AND semantics to narrow results.
    const normalizedCategories = categories.map((c) => c.trim()).filter(Boolean);
    if (normalizedCategories.length > 0) {
      const categoryPattern = `\\[(?:${CATEGORY_FILTER_QUESTION_CODES.join("|")})\\]\\s*$`;
      const categoryClauses = normalizedCategories.map(
        (category) => sql`EXISTS (
          SELECT 1
          FROM jsonb_each_text(${toolsTable.rawData}) AS _t(_k, _v)
          WHERE _k ~ ${categoryPattern}
            AND EXISTS (
              SELECT 1
              FROM regexp_split_to_table(_v, '\\s*[;,]\\s*') AS _split(item)
              WHERE lower(trim(item)) = lower(${category})
            )
        )`,
      );
      conditions.push(sql`${sql.join(categoryClauses, sql` AND `)}`);
    }
  }

  const orderClause = (() => {
    switch (sortBy) {
      case "name":
        return asc(toolsTable.name);
      case "category":
        return asc(toolsTable.category);
      case "updated":
      default:
        return desc(toolsTable.updatedAt);
    }
  })();

  const rows = await db
    .select()
    .from(toolsTable)
    .where(and(...conditions))
    .orderBy(orderClause);

  return rows.map(mapToolRow);
});

export const getToolBySlug = cache(async (slug: string) => {
  const [tool] = await db
    .select()
    .from(toolsTable)
    .where(eq(toolsTable.slug, slug))
    .limit(1);
  return tool ? mapToolRow(tool) : null;
});

export const getReportByTool = cache(
  async (toolId: string): Promise<ReportMetadata | null> => {
    const [report] = await db
      .select()
      .from(reportMetadataTable)
      .where(eq(reportMetadataTable.id, toolId))
      .orderBy(asc(reportMetadataTable.updatedAt))
      .limit(1);
    return report ? mapReportRow(report) : null;
  },
);

export const getComparisonDataset = cache(async (ids: string[]): Promise<Tool[]> => {
  if (!ids.length) return [];
  const rows = await db.select().from(toolsTable).where(inArray(toolsTable.id, ids));
  return rows.map(mapToolRow);
});

/** Returns admin-enabled values from the category metadata questions. */
export async function getAvailableCategories(): Promise<string[]> {
  return getSearchFilterCategories();
}

export async function revalidateToolsTag(ids?: string[]) {
  revalidatePath("/tools");
  if (ids?.length) {
    revalidatePath(`/compare?ids=${ids.join(",")}`);
  }
}

function mapToolRow(row: typeof toolsTable.$inferSelect): Tool {
  const metadata = (row.metadata as Record<string, unknown>) ?? {};

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    vendor: row.vendor ?? "",
    category: row.category ?? "",
    secondaryCategory: row.secondaryCategory ?? undefined,
    summary: row.summary ?? "",
    website: row.website ?? "",
    logoUrl: undefined, // logoUrl not in new schema
    tags: (row.highlights as string[]) ?? [],
    features: (row.highlights as string[]) ?? [],
    stats: {
      ...extractStats(metadata),
    },
    metadata,
    capabilities: (row.capabilities as Record<string, unknown>) ?? undefined,
    comparisonData: (row.comparisonData as Record<string, unknown>) ?? undefined,
    rawData: (row.rawData as Record<string, unknown>) ?? undefined,
    featureScore: (row.featureScore as Record<string, number>) ?? undefined,
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
    isFeatured: row.isFeatured ?? false,
  };
}

function mapReportRow(row: typeof reportMetadataTable.$inferSelect): ReportMetadata {
  const previewData = (row.previewData as Record<string, unknown>) ?? {};
  const keyFindings = normalizeReportKeyFindings(row.keyFindings);
  const highlights: ReportMetadata["highlights"] = keyFindings.map((finding) => ({
    label: finding.headline,
    detail: finding.text,
  }));

  // Merge PDF metadata into previewData
  const metadata = {
    ...previewData,
    pdfFilename: row.pdfFilename ?? undefined,
    pdfSize: row.pdfSize ?? undefined,
    pdfUploadedAt: row.pdfUploadedAt?.toISOString() ?? undefined,
  } as ReportMetadata["metadata"];

  return {
    id: row.id,
    toolId: "", // toolId not in new schema - reports are standalone
    title: row.title,
    pdfUrl: row.pdfUrl ?? undefined,
    highlights,
    metadata,
  };
}

function extractStats(
  metadata: Record<string, unknown>,
): Pick<Tool["stats"], "customers" | "coverage" | "contracts"> {
  const rawStats = (metadata as { stats?: unknown }).stats;

  if (!rawStats || typeof rawStats !== "object") {
    return { customers: 0, coverage: 0, contracts: 0 };
  }

  const stats = rawStats as Record<string, unknown>;

  return {
    customers: normalizeNonNegativeInteger(stats.customers),
    coverage: normalizeCoverage(stats.coverage),
    contracts: normalizeNonNegativeInteger(stats.contracts),
  };
}

function normalizeNonNegativeInteger(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.round(Math.max(0, numeric));
}

function normalizeCoverage(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  if (numeric <= 0) return 0;
  if (numeric >= 1) return 1;
  return Number(numeric.toFixed(4));
}
