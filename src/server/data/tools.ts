import "server-only";

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/server/db";
import { reportMetadataTable, toolsTable } from "@/server/db/schema";
import { revalidatePath } from "next/cache";
import type { Tool } from "@/lib/validators/tool";
import type { ReportMetadata } from "@/lib/validators/report";

/** Question code used for search/filter categories (e.g. "Main focus/category [004]"). */
const QUESTION_CODE_CATEGORY = "004";
const QUESTION_CODE_REGEX = /\[(\d{3})\]\s*$/;

function getValueForQuestionCode(
  comparisonData: Record<string, unknown> | null,
  code: string,
): string | null {
  if (!comparisonData) return null;
  for (const [key, value] of Object.entries(comparisonData)) {
    const match = key.match(QUESTION_CODE_REGEX);
    if (match?.[1] === code && value !== undefined && value !== null && value !== "") {
      return String(value).trim();
    }
  }
  return null;
}

type ToolFilters = {
  query?: string;
  categories?: string[];
  featured?: boolean;
};

export const listTools = cache(async (filters: ToolFilters = {}): Promise<Tool[]> => {
  const { query, categories, featured } = filters;
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
        OR coalesce(${toolsTable.summary}, '') ILIKE ${pattern}
        OR coalesce(${toolsTable.website}, '') ILIKE ${pattern}
        OR ${toolsTable.name} % ${query}
        OR coalesce(${toolsTable.vendor}, '') % ${query}
        OR coalesce(${toolsTable.category}, '') % ${query}
        OR coalesce(${toolsTable.summary}, '') % ${query}
        OR coalesce(${toolsTable.website}, '') % ${query}
      )
    `);
  }

  if (categories?.length) {
    // Filter by question 004 value (stored in raw_data; 004 is often metadata so not in comparison_data)
    const categoryPattern = `\\[${QUESTION_CODE_CATEGORY}\\]\\s*$`;
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM jsonb_each_text(${toolsTable.rawData}) AS _t(_k, _v)
        WHERE _k ~ ${categoryPattern}
        AND trim(_v) IN (${sql.join(
          categories.map((c) => sql`${c}`),
          sql`, `,
        )})
      )`,
    );
  }

  const rows = await db
    .select()
    .from(toolsTable)
    .where(and(...conditions))
    .orderBy(desc(toolsTable.updatedAt));

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

/** Returns distinct values from question 004 (used as search categories). Uses raw_data so 004 is included even when mapped as metadata. */
export const getAvailableCategories = cache(async (): Promise<string[]> => {
  const rows = await db
    .select({ rawData: toolsTable.rawData })
    .from(toolsTable)
    .where(eq(toolsTable.status, "published"));

  const categorySet = new Set<string>();
  for (const row of rows) {
    const value = getValueForQuestionCode(
      (row.rawData as Record<string, unknown>) ?? null,
      QUESTION_CODE_CATEGORY,
    );
    if (value) categorySet.add(value);
  }

  return Array.from(categorySet).sort();
});

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
  const keyFindings = (row.keyFindings as string[]) ?? [];
  // Transform string array to highlights format
  const highlights: ReportMetadata["highlights"] = keyFindings.map((finding) => {
    // Try to parse as "label: detail" format, or use the string as both
    const parts = finding.split(": ");
    return parts.length === 2
      ? { label: parts[0]!, detail: parts[1]! }
      : { label: finding, detail: finding };
  });

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
