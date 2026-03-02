import "server-only";

import { createHash } from "crypto";
import { and, eq, inArray, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { read, utils } from "xlsx";
import { z } from "zod";
import { generateToolSummary } from "@/server/ai/summary";
import { getDb } from "@/server/db";
import { surveyQuestionsTable, toolVersionsTable, toolsTable } from "@/server/db/schema";

// Regex to match question codes like [001], [002], etc.
const QUESTION_CODE_REGEX = /\[(\d{3})\]\s*$/;
const PRIMARY_CATEGORY_QUESTION_CODE = "004";
const SECONDARY_CATEGORY_QUESTION_CODE = "005";

type QuestionType = "metadata" | "survey";
type MappedField =
  | "name"
  | "vendor"
  | "website"
  | "category"
  | "secondary_category"
  | null;

// Order matters: more specific patterns are checked first.
const METADATA_PATTERNS: Array<{ pattern: RegExp; field: MappedField }> = [
  { pattern: /\b(tool\s*name|name\s*of.*tool|product\s*name)\b/i, field: "name" },
  { pattern: /\b(vendor|company|provider|manufacturer|supplier)\b/i, field: "vendor" },
  { pattern: /\b(website|web\s*address|url|homepage|web\s*page)\b/i, field: "website" },
];

const AI_SUMMARY_DEFAULT_CONCURRENCY = 4;
const AI_SUMMARY_MIN_CONCURRENCY = 1;
const AI_SUMMARY_MAX_CONCURRENCY = 8;

const uploadSchema = z.object({
  filename: z.string().min(1, "Filnamn saknas"),
  rowCount: z.coerce.number().nonnegative(),
  columns: z.string(),
  regenerateAi: z.enum(["true", "false"]),
});

export type ParsedUploadFormData = {
  filename: string;
  rowCount: number;
  columns: string[];
  regenerateAi: boolean;
  file: File;
};

type UploadParseResult =
  | { success: true; data: ParsedUploadFormData }
  | { success: false; error: string };

export type ToolImportProgressStage =
  | "preparing"
  | "questions"
  | "rows"
  | "archiving"
  | "finalizing"
  | "completed"
  | "failed";

export type ToolImportProgress = {
  stage: ToolImportProgressStage;
  message: string;
  versionId?: string;
  totalRows?: number;
  processedRows?: number;
  createdCount?: number;
  updatedCount?: number;
  skippedCount?: number;
  aiGeneratedCount?: number;
};

export type ToolImportResult = {
  versionId: string;
  totalRows: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  questionsCount: number;
  aiGeneratedCount: number;
};

type ImportProgressReporter = (event: ToolImportProgress) => Promise<void> | void;

type QuestionLookup = {
  questionType: QuestionType;
  mappedField: MappedField;
  original: string;
};

type DerivedRowFields = {
  name: string;
  vendor: string;
  website: string;
  category: string;
  secondaryCategory: string;
  excelSummary: string;
};

type AiSummaryCandidate = {
  index: number;
  rowNumber: number;
  name: string;
  row: Record<string, unknown>;
};

function isSecondaryCategory(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    /\b(2nd|secondary|sub)\s*categor/i.test(lower) ||
    (/\bcategor/i.test(lower) && /\b(secondary|2nd)\b/i.test(lower))
  );
}

function detectMetadataField(questionText: string): MappedField {
  for (const { pattern, field } of METADATA_PATTERNS) {
    if (pattern.test(questionText)) {
      return field;
    }
  }

  if (isSecondaryCategory(questionText)) {
    return "secondary_category";
  }
  if (/\b(category|main\s*focus|type|classification)\b/i.test(questionText)) {
    return "category";
  }

  return null;
}

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
  const mappedField = detectMetadataField(text);
  const questionType: QuestionType = mappedField ? "metadata" : "survey";

  return { code, text, questionType, mappedField };
}

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

function getValueByQuestionCode(row: Record<string, unknown>, code: string): string {
  for (const [key, value] of Object.entries(row)) {
    const match = key.match(QUESTION_CODE_REGEX);
    if (match?.[1] !== code) continue;

    const normalized = String(value ?? "").trim();
    if (normalized) return normalized;
  }
  return "";
}

