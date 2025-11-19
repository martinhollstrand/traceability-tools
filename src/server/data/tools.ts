import "server-only";

import { and, asc, desc, eq, ilike, inArray } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/server/db";
import { reportMetadata, tools } from "@/server/db/schema";
import { CACHE_TAGS } from "@/lib/constants";
import { revalidateTag } from "next/cache";
import type { Tool } from "@/lib/validators/tool";
import type { ReportMetadata } from "@/lib/validators/report";

type ToolFilters = {
  query?: string;
  categories?: string[];
  tags?: string[];
};

export const listTools = cache(async (filters: ToolFilters = {}): Promise<Tool[]> => {
  const { query, categories, tags } = filters;
  const conditions = [eq(tools.isActive, true)];

  if (query) {
    conditions.push(ilike(tools.name, `%${query}%`));
  }

  if (categories?.length) {
    conditions.push(inArray(tools.category, categories));
  }

  const rows = await db
    .select()
    .from(tools)
    .where(and(...conditions))
    .orderBy(desc(tools.updatedAt));

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
  const [tool] = await db.select().from(tools).where(eq(tools.slug, slug)).limit(1);
  return tool ? mapToolRow(tool) : null;
});

export const getReportByTool = cache(
  async (toolId: string): Promise<ReportMetadata | null> => {
    const [report] = await db
      .select()
      .from(reportMetadata)
      .where(eq(reportMetadata.toolId, toolId))
      .orderBy(asc(reportMetadata.updatedAt))
      .limit(1);
    return report ? mapReportRow(report) : null;
  },
);

export const getComparisonDataset = cache(async (ids: string[]): Promise<Tool[]> => {
  if (!ids.length) return [];
  const rows = await db.select().from(tools).where(inArray(tools.id, ids));
  return rows.map(mapToolRow);
});

export async function revalidateToolsTag(ids?: string[]) {
  revalidateTag(ids?.length ? CACHE_TAGS.comparison(ids) : CACHE_TAGS.tools);
}

function mapToolRow(row: typeof tools.$inferSelect): Tool {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    vendor: row.vendor,
    category: row.category,
    summary: row.summary,
    website: row.website,
    logoUrl: row.logoUrl ?? undefined,
    tags: (row.features as string[]) ?? [],
    features: (row.features as string[]) ?? [],
    stats: row.stats as Tool["stats"],
    metadata: row.metadata ?? undefined,
    updatedAt: row.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

function mapReportRow(row: typeof reportMetadata.$inferSelect): ReportMetadata {
  return {
    id: row.id,
    toolId: row.toolId,
    title: row.title,
    pdfUrl: row.pdfUrl ?? undefined,
    highlights: (row.highlights as ReportMetadata["highlights"]) ?? [],
    metadata: row.metadata ?? undefined,
  };
}
