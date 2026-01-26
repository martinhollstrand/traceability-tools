"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  updateSurveyQuestion,
  type UpdateQuestionState,
  type SurveyQuestion,
  type QuestionType,
  type MappedField,
} from "@/server/actions/survey-questions";

type QuestionEditDialogProps = {
  question: SurveyQuestion;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const initialState: UpdateQuestionState = { success: false };

const MAPPED_FIELD_OPTIONS: Array<{ value: MappedField | "none"; label: string }> = [
  { value: "none", label: "Not mapped" },
  { value: "name", label: "Tool Name" },
  { value: "vendor", label: "Vendor / Company" },
  { value: "website", label: "Website" },
  { value: "category", label: "Category" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

export function QuestionEditDialog({
  question,
  open,
  onOpenChange,
}: QuestionEditDialogProps) {
  const [state, formAction] = useActionState(updateSurveyQuestion, initialState);
  const [questionType, setQuestionType] = useState<QuestionType>(question.questionType);

  // Close dialog on successful update
  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
    }
  }, [state.success, onOpenChange]);

  // Reset state when question changes
  useEffect(() => {
    setQuestionType(question.questionType);
  }, [question]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Question [{question.code}]</DialogTitle>
          <DialogDescription className="mt-2">{question.questionText}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={question.id} />

          {/* Question Type */}
          <div className="space-y-2">
            <Label htmlFor="questionType">Question Type</Label>
            <select
              id="questionType"
              name="questionType"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as QuestionType)}
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--foreground))] focus:ring-offset-2 focus:outline-none"
            >
              <option value="survey">Survey Question</option>
              <option value="metadata">Metadata Field</option>
            </select>
            <p className="text-xs text-[hsl(var(--muted))]">
              {questionType === "metadata"
                ? "Metadata questions map to tool fields (name, vendor, etc.) and don't appear in comparisons."
                : "Survey questions can be included in the comparison view."}
            </p>
          </div>

          {/* Mapped Field (only for metadata) */}
          {questionType === "metadata" && (
            <div className="space-y-2">
              <Label htmlFor="mappedField">Maps to Tool Field</Label>
              <select
                id="mappedField"
                name="mappedField"
                defaultValue={question.mappedField ?? "none"}
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--foreground))] focus:ring-offset-2 focus:outline-none"
              >
                {MAPPED_FIELD_OPTIONS.map((option) => (
                  <option key={option.value ?? "none"} value={option.value ?? "none"}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[hsl(var(--muted))]">
                During import, values from this column will populate the selected tool
                field.
              </p>
            </div>
          )}

          {/* Comparison toggle (only for survey) */}
          {questionType === "survey" && (
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="forComparison"
                  name="forComparison"
                  value="true"
                  defaultChecked={question.forComparison}
                  className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:ring-[hsl(var(--foreground))]"
                />
                <Label htmlFor="forComparison">Include in comparison view</Label>
              </div>
              <p className="text-xs text-[hsl(var(--muted))]">
                When enabled, this question will appear in the tool comparison grid.
              </p>
            </div>
          )}

          {/* Multiple choice toggle (only for survey) */}
          {questionType === "survey" && (
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isMultipleChoice"
                  name="isMultipleChoice"
                  value="true"
                  defaultChecked={question.isMultipleChoice}
                  className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:ring-[hsl(var(--foreground))]"
                />
                <Label htmlFor="isMultipleChoice">Multiple choice question</Label>
              </div>
              <p className="text-xs text-[hsl(var(--muted))]">
                Enable this if responses contain multiple values separated by semicolons
                (;). Values will be displayed as a list instead of a single string.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="supportiveText">Supportive Text</Label>
            <textarea
              id="supportiveText"
              name="supportiveText"
              defaultValue={question.supportiveText ?? ""}
              rows={4}
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted))] focus:ring-2 focus:ring-[hsl(var(--foreground))] focus:ring-offset-2 focus:outline-none"
              placeholder="Add helpful context or explanation for this question..."
            />
            <p className="text-xs text-[hsl(var(--muted))]">
              This text will be displayed alongside the question in the app to help users
              understand the context.
            </p>
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