function extractWebDomain(input: string): string {
  const raw = input.trim();
  if (!raw) return "";

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

  const company = getValue(row, ["Company", "Vendor", "Provider"]).trim().toLowerCase();
  const name = getValue(row, ["Tool name", "Name", "name"]).trim().toLowerCase();
  const domain = extractWebDomain(getValue(row, ["Web", "Website", "URL"]));

  const key = domain ? `${company}|${name}|${domain}` : `${company}|${name}`;
  if (key === "|" || key.replaceAll("|", "") === "") return "";

  return createHash("sha256").update(key).digest("hex").slice(0, 16);
}

function getAiSummaryConcurrency(): number {
  const raw = Number(
    process.env.IMPORT_AI_SUMMARY_CONCURRENCY ?? AI_SUMMARY_DEFAULT_CONCURRENCY,
  );
  if (!Number.isFinite(raw)) return AI_SUMMARY_DEFAULT_CONCURRENCY;

  const normalized = Math.trunc(raw);
  if (normalized < AI_SUMMARY_MIN_CONCURRENCY) return AI_SUMMARY_MIN_CONCURRENCY;
  if (normalized > AI_SUMMARY_MAX_CONCURRENCY) return AI_SUMMARY_MAX_CONCURRENCY;
  return normalized;
}

async function processWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, itemIndex: number) => Promise<void>,
) {
  if (items.length === 0) return;

  const workerCount = Math.min(Math.max(concurrency, 1), items.length);
  let currentIndex = 0;

  const runners = Array.from({ length: workerCount }, () =>
    (async () => {
      while (true) {
        const itemIndex = currentIndex;
        currentIndex++;
        if (itemIndex >= items.length) {
          return;
        }
        await worker(items[itemIndex], itemIndex);
      }
    })(),
  );

  await Promise.all(runners);
}

function deriveRowFields(
  row: Record<string, unknown>,
  columnToQuestionCode: Map<string, string>,
  codeToQuestion: Map<string, QuestionLookup>,
): DerivedRowFields {
  const toolFieldsFromQuestions: Record<string, string> = {
    name: "",
    vendor: "",
    website: "",
    category: "",
    secondary_category: "",
  };

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
    getValueByQuestionCode(row, PRIMARY_CATEGORY_QUESTION_CODE) ||
    getValue(row, ["Main focus/category", "Category", "category", "Type"]);
  const secondaryCategory =
    toolFieldsFromQuestions.secondary_category ||
    getValueByQuestionCode(row, SECONDARY_CATEGORY_QUESTION_CODE) ||
    getValue(row, ["2nd category", "Secondary category", "Subcategory", "Sub category"]);
  const excelSummary = getValue(row, ["Summary", "summary", "Description"]);

  return {
    name,
    vendor,
    website,
    category,
    secondaryCategory,
    excelSummary,
  };
}

async function emitProgress(
  reporter: ImportProgressReporter | undefined,
  event: ToolImportProgress,
) {
  if (!reporter) return;
  try {
    await reporter(event);
  } catch {
    // Progress reporting failures should never fail the import itself.
  }
}

