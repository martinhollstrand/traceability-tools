"use server";

import { revalidatePath } from "next/cache";
import { eq, asc, and } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/server/db";
import { surveyQuestionsTable } from "@/server/db/schema";
import { requireAdminSession } from "@/server/auth/session";

export type QuestionType = "metadata" | "survey";
export type MappedField = "name" | "vendor" | "website" | "category" | null;

export type SurveyQuestion = {
  id: string;
  code: string;
  questionText: string;
  questionType: QuestionType;
  mappedField: MappedField;
  forComparison: boolean;
  isMultipleChoice: boolean;
  supportiveText: string | null;
  sortOrder: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Get all survey questions, sorted by code.
 */
export async function getSurveyQuestions(): Promise<SurveyQuestion[]> {
  const db = getDb();
  const questions = await db
    .select()
    .from(surveyQuestionsTable)
    .orderBy(asc(surveyQuestionsTable.sortOrder), asc(surveyQuestionsTable.code));

  return questions as SurveyQuestion[];
}

/**
 * Get only survey-type questions marked for comparison.
 * Metadata questions are excluded from comparison view.
 */
export async function getComparisonQuestions(): Promise<SurveyQuestion[]> {
  const db = getDb();
  const questions = await db
    .select()
    .from(surveyQuestionsTable)
    .where(
      and(
        eq(surveyQuestionsTable.questionType, "survey"),
        eq(surveyQuestionsTable.forComparison, true),
      ),
    )
    .orderBy(asc(surveyQuestionsTable.sortOrder), asc(surveyQuestionsTable.code));

  return questions as SurveyQuestion[];
}

/**
 * Get only survey-type questions (for admin listing, filtered view).
 */
export async function getSurveyTypeQuestions(): Promise<SurveyQuestion[]> {
  const db = getDb();
  const questions = await db
    .select()
    .from(surveyQuestionsTable)
    .where(eq(surveyQuestionsTable.questionType, "survey"))
    .orderBy(asc(surveyQuestionsTable.sortOrder), asc(surveyQuestionsTable.code));

  return questions as SurveyQuestion[];
}

/**
 * Get only metadata-type questions.
 */
export async function getMetadataQuestions(): Promise<SurveyQuestion[]> {
  const db = getDb();
  const questions = await db
    .select()
    .from(surveyQuestionsTable)
    .where(eq(surveyQuestionsTable.questionType, "metadata"))
    .orderBy(asc(surveyQuestionsTable.sortOrder), asc(surveyQuestionsTable.code));

  return questions as SurveyQuestion[];
}

/**
 * Get a single question by its code.
 */
export async function getQuestionByCode(code: string): Promise<SurveyQuestion | null> {
  const db = getDb();
  const [question] = await db
    .select()
    .from(surveyQuestionsTable)
    .where(eq(surveyQuestionsTable.code, code))
    .limit(1);

  return question ?? null;
}

// Schema for updating a question
const updateQuestionSchema = z.object({
  id: z.string().uuid(),
  questionType: z.enum(["metadata", "survey"]).optional(),
  mappedField: z.enum(["name", "vendor", "website", "category"]).nullable().optional(),
  forComparison: z.boolean().optional(),
  isMultipleChoice: z.boolean().optional(),
  supportiveText: z.string().optional().nullable(),
});

export type UpdateQuestionState = {
  success: boolean;
  error?: string;
};

/**
 * Update a survey question's type, mapping, comparison flag and/or supportive text.
 */
export async function updateSurveyQuestion(
  _prev: UpdateQuestionState,
  formData: FormData,
): Promise<UpdateQuestionState> {
  await requireAdminSession();

  const mappedFieldValue = formData.get("mappedField");
  const questionTypeValue = formData.get("questionType");

  const raw = {
    id: formData.get("id"),
    questionType: questionTypeValue || undefined,
    mappedField:
      mappedFieldValue === "" || mappedFieldValue === "none" ? null : mappedFieldValue,
    forComparison: formData.get("forComparison") === "true",
    isMultipleChoice: formData.get("isMultipleChoice") === "true",
    supportiveText: formData.get("supportiveText") || null,
  };

  const parsed = updateQuestionSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  try {
    const db = getDb();

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (parsed.data.questionType !== undefined) {
      updateData.questionType = parsed.data.questionType;
      // If changing to metadata, disable forComparison
      if (parsed.data.questionType === "metadata") {
        updateData.forComparison = false;
      }
    }

    if (parsed.data.mappedField !== undefined) {
      updateData.mappedField = parsed.data.mappedField;
    }

    if (
      parsed.data.forComparison !== undefined &&
      parsed.data.questionType !== "metadata"
    ) {
      updateData.forComparison = parsed.data.forComparison;
    }

    if (parsed.data.isMultipleChoice !== undefined) {
      updateData.isMultipleChoice = parsed.data.isMultipleChoice;
    }

    if (parsed.data.supportiveText !== undefined) {
      updateData.supportiveText = parsed.data.supportiveText;
    }

    await db
      .update(surveyQuestionsTable)
      .set(updateData)
      .where(eq(surveyQuestionsTable.id, parsed.data.id));

    revalidatePath("/admin/questions");
    revalidatePath("/compare");
    revalidatePath("/tools");

    return { success: true };
  } catch (error) {
    console.error("Update question error:", error);
    return {
      success: false,
      error: (error as Error).message ?? "Could not update question",
    };
  }
}

/**
 * Toggle the forComparison flag for a question.
 */
export async function toggleQuestionComparison(questionId: string): Promise<void> {
  await requireAdminSession();

  const db = getDb();
  const [question] = await db
    .select()
    .from(surveyQuestionsTable)
    .where(eq(surveyQuestionsTable.id, questionId))
    .limit(1);

  if (!question) {
    throw new Error("Question not found");
  }

  await db
    .update(surveyQuestionsTable)
    .set({
      forComparison: !question.forComparison,
      updatedAt: new Date(),
    })
    .where(eq(surveyQuestionsTable.id, questionId));

  revalidatePath("/admin/questions");
  revalidatePath("/compare");
  revalidatePath("/tools");
}

/**
 * Toggle the isMultipleChoice flag for a question.
 */
export async function toggleQuestionMultipleChoice(questionId: string): Promise<void> {
  await requireAdminSession();

  const db = getDb();
  const [question] = await db
    .select()
    .from(surveyQuestionsTable)
    .where(eq(surveyQuestionsTable.id, questionId))
    .limit(1);

  if (!question) {
    throw new Error("Question not found");
  }

  await db
    .update(surveyQuestionsTable)
    .set({
      isMultipleChoice: !question.isMultipleChoice,
      updatedAt: new Date(),
    })
    .where(eq(surveyQuestionsTable.id, questionId));

  revalidatePath("/admin/questions");
  revalidatePath("/compare");
  revalidatePath("/tools");
}

/**
 * Bulk update comparison flags for multiple questions.
 */
export async function bulkUpdateComparisonFlags(
  updates: Array<{ id: string; forComparison: boolean }>,
): Promise<void> {
  await requireAdminSession();

  const db = getDb();

  for (const update of updates) {
    await db
      .update(surveyQuestionsTable)
      .set({
        forComparison: update.forComparison,
        updatedAt: new Date(),
      })
      .where(eq(surveyQuestionsTable.id, update.id));
  }

  revalidatePath("/admin/questions");
  revalidatePath("/compare");
  revalidatePath("/tools");
}
