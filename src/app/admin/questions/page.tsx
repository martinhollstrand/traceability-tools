import { getSurveyQuestions } from "@/server/actions/survey-questions";
import { QuestionsPageClient } from "./page-client";

export default async function QuestionsPage() {
  const questions = await getSurveyQuestions();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.4em] text-[hsl(var(--muted))] uppercase">
          Survey
        </p>
        <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))]">
          Question Management
        </h1>
        <p className="text-sm text-[hsl(var(--muted))]">
          Manage which questions appear in comparisons and add supportive texts.
        </p>
      </div>

      <QuestionsPageClient questions={questions} />
    </div>
  );
}