function parseColumns(columnsRaw: string): string[] | null {
  try {
    const parsed = columnsRaw ? (JSON.parse(columnsRaw) as unknown) : [];
    if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function parseUploadFormData(formData: FormData): UploadParseResult {
  const parsed = uploadSchema.safeParse({
    filename: formData.get("filename"),
    rowCount: formData.get("rowCount"),
    columns: formData.get("columns"),
    regenerateAi: formData.get("regenerateAi") ?? "false",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Ogiltigt importunderlag",
    };
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return { success: false, error: "Bifoga Excel-fil" };
  }

  const columns = parseColumns(parsed.data.columns);
  if (!columns) {
    return { success: false, error: "Kolumnlistan kunde inte tolkas" };
  }

  return {
    success: true,
    data: {
      filename: parsed.data.filename,
      rowCount: parsed.data.rowCount,
      columns,
      regenerateAi: parsed.data.regenerateAi === "true",
      file,
    },
  };
}

export async function runToolVersionImport(
  payload: ParsedUploadFormData,
  options: { onProgress?: ImportProgressReporter } = {},
): Promise<ToolImportResult> {
  const db = getDb();
  const { onProgress } = options;
  let versionId: string | null = null;
  let versionMetadata: Record<string, unknown> = {};

  try {
    await emitProgress(onProgress, {
      stage: "preparing",
      message: "Läser filen och bygger arbetsblad...",
    });

    const buffer = await payload.file.arrayBuffer();
    const workbook = read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: "",
    });

    await emitProgress(onProgress, {
      stage: "preparing",
      message: `Arbetsblad "${sheetName}" läst. ${rows.length} rader hittades.`,
      totalRows: rows.length,
    });

    if (payload.regenerateAi && rows.length > 50) {
      await emitProgress(onProgress, {
        stage: "preparing",
        message:
          "AI-regenerering är aktiverad för många rader. Det kan ta flera minuter i serverless-miljö.",
        totalRows: rows.length,
      });
    }

    const [version] = await db
      .insert(toolVersionsTable)
      .values({
        label: payload.filename,
        status: "processing",
        columnCount: payload.columns.length,
        rowCount: rows.length,
        columnMappings: payload.columns.reduce(
          (acc, column) => ({ ...acc, [column]: column }),
          {},
        ),
        metadata: {
          previewColumns: payload.columns,
        },
      })
      .returning({
        id: toolVersionsTable.id,
        metadata: toolVersionsTable.metadata,
      });

    versionId = version.id;
    versionMetadata = (version.metadata as Record<string, unknown>) ?? {};

    await emitProgress(onProgress, {
      stage: "preparing",
      message: "Importversion skapad. Börjar tolka frågor och metadata-kolumner...",
      versionId,
      totalRows: rows.length,
    });

    const questionHeaders = payload.columns
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

    const columnToQuestionCode = new Map<string, string>();
    const codeToQuestion = new Map<string, QuestionLookup>();

    for (const { original, parsed: question } of questionHeaders) {
      columnToQuestionCode.set(original, question.code);

      const existingQuestion = await db
        .select()
        .from(surveyQuestionsTable)
        .where(eq(surveyQuestionsTable.code, question.code))
        .limit(1);

      if (existingQuestion.length > 0) {
        await db
          .update(surveyQuestionsTable)
          .set({
            questionText: question.text,
            sortOrder: question.code,
            updatedAt: new Date(),
          })
          .where(eq(surveyQuestionsTable.code, question.code));

        codeToQuestion.set(question.code, {
          questionType: existingQuestion[0].questionType as QuestionType,
          mappedField: existingQuestion[0].mappedField as MappedField,
          original,
        });
      } else {
        await db.insert(surveyQuestionsTable).values({
          code: question.code,
          questionText: question.text,
          questionType: question.questionType,
          mappedField: question.mappedField,
          forComparison: false,
          sortOrder: question.code,
          versionId,
        });

        codeToQuestion.set(question.code, {
          questionType: question.questionType,
          mappedField: question.mappedField,
          original,
        });
      }
    }

    await emitProgress(onProgress, {
      stage: "questions",
      message: `${questionHeaders.length} frågor synkade. Börjar bearbeta verktygsrader...`,
      versionId,
      totalRows: rows.length,
      processedRows: 0,
    });

    const existingTools = await db.select().from(toolsTable);
    const toolMapById = new Map<string, (typeof existingTools)[0]>();
    const toolMapBySlug = new Map<string, (typeof existingTools)[0]>();
    const createdSlugsInBatch = new Set<string>();

    for (const tool of existingTools) {
      const importId = (tool.metadata as Record<string, unknown> | null)?.importId;
      if (importId) {
        toolMapById.set(String(importId), tool);
      }
      if (tool.slug) {
        toolMapBySlug.set(tool.slug, tool);
      }
    }

    const aiSummaryByRowIndex = new Map<number, string>();
    const derivedFieldsByRowIndex = new Map<number, DerivedRowFields>();
    const rowIdByRowIndex = new Map<number, string>();

    if (payload.regenerateAi) {
      const aiCandidates: AiSummaryCandidate[] = [];

      for (const [index, row] of rows.entries()) {
        const rowId = deriveImportId(row);
        if (rowId) {
          rowIdByRowIndex.set(index, rowId);
        }

        const derivedFields = deriveRowFields(row, columnToQuestionCode, codeToQuestion);
        derivedFieldsByRowIndex.set(index, derivedFields);

        if (!rowId || derivedFields.excelSummary) {
          continue;
        }

        aiCandidates.push({
          index,
          rowNumber: index + 1,
          name: derivedFields.name,
          row,
        });
      }

      if (aiCandidates.length > 0) {
        const aiConcurrency = getAiSummaryConcurrency();
        let completedAiCandidates = 0;

        await emitProgress(onProgress, {
          stage: "rows",
          message: `Förgenererar ${aiCandidates.length} AI-sammanfattningar med ${aiConcurrency} samtidiga anrop...`,
          versionId,
          totalRows: rows.length,
          processedRows: 0,
        });

        await processWithConcurrency(aiCandidates, aiConcurrency, async (candidate) => {
          const aiSummary = await generateToolSummary(candidate.name, candidate.row);
          if (aiSummary) {
            aiSummaryByRowIndex.set(candidate.index, aiSummary);
          }

          completedAiCandidates++;

          await emitProgress(onProgress, {
            stage: "rows",
            message: `AI ${completedAiCandidates}/${aiCandidates.length}: ${aiSummary ? "klar" : "ingen sammanfattning"} för rad ${candidate.rowNumber} (${candidate.name}).`,
            versionId: versionId ?? undefined,
            totalRows: rows.length,
            processedRows: 0,
            aiGeneratedCount: aiSummaryByRowIndex.size,
          });
        });

        await emitProgress(onProgress, {
          stage: "rows",
          message: `AI-förbearbetning klar: ${aiSummaryByRowIndex.size}/${aiCandidates.length} sammanfattningar genererade.`,
          versionId,
          totalRows: rows.length,
          processedRows: 0,
          aiGeneratedCount: aiSummaryByRowIndex.size,
        });
      }
    }

    let updatedCount = 0;
    let createdCount = 0;
    let skippedCount = 0;
    let aiGeneratedCount = 0;
    const processedToolIds = new Set<string>();

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 1;
      const rowId = rowIdByRowIndex.get(index) ?? deriveImportId(row);

      if (!rowId) {
        skippedCount++;
        await emitProgress(onProgress, {
          stage: "rows",
          message: `Rad ${rowNumber}/${rows.length}: hoppad (saknar stabilt import-ID).`,
          versionId,
          totalRows: rows.length,
          processedRows: rowNumber,
          createdCount,
          updatedCount,
          skippedCount,
          aiGeneratedCount,
        });
        continue;
      }

      const derivedFields =
        derivedFieldsByRowIndex.get(index) ??
        deriveRowFields(row, columnToQuestionCode, codeToQuestion);
      const { name, vendor, website, category, secondaryCategory, excelSummary } =
        derivedFields;

      const slug = slugify(name);
      let existingTool = toolMapById.get(rowId);
      if (!existingTool && slug) {
        existingTool = toolMapBySlug.get(slug);
      }

      let summary = excelSummary;

      await emitProgress(onProgress, {
        stage: "rows",
        message: `Rad ${rowNumber}/${rows.length}: bearbetar "${name}"...`,
        versionId,
        totalRows: rows.length,
        processedRows: rowNumber,
        createdCount,
        updatedCount,
        skippedCount,
        aiGeneratedCount,
      });

      if (!summary && payload.regenerateAi) {
        const aiSummary = aiSummaryByRowIndex.get(index);
        if (aiSummary) {
          summary = aiSummary;
          aiGeneratedCount++;
        }
      }

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
        "start time",
        "completion time",
        "last modified time",
        "email",
      ]);

      const comparisonData: Record<string, unknown> = {};

      Object.entries(row).forEach(([key, value]) => {
        const lowerKey = normalizeKey(key);
        if (value === "" || value === null || value === undefined) return;

        const questionCode = columnToQuestionCode.get(key);
        if (questionCode) {
          const questionInfo = codeToQuestion.get(questionCode);
          if (questionInfo?.questionType === "metadata") {
            return;
          }
          comparisonData[key] = value;
          return;
        }

        if (lowerKey.startsWith("compare:") || lowerKey.startsWith("comp:")) {
          const cleanKey = key.replace(/^(Compare|Comp|compare|comp):\s*/i, "");
          comparisonData[cleanKey] = value;
          return;
        }

        if (!coreFields.has(lowerKey)) {
          comparisonData[key] = value;
        }
      });

      const toolData = {
        name,
        vendor,
        summary,
        category,
        secondaryCategory: secondaryCategory || null,
        website,
        status: "published" as const,
        rawData: row,
        comparisonData,
        metadata: {
          importId: rowId,
          ...row,
        },
        updatedAt: new Date(),
        versionId,
      };

      if (existingTool) {
        await db
          .update(toolsTable)
          .set({
            ...toolData,
            slug: existingTool.slug,
            createdAt: existingTool.createdAt,
          })
          .where(eq(toolsTable.id, existingTool.id));
        processedToolIds.add(existingTool.id);
        updatedCount++;

        await emitProgress(onProgress, {
          stage: "rows",
          message: `Rad ${rowNumber}/${rows.length}: uppdaterade "${name}".`,
          versionId,
          totalRows: rows.length,
          processedRows: rowNumber,
          createdCount,
          updatedCount,
          skippedCount,
          aiGeneratedCount,
        });
      } else {
        let uniqueSlug = slug;
        let suffix = 1;
        while (toolMapBySlug.has(uniqueSlug) || createdSlugsInBatch.has(uniqueSlug)) {
          uniqueSlug = `${slug}-${suffix}`;
          suffix++;
        }

        const [inserted] = await db
          .insert(toolsTable)
          .values({
            ...toolData,
            slug: uniqueSlug,
          })
          .returning({ id: toolsTable.id });

        if (inserted?.id) {
          processedToolIds.add(inserted.id);
        }

        createdSlugsInBatch.add(uniqueSlug);
        createdCount++;

        await emitProgress(onProgress, {
          stage: "rows",
          message: `Rad ${rowNumber}/${rows.length}: skapade "${name}".`,
          versionId,
          totalRows: rows.length,
          processedRows: rowNumber,
          createdCount,
          updatedCount,
          skippedCount,
          aiGeneratedCount,
        });
      }
    }

    await emitProgress(onProgress, {
      stage: "archiving",
      message: "Arkiverar publicerade verktyg som inte fanns med i importen...",
      versionId,
      totalRows: rows.length,
      processedRows: rows.length,
      createdCount,
      updatedCount,
      skippedCount,
      aiGeneratedCount,
    });

    if (processedToolIds.size > 0) {
      await db
        .update(toolsTable)
        .set({ status: "archived", updatedAt: new Date() })
        .where(
          and(
            eq(toolsTable.status, "published"),
            notInArray(toolsTable.id, [...processedToolIds]),
          ),
        );
    } else {
      await db
        .update(toolsTable)
        .set({ status: "archived", updatedAt: new Date() })
        .where(eq(toolsTable.status, "published"));
    }

    const importedCodes = questionHeaders.map((q) => q.parsed.code);
    if (importedCodes.length > 0) {
      const allQuestions = await db
        .select({ id: surveyQuestionsTable.id, code: surveyQuestionsTable.code })
        .from(surveyQuestionsTable);
      const orphanIds = allQuestions
        .filter((q) => !importedCodes.includes(q.code))
        .map((q) => q.id);
      if (orphanIds.length > 0) {
        await db
          .delete(surveyQuestionsTable)
          .where(inArray(surveyQuestionsTable.id, orphanIds));
      }
    }

    await emitProgress(onProgress, {
      stage: "finalizing",
      message: "Slutför import, uppdaterar cache och versionsmetadata...",
      versionId,
      totalRows: rows.length,
      processedRows: rows.length,
      createdCount,
      updatedCount,
      skippedCount,
      aiGeneratedCount,
    });

    const finalMetadata = {
      ...versionMetadata,
      updatedCount,
      createdCount,
      skippedCount,
      questionsCount: questionHeaders.length,
      aiGeneratedCount,
    };

    await db
      .update(toolVersionsTable)
      .set({
        status: "ready",
        isActive: true,
        metadata: finalMetadata,
      })
      .where(eq(toolVersionsTable.id, versionId));

    revalidatePath("/admin");
    revalidatePath("/admin/data");
    revalidatePath("/admin/versions");
    revalidatePath("/tools");
    revalidatePath("/compare");
    revalidatePath("/main");
    revalidatePath("/admin/questions");

    const result: ToolImportResult = {
      versionId,
      totalRows: rows.length,
      createdCount,
      updatedCount,
      skippedCount,
      questionsCount: questionHeaders.length,
      aiGeneratedCount,
    };

    await emitProgress(onProgress, {
      stage: "completed",
      message: "Import klar.",
      versionId,
      totalRows: rows.length,
      processedRows: rows.length,
      createdCount,
      updatedCount,
      skippedCount,
      aiGeneratedCount,
    });

    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kunde inte slutföra importen";

    await emitProgress(onProgress, {
      stage: "failed",
      message: `Importen misslyckades: ${message}`,
      versionId: versionId ?? undefined,
    });

    if (versionId) {
      try {
        await db
          .update(toolVersionsTable)
          .set({
            status: "failed",
            metadata: {
              ...versionMetadata,
              importError: message,
              failedAt: new Date().toISOString(),
            },
            updatedAt: new Date(),
          })
          .where(eq(toolVersionsTable.id, versionId));
      } catch {
        // Ignore metadata update errors during failure handling.
      }
    }

    throw error;
  }
}
