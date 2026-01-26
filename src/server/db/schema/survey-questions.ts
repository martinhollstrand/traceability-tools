import { sql } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { toolVersionsTable } from "@/server/db/schema/tool-versions";
import { questionTypeEnum, mappedFieldEnum } from "@/server/db/schema/enums";

/**
 * Survey questions extracted from Excel imports.
 * Each question has a unique code (e.g., "001" from "Question text [001]").
 *
 * Questions can be:
 * - "metadata": Maps to tool fields (name, vendor, website, category)
 * - "survey": Actual survey questions that can appear in comparisons
 *
 * Admins can mark survey questions for comparison and add supportive texts.
 */
export const surveyQuestionsTable = pgTable(
  "survey_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Unique code extracted from the header, e.g., "001" from "[001]"
    code: text("code").notNull(),
    // Full question text (without the code suffix)
    questionText: text("question_text").notNull(),
    // Question type: "metadata" maps to tool fields, "survey" is for comparison
    questionType: questionTypeEnum("question_type").notNull().default("survey"),
    // For metadata questions: which tool field this maps to
    mappedField: mappedFieldEnum("mapped_field"),
    // If true, this question is included in the comparison view (only for survey type)
    forComparison: boolean("for_comparison").notNull().default(false),
    // If true, values are semicolon/comma separated and should be displayed as lists
    isMultipleChoice: boolean("is_multiple_choice").notNull().default(false),
    // Admin-provided supportive text shown in the UI
    supportiveText: text("supportive_text"),
    // Optional link to the import version that introduced this question
    versionId: uuid("version_id").references(() => toolVersionsTable.id, {
      onDelete: "set null",
    }),
    // Display order for consistent UI rendering
    sortOrder: text("sort_order"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => ({
    // Code must be unique across all questions
    codeIdx: uniqueIndex("survey_questions_code_idx").on(table.code),
    // Index for filtering comparison questions
    forComparisonIdx: index("survey_questions_for_comparison_idx").on(
      table.forComparison,
    ),
    // Index for filtering by question type
    questionTypeIdx: index("survey_questions_type_idx").on(table.questionType),
  }),
);
