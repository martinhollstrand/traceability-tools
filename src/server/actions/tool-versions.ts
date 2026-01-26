"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createHash } from "crypto";
import { read, utils } from "xlsx";
import { getDb } from "@/server/db";
import { toolVersionsTable, toolsTable, surveyQuestionsTable } from "@/server/db/schema";
import { requireAdminSession } from "@/server/auth/session";
import { generateToolSummary } from "@/server/ai/summary";

// Regex to match question codes like [001], [002], etc.
const QUESTION_CODE_REGEX = /\[(\d{3})\]\s*$/;

// Type definitions for question type and mapped field
type QuestionType = "metadata" | "survey";
type MappedField = "name" | "vendor" | "website" | "category" | null;

// Patterns to auto-detect metadata questions based on question text
const METADATA_PATTERNS: Array<{ pattern: RegExp; field: MappedField }> = [
  { pattern: /\b(tool\s*name|name\s*of.*tool|product\s*name)\b/i, field: "name" },
  { pattern: /\b(vendor|company|provider|manufacturer|supplier)\b/i, field: "vendor" },
  { pattern: /\b(website|web\s*address|url|homepage|web\s*page)\b/i, field: "website" },
  { pattern: /\b(category|main\s*focus|type|classification)\b/i, field: "category" },
];

/**
 * Detect if a question text indicates a metadata field.
 * Returns the mapped field if detected, null otherwise.
 */
function detectMetadataField(questionText: string): MappedField {
  for (const { pattern, field } of METADATA_PATTERNS) {
    if (pattern.test(questionText)) {
      return field;
    }
  }
  return null;
}

/**
 * Parse a column header to extract question code and text.
 * Format: "Question text [XXX]" where XXX is the unique code.
 * Returns null if the header doesn't match the pattern.
 */
function parseQuestionHeader(header: string): {
  code: string;
  text: string;
  questionType: QuestionType;
  mappedField: MappedField;
} | null {
  const match = header.match(QUESTION_CODE_REGEX);
  if (!match) return null;

  const code = match[1];
  const text = header.replace(QUESTION_CODE_REGEX, "").trim();

  // Auto-detect if this is a metadata field
  const mappedField = detectMetadataField(text);
  const questionType: QuestionType = mappedField ? "metadata" : "survey";

  return { code, text, questionType, mappedField };
}

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

function extractWebDomain(input: string): string {
  const raw = input.trim();
  if (!raw) return "";

  // Some sheets may contain multiple links; pick the first plausible token.
  const token =
    raw
      .split(/[\s,;]+/)
      .map((t) => t.trim())
      .find((t) => t.includes(".")) ?? "";
  if (!token) return "";

  const withProtocol = /^https?:\/\//i.test(token) ? token : `https://${token}`;
  try {
    const url = new URL(withProtocol);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return host;
  } catch {
    return "";
  }
}

