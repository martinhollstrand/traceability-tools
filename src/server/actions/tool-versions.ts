"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { read, utils } from "xlsx";
import { getDb } from "@/server/db";
import { toolVersionsTable, toolsTable } from "@/server/db/schema";
import { requireAdminSession } from "@/server/auth/session";
import { generateToolSummary } from "@/server/ai/summary";

const uploadSchema = z.object({
  filename: z.string().min(1, "Filnamn saknas"),
  rowCount: z.coerce.number().nonnegative(),
  columns: z
    .string()
    .transform((value) => (value ? (JSON.parse(value) as string[]) : [])),
  regenerateAi: z.enum(["true", "false"]).transform((v) => v === "true"),
});

export type UploadExcelState = {
  success: boolean;
  error?: string;
};

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

function normalizeKey(key: string) {
  return key
    .trim()
    .toLowerCase()
    .replace(/[:\r\n]+$/, "");
}

// Function to find value in row with fuzzy key matching
function getValue(row: Record<string, unknown>, targetKeys: string[]): string {
  const normalizedRow = Object.keys(row).reduce(
    (acc, key) => {
      acc[normalizeKey(key)] = String(row[key] ?? "");
      return acc;
    },
    {} as Record<string, string>,
  );

  for (const key of targetKeys) {
    const val = normalizedRow[normalizeKey(key)];
    if (val) return val;
  }
  return "";
}

