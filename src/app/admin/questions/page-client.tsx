"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
  toggleQuestionComparison,
  toggleQuestionMultipleChoice,
  type SurveyQuestion,
} from "@/server/actions/survey-questions";
import { QuestionEditDialog } from "@/components/admin/question-edit-dialog";

type QuestionsPageClientProps = {
  questions: SurveyQuestion[];
};

const MAPPED_FIELD_LABELS: Record<string, string> = {
  name: "Tool Name",
  vendor: "Vendor",
  website: "Website",
  category: "Category",
};

export function QuestionsPageClient({ questions }: QuestionsPageClientProps) {
  const [isPending, startTransition] = useTransition();
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
  const [filterType, setFilterType] = useState<"all" | "metadata" | "survey">("all");

  const filteredQuestions = questions.filter((q) => {
    if (filterType === "all") return true;
    return q.questionType === filterType;
  });

  const metadataCount = questions.filter((q) => q.questionType === "metadata").length;
  const surveyCount = questions.filter((q) => q.questionType === "survey").length;
  const comparisonCount = questions.filter(
    (q) => q.questionType === "survey" && q.forComparison,
  ).length;

  const handleToggleComparison = (questionId: string, questionType: string) => {
    // Don't allow toggling comparison for metadata questions
    if (questionType === "metadata") return;

    startTransition(async () => {
      await toggleQuestionComparison(questionId);
    });
  };

  const handleToggleMultipleChoice = (questionId: string, questionType: string) => {
    // Don't allow toggling multiple choice for metadata questions
    if (questionType === "metadata") return;

    startTransition(async () => {
      await toggleQuestionMultipleChoice(questionId);
    });
  };

  if (questions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Text className="text-[hsl(var(--muted))]">
          No questions found. Import an Excel file with question headers (format:
          &quot;Question text [001]&quot;) to populate this list.
        </Text>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-[hsl(var(--muted))]">
          {questions.length} questions total ({metadataCount} metadata, {surveyCount}{" "}
          survey), {comparisonCount} selected for comparison
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
          >
            All ({questions.length})
          </Button>
          <Button
            variant={filterType === "metadata" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("metadata")}
          >
            Metadata ({metadataCount})
          </Button>
          <Button
            variant={filterType === "survey" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("survey")}
          >
            Survey ({surveyCount})
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))]">
              <tr>
                <th className="px-4 py-3 font-semibold text-[hsl(var(--muted))]">Code</th>
                <th className="px-4 py-3 font-semibold text-[hsl(var(--muted))]">Type</th>
                <th className="px-4 py-3 font-semibold text-[hsl(var(--muted))]">
                  Question
                </th>
                <th className="px-4 py-3 text-center font-semibold text-[hsl(var(--muted))]">
                  In Comparison
                </th>
                <th className="px-4 py-3 text-center font-semibold text-[hsl(var(--muted))]">
                  Multiple Choice
                </th>
                <th className="px-4 py-3 font-semibold text-[hsl(var(--muted))]">
                  Supportive Text
                </th>
                <th className="px-4 py-3 font-semibold text-[hsl(var(--muted))]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filteredQuestions.map((question) => (
                <tr
                  key={question.id}
                  className={`hover:bg-[hsl(var(--surface-strong))]/50 ${
                    question.questionType === "metadata"
                      ? "bg-amber-50/30 dark:bg-amber-950/10"
                      : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--muted))]">
                    [{question.code}]
                  </td>
                  <td className="px-4 py-3">
                    {question.questionType === "metadata" ? (
                      <div className="space-y-1">
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                        >
                          Metadata
                        </Badge>
                        {question.mappedField && (
                          <div className="text-xs text-[hsl(var(--muted))]">
                            →{" "}
                            {MAPPED_FIELD_LABELS[question.mappedField] ??
                              question.mappedField}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline">Survey</Badge>
                    )}
                  </td>
                  <td className="max-w-md px-4 py-3">
                    <span className="line-clamp-2 text-[hsl(var(--foreground))]">
                      {question.questionText}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {question.questionType === "metadata" ? (
                      <span className="text-xs text-[hsl(var(--muted))]/50">N/A</span>
                    ) : (
                      <button
                        onClick={() =>
                          handleToggleComparison(question.id, question.questionType)
                        }
                        disabled={isPending}
                        className={`inline-flex h-6 w-10 items-center rounded-full transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50 ${
                          question.forComparison
                            ? "bg-[hsl(var(--foreground))]"
                            : "bg-[hsl(var(--border))]"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            question.forComparison ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {question.questionType === "metadata" ? (
                      <span className="text-xs text-[hsl(var(--muted))]/50">N/A</span>
                    ) : (
                      <button
                        onClick={() =>
                          handleToggleMultipleChoice(question.id, question.questionType)
                        }
                        disabled={isPending}
                        className={`inline-flex h-6 w-10 items-center rounded-full transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50 ${
                          question.isMultipleChoice
                            ? "bg-[hsl(var(--foreground))]"
                            : "bg-[hsl(var(--border))]"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            question.isMultipleChoice ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    )}
                  </td>
                  <td className="max-w-xs px-4 py-3">
                    {question.supportiveText ? (
                      <span className="line-clamp-2 text-sm text-[hsl(var(--muted))]">
                        {question.supportiveText}
                      </span>
                    ) : (
                      <span className="text-xs text-[hsl(var(--muted))]/50">
                        No supportive text
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingQuestion(question)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editingQuestion && (
        <QuestionEditDialog
          question={editingQuestion}
          open={!!editingQuestion}
          onOpenChange={(open: boolean) => !open && setEditingQuestion(null)}
        />
      )}
    </div>
  );
}
