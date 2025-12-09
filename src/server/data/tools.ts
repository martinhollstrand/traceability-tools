import "server-only";

import { and, asc, desc, eq, ilike, inArray } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/server/db";
import { reportMetadataTable, toolsTable } from "@/server/db/schema";
import { revalidatePath } from "next/cache";
import type { Tool } from "@/lib/validators/tool";
import type { ReportMetadata } from "@/lib/validators/report";

type ToolFilters = {
  query?: string;
  categories?: string[];
  tags?: string[];
};

export const listTools = cache(async (filters: ToolFilters = {}): Promise<Tool[]> => {
  const { query, categories, tags } = filters;
  const conditions = [eq(toolsTable.status, "published")];

  if (query) {
    conditions.push(ilike(toolsTable.name, `%${query}%`));
  }

  if (categories?.length) {
    conditions.push(inArray(toolsTable.category, categories));
  }

  const rows = await db
    .select()
    .from(toolsTable)
    .where(and(...conditions))
    .orderBy(desc(toolsTable.updatedAt));

  const normalized = rows.map(mapToolRow);

  if (!tags?.length) {
    return normalized;
  }

  return normalized.filter((row) => {
    const featureList = Array.isArray(row.features) ? row.features : [];
    return tags.every((tag) => featureList.includes(tag));
  });
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
    featureScore: (row.featureScore as Record<string, number>) ?? undefined,
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
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