export async function uploadExcelAction(
  _prev: UploadExcelState,
  formData: FormData,
): Promise<UploadExcelState> {
  await requireAdminSession();

  const raw = {
    filename: formData.get("filename"),
    rowCount: formData.get("rowCount"),
    columns: formData.get("columns"),
    regenerateAi: formData.get("regenerateAi") ?? "false",
  };

  const parsed = uploadSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return { success: false, error: "Bifoga Excel-fil" };
  }

  try {
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: "",
    });

    const db = getDb();

    // Create version record
    const [version] = await db
      .insert(toolVersionsTable)
      .values({
        label: parsed.data.filename,
        status: "processing",
        columnCount: parsed.data.columns.length,
        rowCount: rows.length,
        columnMappings: parsed.data.columns.reduce(
          (acc, column) => ({ ...acc, [column]: column }),
          {},
        ),
        metadata: {
          previewColumns: parsed.data.columns,
        },
      })
      .returning();

    // Fetch existing tools to map by importId and slug
    const existingTools = await db.select().from(toolsTable);
    const toolMapById = new Map<string, (typeof existingTools)[0]>();
    const toolMapBySlug = new Map<string, (typeof existingTools)[0]>();
    const createdSlugsInBatch = new Set<string>(); // Track slugs created in this batch

    for (const tool of existingTools) {
      const importId = (tool.metadata as Record<string, unknown> | null)?.importId;
      if (importId) {
        toolMapById.set(String(importId), tool);
      }
      if (tool.slug) {
        toolMapBySlug.set(tool.slug, tool);
      }
    }

    let updatedCount = 0;
    let createdCount = 0;

    for (const row of rows) {
      const rowId = String(row["ID"] || row["id"] || "");
      if (!rowId) continue;

      const name = getValue(row, ["Tool name", "Name", "name"]) || "Untitled Tool";
      const slug = slugify(name);

      // Try to match by ID first, then by slug
      let existingTool = toolMapById.get(rowId);
      if (!existingTool && slug) {
        existingTool = toolMapBySlug.get(slug);
      }

      let summary = getValue(row, ["Summary", "summary", "Description"]);

      // AI Summary Logic:
      // 1. If explicit summary in Excel -> Use it (already set above)
      // 2. If NO Excel summary:
      //    a. If existing tool has summary AND NOT regenerateAi -> Use existing
      //    b. Else (new tool OR existing has no summary OR regenerateAi) -> Generate AI
      if (!summary && process.env.AI_GATEWAY_API_KEY) {
        const shouldGenerate =
          !existingTool?.summary || // New tool or empty existing summary
          parsed.data.regenerateAi; // Force regenerate flag

        if (shouldGenerate) {
          const aiSummary = await generateToolSummary(name, row);
          if (aiSummary) {
            summary = aiSummary;
          }
        } else if (existingTool?.summary) {
          // Preserve existing summary if not regenerating
          summary = existingTool.summary;
        }
      }

      // Determine comparison data
      // Rule: Keys not in core fields and keys with explicit prefix "Compare: "
      const coreFields = new Set([
        "id",
        "importid",
        "tool name",
        "name",
        "vendor",
        "provider",
        "summary",
        "description",
        "category",
        "type",
        "website",
        "url",
        // Ignored metadata
        "start time",
        "completion time",
        "last modified time",
        "email",
      ]);

      const comparisonData: Record<string, unknown> = {};

      Object.entries(row).forEach(([key, value]) => {
        const lowerKey = normalizeKey(key);
        // Clean value: skip empty strings or pure whitespace
        if (value === "" || value === null || value === undefined) return;

        // Check for explicit prefix
        if (lowerKey.startsWith("compare:") || lowerKey.startsWith("comp:")) {
          // Remove prefix for clean key
          const cleanKey = key.replace(/^(Compare|Comp|compare|comp):\s*/i, "");
          comparisonData[cleanKey] = value;
          return;
        }

        // Check if not core field
        if (!coreFields.has(lowerKey)) {
          comparisonData[key] = value;
        }
      });

      const toolData = {
        name,
        // slug is handled conditionally
        vendor: getValue(row, ["Vendor", "vendor", "Provider"]),
        summary,
        category: getValue(row, ["Category", "category", "Type"]),
        website: getValue(row, ["Website", "website", "URL"]),
        status: "published" as const,
        rawData: row,
        comparisonData,
        metadata: {
          importId: rowId,
          ...row,
        },
        updatedAt: new Date(),
        versionId: version.id,
      };

      // Try to match by ID first, then by slug
      // Note: We already looked up existingTool above for logic checks
      // let existingTool = toolMapById.get(rowId);
      // if (!existingTool && slug) {
      //   existingTool = toolMapBySlug.get(slug);
      // }

      if (existingTool) {
        await db
          .update(toolsTable)
          .set({
            ...toolData,
            slug: existingTool.slug, // Preserve existing slug
            createdAt: existingTool.createdAt,
          })
          .where(eq(toolsTable.id, existingTool.id));
        updatedCount++;
      } else {
        // For new tools, handle potential slug collisions
        let uniqueSlug = slug;
        let suffix = 1;
        while (toolMapBySlug.has(uniqueSlug) || createdSlugsInBatch.has(uniqueSlug)) {
          uniqueSlug = `${slug}-${suffix}`;
          suffix++;
        }

        await db.insert(toolsTable).values({
          ...toolData,
          slug: uniqueSlug,
        });

        // Track this slug to prevent collisions within the same import batch
        createdSlugsInBatch.add(uniqueSlug);

        createdCount++;
      }
    }

    // Update version status
    await db
      .update(toolVersionsTable)
      .set({
        status: "ready",
        isActive: true,
        metadata: {
          ...(version.metadata as Record<string, unknown>),
          updatedCount,
          createdCount,
        },
      })
      .where(eq(toolVersionsTable.id, version.id));

    revalidatePath("/admin");
    revalidatePath("/admin/data");
    revalidatePath("/admin/versions");

    return { success: true };
  } catch (error) {
    console.error("Import error:", error);
    return {
      success: false,
      error: (error as Error).message ?? "Kunde inte spara versionen",
    };
  }
}

const activateSchema = z.object({
  versionId: z.string().min(1),
});

export async function activateVersionAction(formData: FormData) {
  await requireAdminSession();
  const parsed = activateSchema.safeParse({ versionId: formData.get("versionId") });
  if (!parsed.success) {
    return;
  }

  try {
    const db = getDb();
    await db.update(toolVersionsTable).set({ isActive: false });
    await db
      .update(toolVersionsTable)
      .set({ isActive: true, status: "ready" })
      .where(eq(toolVersionsTable.id, parsed.data.versionId));

    revalidatePath("/admin");
    revalidatePath("/admin/versions");
  } catch (error) {
    console.error(error);
  }
}
