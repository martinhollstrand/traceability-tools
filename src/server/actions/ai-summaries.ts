"use server";

import { revalidatePath } from "next/cache";
import { and, eq, or, isNull, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { toolsTable } from "@/server/db/schema";
import { generateToolSummary } from "@/server/ai/summary";
import { requireAdminSession } from "@/server/auth/session";

export type RegenerateResult = {
  success: boolean;
  error?: string;
  summary?: string;
};

export async function regenerateToolSummaryAction(
  toolId: string,
): Promise<RegenerateResult> {
  await requireAdminSession();

  const [tool] = await db
    .select({
      id: toolsTable.id,
      name: toolsTable.name,
      rawData: toolsTable.rawData,
    })
    .from(toolsTable)
    .where(eq(toolsTable.id, toolId))
    .limit(1);

  if (!tool) {
    return { success: false, error: "Tool not found" };
  }

  const rawData = (tool.rawData as Record<string, unknown>) ?? {};
  const summary = await generateToolSummary(tool.name, rawData);

  if (!summary) {
    return {
      success: false,
      error: "AI generation returned no result — check that AI is configured.",
    };
  }

  await db
    .update(toolsTable)
    .set({ summary, updatedAt: new Date() })
    .where(eq(toolsTable.id, toolId));

  revalidatePath("/tools");
  revalidatePath("/");
  revalidatePath("/compare");
  return { success: true, summary };
}

export type SummaryStats = {
  total: number;
  withSummary: number;
  withoutSummary: number;
  tools: Array<{
    id: string;
    name: string;
    hasSummary: boolean;
  }>;
};

export async function getToolSummaryStats(): Promise<SummaryStats> {
  await requireAdminSession();

  const rows = await db
    .select({
      id: toolsTable.id,
      name: toolsTable.name,
      summary: toolsTable.summary,
    })
    .from(toolsTable)
    .where(eq(toolsTable.status, "published"));

  const tools = rows.map((row) => ({
    id: row.id,
    name: row.name,
    hasSummary: Boolean(row.summary?.trim()),
  }));

  tools.sort((a, b) => {
    if (a.hasSummary !== b.hasSummary) return a.hasSummary ? 1 : -1;
    return a.name.localeCompare(b.name);
  });

  return {
    total: tools.length,
    withSummary: tools.filter((t) => t.hasSummary).length,
    withoutSummary: tools.filter((t) => !t.hasSummary).length,
    tools,
  };
}

export async function regenerateMissingSummariesAction(): Promise<{
  generated: number;
  failed: number;
  total: number;
}> {
  await requireAdminSession();

  const rows = await db
    .select({
      id: toolsTable.id,
      name: toolsTable.name,
      rawData: toolsTable.rawData,
    })
    .from(toolsTable)
    .where(
      and(
        eq(toolsTable.status, "published"),
        or(isNull(toolsTable.summary), sql`trim(${toolsTable.summary}) = ''`),
      ),
    );

  let generated = 0;
  let failed = 0;

  for (const tool of rows) {
    const rawData = (tool.rawData as Record<string, unknown>) ?? {};
    const summary = await generateToolSummary(tool.name, rawData);

    if (summary) {
      await db
        .update(toolsTable)
        .set({ summary, updatedAt: new Date() })
        .where(eq(toolsTable.id, tool.id));
      generated++;
    } else {
      failed++;
    }
  }

  revalidatePath("/tools");
  revalidatePath("/");
  revalidatePath("/compare");

  return { generated, failed, total: rows.length };
}
