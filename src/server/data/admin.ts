import "server-only";

import { count, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/server/db";
import { reportMetadata, toolVersions, tools } from "@/server/db/schema";

export const getAdminSummary = cache(async () => {
  const [toolCount] = await db.select({ value: count() }).from(tools);
  const [versionCount] = await db.select({ value: count() }).from(toolVersions);
  const [reportCount] = await db.select({ value: count() }).from(reportMetadata);

  const [latestVersion] = await db
    .select({
      toolName: tools.name,
      updatedAt: toolVersions.createdAt,
      versionTag: toolVersions.versionTag,
    })
    .from(toolVersions)
    .leftJoin(tools, toolVersions.toolId.eq(tools.id))
    .orderBy(sql`${toolVersions.createdAt} desc`)
    .limit(1);

  return {
    toolCount: toolCount?.value ?? 0,
    versionCount: versionCount?.value ?? 0,
    reportCount: reportCount?.value ?? 0,
    latestVersion,
  };
});
