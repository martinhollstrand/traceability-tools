import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { toolCategoriesTable, toolsTable } from "@/server/db/schema";
import {
  PRIMARY_CATEGORY_QUESTION_CODE,
  SECONDARY_CATEGORY_QUESTION_CODE,
} from "@/server/data/tool-fields";

const QUESTION_CODE_REGEX = /\[(\d{3})\]\s*$/;

export const CATEGORY_FILTER_QUESTION_CODES = [
  PRIMARY_CATEGORY_QUESTION_CODE,
  SECONDARY_CATEGORY_QUESTION_CODE,
] as const;

export type ToolCategorySetting = {
  id: string;
  name: string;
  showInSearchFilter: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
};

function getValueForQuestionCode(
  rawData: Record<string, unknown> | null,
  code: string,
): string | null {
  if (!rawData) return null;

  for (const [key, value] of Object.entries(rawData)) {
    const match = key.match(QUESTION_CODE_REGEX);
    if (match?.[1] !== code) continue;
    if (value === undefined || value === null || value === "") continue;
    return String(value).trim();
  }

  return null;
}

function splitCategoryValues(value: string): string[] {
  return value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

async function collectPublishedCategoryUsage(): Promise<Map<string, number>> {
  const rows = await db
    .select({ rawData: toolsTable.rawData })
    .from(toolsTable)
    .where(eq(toolsTable.status, "published"));

  const usageCounts = new Map<string, number>();

  for (const row of rows) {
    const rawData = (row.rawData as Record<string, unknown>) ?? null;
    const categoriesForTool = new Set<string>();

    for (const questionCode of CATEGORY_FILTER_QUESTION_CODES) {
      const value = getValueForQuestionCode(rawData, questionCode);
      if (!value) continue;

      for (const category of splitCategoryValues(value)) {
        categoriesForTool.add(category);
      }
    }

    for (const category of categoriesForTool) {
      usageCounts.set(category, (usageCounts.get(category) ?? 0) + 1);
    }
  }

  return usageCounts;
}

async function syncToolCategories(usageCounts: Map<string, number>): Promise<void> {
  const currentCategoryNames = Array.from(usageCounts.keys());
  if (currentCategoryNames.length === 0) return;

  const existingRows = await db
    .select({ name: toolCategoriesTable.name })
    .from(toolCategoriesTable);
  const existingNames = new Set(existingRows.map((row) => row.name));

  const missingNames = currentCategoryNames.filter((name) => !existingNames.has(name));
  if (missingNames.length === 0) return;

  await db
    .insert(toolCategoriesTable)
    .values(
      missingNames.map((name) => ({
        name,
        showInSearchFilter: true,
      })),
    )
    .onConflictDoNothing({ target: toolCategoriesTable.name });
}

export async function listToolCategorySettings(): Promise<ToolCategorySetting[]> {
  const usageCounts = await collectPublishedCategoryUsage();
  await syncToolCategories(usageCounts);

  const rows = await db
    .select()
    .from(toolCategoriesTable)
    .orderBy(asc(toolCategoriesTable.name));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    showInSearchFilter: row.showInSearchFilter,
    usageCount: usageCounts.get(row.name) ?? 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

export async function getSearchFilterCategories(): Promise<string[]> {
  const usageCounts = await collectPublishedCategoryUsage();
  const currentCategoryNames = Array.from(usageCounts.keys());
  if (currentCategoryNames.length === 0) return [];

  const rows = await db
    .select({
      name: toolCategoriesTable.name,
      showInSearchFilter: toolCategoriesTable.showInSearchFilter,
    })
    .from(toolCategoriesTable);

  const hiddenCategoryNames = new Set(
    rows.filter((row) => !row.showInSearchFilter).map((row) => row.name),
  );

  return currentCategoryNames
    .filter((name) => !hiddenCategoryNames.has(name))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}
