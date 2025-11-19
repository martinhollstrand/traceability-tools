import "server-only";

import { count, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/server/db";
import { reportMetadataTable, toolVersionsTable, toolsTable } from "@/server/db/schema";

export const getAdminSummary = cache(async () => {
  const [toolCount] = await db.select({ value: count() }).from(toolsTable);
  const [versionCount] = await db.select({ value: count() }).from(toolVersionsTable);
  const [reportCount] = await db.select({ value: count() }).from(reportMetadataTable);

  const [latestVersion] = await db
    .select({
      toolName: toolsTable.name,
      updatedAt: toolVersionsTable.createdAt,
      versionTag: toolVersionsTable.label,
    })
    .from(toolVersionsTable)
    .leftJoin(toolsTable, eq(toolVersionsTable.id, toolsTable.versionId))
    .orderBy(desc(toolVersionsTable.createdAt))
    .limit(1);

  return {
    toolCount: toolCount?.value ?? 0,
    versionCount: versionCount?.value ?? 0,
    reportCount: reportCount?.value ?? 0,
    latestVersion,
  };
});

export const getDashboardSummary = cache(async () => {
  const [totalTools] = await db.select({ value: count() }).from(toolsTable);
  const [publishedTools] = await db
    .select({ value: count() })
    .from(toolsTable)
    .where(eq(toolsTable.status, "published"));
  const [featuredTools] = await db
    .select({ value: count() })
    .from(toolsTable)
    .where(eq(toolsTable.isFeatured, true));

  const [activeVersion] = await db
    .select({
      id: toolVersionsTable.id,
      label: toolVersionsTable.label,
      importedAt: toolVersionsTable.importedAt,
    })
    .from(toolVersionsTable)
    .where(eq(toolVersionsTable.isActive, true))
    .orderBy(desc(toolVersionsTable.importedAt))
    .limit(1);

  return {
    totalTools: totalTools?.value ?? 0,
    publishedTools: publishedTools?.value ?? 0,
    featuredTools: featuredTools?.value ?? 0,
    activeVersion: activeVersion?.label ?? null,
    lastImport: activeVersion?.importedAt?.toISOString() ?? null,
  };
});

export const listToolVersions = cache(async (limit: number = 20) => {
  const versions = await db
    .select({
      id: toolVersionsTable.id,
      label: toolVersionsTable.label,
      status: toolVersionsTable.status,
      rowCount: toolVersionsTable.rowCount,
      columnCount: toolVersionsTable.columnCount,
      isActive: toolVersionsTable.isActive,
      importedAt: toolVersionsTable.importedAt,
    })
    .from(toolVersionsTable)
    .orderBy(desc(toolVersionsTable.importedAt))
    .limit(limit);

  return versions;
});
