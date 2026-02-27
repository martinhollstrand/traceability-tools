import "server-only";

import type { SurveyQuestion, MappedField } from "@/server/actions/survey-questions";

// Regex to extract question code from column header
const QUESTION_CODE_REGEX = /\[(\d{3})\]\s*$/;
const PRIMARY_CATEGORY_QUESTION_CODE = "004";

function normalizeRawValue(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

function getRawDataValueByQuestionCode(
  rawData: Record<string, unknown>,
  code: string,
): string | null {
  for (const [key, value] of Object.entries(rawData)) {
    const match = key.match(QUESTION_CODE_REGEX);
    if (match?.[1] !== code) continue;
    const normalized = normalizeRawValue(value);
    if (normalized) return normalized;
  }
  return null;
}

function getRawDataValueByLabel(
  rawData: Record<string, unknown>,
  predicate: (label: string) => boolean,
): string | null {
  for (const [key, value] of Object.entries(rawData)) {
    const normalized = normalizeRawValue(value);
    if (!normalized) continue;
    const label = key.replace(QUESTION_CODE_REGEX, "").trim();
    if (predicate(label)) return normalized;
  }
  return null;
}

type ToolWithRawData = {
  name: string;
  vendor: string | null;
  website: string | null;
  category: string | null;
  secondaryCategory?: string | null;
  rawData: Record<string, unknown>;
};

export type DynamicToolFields = {
  name: string;
  vendor: string | null;
  website: string | null;
  category: string | null;
  secondaryCategory: string | null;
};

/**
 * Get tool field values based on current question mappings.
 * This allows admin changes to metadata mappings to be reflected
 * in the UI without requiring a re-import.
 *
 * @param tool - The tool with rawData containing original values
 * @param questions - All survey questions (including metadata)
 * @returns The dynamically mapped field values
 */
export function getToolFieldsFromMappings(
  tool: ToolWithRawData,
  questions: SurveyQuestion[],
): DynamicToolFields {
  // Start with the stored tool fields as defaults
  const fields: DynamicToolFields = {
    name: tool.name,
    vendor: tool.vendor,
    website: tool.website,
    category: tool.category,
    secondaryCategory: tool.secondaryCategory ?? null,
  };

  // Get metadata questions with mappings
  const metadataQuestions = questions.filter(
    (q) => q.questionType === "metadata" && q.mappedField,
  );

  if (metadataQuestions.length === 0 || !tool.rawData) {
    return fields;
  }

  // Build a map of question code -> original column name from rawData
  const codeToColumn = new Map<string, string>();
  for (const key of Object.keys(tool.rawData)) {
    const match = key.match(QUESTION_CODE_REGEX);
    if (match) {
      codeToColumn.set(match[1], key);
    }
  }

  // Map from database mapped field names to DynamicToolFields keys
  const fieldMapping: Record<string, keyof DynamicToolFields> = {
    name: "name",
    vendor: "vendor",
    website: "website",
    category: "category",
    secondary_category: "secondaryCategory",
  };

  // Apply metadata mappings from rawData
  for (const question of metadataQuestions) {
    const columnName = codeToColumn.get(question.code);
    if (columnName && question.mappedField) {
      const value = tool.rawData[columnName];
      if (value !== undefined && value !== null && value !== "") {
        const fieldKey = fieldMapping[question.mappedField];
        if (fieldKey) {
          fields[fieldKey] = String(value);
        }
      }
    }
  }

  // Fallback to raw import values when category mappings are missing or empty.
  if (!fields.category) {
    fields.category =
      getRawDataValueByQuestionCode(tool.rawData, PRIMARY_CATEGORY_QUESTION_CODE) ??
      getRawDataValueByLabel(
        tool.rawData,
        (label) =>
          /\bcategor/i.test(label) && !/\b(2nd|secondary|sub)\s*categor/i.test(label),
      );
  }

  if (!fields.secondaryCategory) {
    fields.secondaryCategory = getRawDataValueByLabel(tool.rawData, (label) =>
      /\b(2nd|secondary|sub)\s*categor/i.test(label),
    );
  }

  return fields;
}

/**
 * Get the display value for a specific mapped field based on question mappings.
 *
 * @param tool - The tool with rawData
 * @param questions - All survey questions
 * @param field - The field to get ("name", "vendor", "website", "category")
 * @returns The value for that field based on current mappings
 */
export function getToolFieldValue(
  tool: ToolWithRawData,
  questions: SurveyQuestion[],
  field: MappedField,
): string | null {
  if (!field) return null;

  const fields = getToolFieldsFromMappings(tool, questions);
  const mappedFieldToKey: Record<string, keyof DynamicToolFields> = {
    name: "name",
    vendor: "vendor",
    website: "website",
    category: "category",
    secondary_category: "secondaryCategory",
  };
  const key = mappedFieldToKey[field];
  return key ? fields[key] : null;
}
