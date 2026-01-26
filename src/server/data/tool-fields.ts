import "server-only";

import type { SurveyQuestion, MappedField } from "@/server/actions/survey-questions";

// Regex to extract question code from column header
const QUESTION_CODE_REGEX = /\[(\d{3})\]\s*$/;

type ToolWithRawData = {
  name: string;
  vendor: string | null;
  website: string | null;
  category: string | null;
  rawData: Record<string, unknown>;
};

export type DynamicToolFields = {
  name: string;
  vendor: string | null;
  website: string | null;
  category: string | null;
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

  // Apply metadata mappings from rawData
  for (const question of metadataQuestions) {
    const columnName = codeToColumn.get(question.code);
    if (columnName && question.mappedField) {
      const value = tool.rawData[columnName];
      if (value !== undefined && value !== null && value !== "") {
        fields[question.mappedField as keyof DynamicToolFields] = String(value);
      }
    }
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
  return fields[field];
}