function deriveImportId(row: Record<string, unknown>): string {
  // Prefer explicit IDs if present (some sheets/files don't have them).
  const explicit = getValue(row, [
    "ID",
    "Id",
    "Import ID",
    "ImportId",
    "Tool ID",
    "ToolId",
    "tool_id",
  ]).trim();
  if (explicit) return explicit;

  // Deterministic fallback for files without IDs (like TraceabilitytoolsmappingV2.xlsx).
  // Keep it stable across repeated imports so we can update existing tools.
  const company = getValue(row, ["Company", "Vendor", "Provider"]).trim().toLowerCase();
  const name = getValue(row, ["Tool name", "Name", "name"]).trim().toLowerCase();
  const domain = extractWebDomain(getValue(row, ["Web", "Website", "URL"]));

  // Base identity: company + tool name. If we can extract a domain, add it to reduce collisions.
  const key = domain ? `${company}|${name}|${domain}` : `${company}|${name}`;
  if (key === "|" || key.replaceAll("|", "") === "") return "";

  // Short, stable id (hex) – enough entropy for our dataset and easy to read.
  return createHash("sha256").update(key).digest("hex").slice(0, 16);
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

    // Extract and upsert survey questions from column headers
    const questionHeaders = parsed.data.columns
      .map((col) => ({ original: col, parsed: parseQuestionHeader(col) }))
      .filter((q) => q.parsed !== null) as Array<{
      original: string;
      parsed: {
        code: string;
        text: string;
        questionType: QuestionType;
        mappedField: MappedField;
      };
    }>;

    // Create mappings for later use during tool processing
    const columnToQuestionCode = new Map<string, string>();
    const codeToQuestion = new Map<
      string,
      {
        questionType: QuestionType;
        mappedField: MappedField;
        original: string;
      }
    >();

    for (const { original, parsed: question } of questionHeaders) {
      columnToQuestionCode.set(original, question.code);

      // Upsert the question: if code exists, update text; otherwise insert
      const existingQuestion = await db
        .select()
        .from(surveyQuestionsTable)
        .where(eq(surveyQuestionsTable.code, question.code))
        .limit(1);

      if (existingQuestion.length > 0) {
        // Update the question text if it changed
        // Preserve existing forComparison, supportiveText, questionType and mappedField
        // (admin may have overridden the auto-detected values)
        await db
          .update(surveyQuestionsTable)
          .set({
            questionText: question.text,
            sortOrder: question.code,
            updatedAt: new Date(),
          })
          .where(eq(surveyQuestionsTable.code, question.code));

        // Use existing question's type/mapping (admin may have changed it)
        codeToQuestion.set(question.code, {
          questionType: existingQuestion[0].questionType as QuestionType,
          mappedField: existingQuestion[0].mappedField as MappedField,
          original,
        });
      } else {
        // Insert new question with auto-detected type and mapping
        await db.insert(surveyQuestionsTable).values({
          code: question.code,
          questionText: question.text,
          questionType: question.questionType,
          mappedField: question.mappedField,
          forComparison: false,
          sortOrder: question.code,
          versionId: version.id,
        });

        codeToQuestion.set(question.code, {
          questionType: question.questionType,
          mappedField: question.mappedField,
          original,
        });
      }
    }

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
    let skippedCount = 0;

    for (const row of rows) {
      const rowId = deriveImportId(row);
      if (!rowId) {
        skippedCount++;
        continue;
      }

      // Build tool field values from metadata questions first
      const toolFieldsFromQuestions: Record<string, string> = {
        name: "",
        vendor: "",
        website: "",
        category: "",
      };

      // Process each column to extract metadata field values
      for (const [columnName, value] of Object.entries(row)) {
        if (value === "" || value === null || value === undefined) continue;

        const questionCode = columnToQuestionCode.get(columnName);
        if (questionCode) {
          const questionInfo = codeToQuestion.get(questionCode);
          if (questionInfo?.questionType === "metadata" && questionInfo.mappedField) {
            toolFieldsFromQuestions[questionInfo.mappedField] = String(value);
          }
        }
      }

      // Fall back to fuzzy matching for fields not mapped via questions
      const name =
        toolFieldsFromQuestions.name ||
        getValue(row, ["Tool name", "Name", "name"]) ||
        "Untitled Tool";
      const vendor =
        toolFieldsFromQuestions.vendor ||
        getValue(row, ["Company", "Vendor", "vendor", "Provider"]);
      const website =
        toolFieldsFromQuestions.website ||
        getValue(row, ["Web", "Website", "website", "URL"]);
      const category =
        toolFieldsFromQuestions.category ||
        getValue(row, ["Main focus/category", "Category", "category", "Type"]);

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

      // Determine comparison data - only include survey type questions
      // Also respect legacy core fields for backward compatibility
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

        // Check if this column is a question with a code
        const questionCode = columnToQuestionCode.get(key);
        if (questionCode) {
          const questionInfo = codeToQuestion.get(questionCode);
          // Only include survey questions in comparison data, skip metadata
          if (questionInfo?.questionType === "metadata") {
            return;
          }
          // Include survey questions in comparison data
          comparisonData[key] = value;
          return;
        }

        // Check for explicit prefix (legacy support)
        if (lowerKey.startsWith("compare:") || lowerKey.startsWith("comp:")) {
          const cleanKey = key.replace(/^(Compare|Comp|compare|comp):\s*/i, "");
          comparisonData[cleanKey] = value;
          return;
        }

        // Check if not core field (legacy support for columns without codes)
        if (!coreFields.has(lowerKey)) {
          comparisonData[key] = value;
        }
      });

      const toolData = {
        name,
        vendor,
        summary,
        category,
        website,
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
          skippedCount,
          questionsCount: questionHeaders.length,
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
