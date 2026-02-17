import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { AutoLinkedText } from "@/components/ui/auto-linked-text";
import { getToolBySlug } from "@/server/data/tools";
import { getSurveyQuestions } from "@/server/actions/survey-questions";
import { getToolFieldsFromMappings } from "@/server/data/tool-fields";

type ToolDetailPageProps = {
  params: Promise<{ slug: string }>;
};

// Regex to extract question code from column header
const QUESTION_CODE_REGEX = /\[(\d{3})\]\s*$/;

function extractQuestionCode(header: string): string | null {
  const match = header.match(QUESTION_CODE_REGEX);
  return match ? match[1] : null;
}

/**
 * Parse a multiple choice value (semicolon separated) into an array.
 */
function parseMultipleChoiceValue(value: string): string[] {
  return value
    .split(/[;]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const { slug } = await params;
  const [tool, questions] = await Promise.all([
    getToolBySlug(slug),
    getSurveyQuestions(),
  ]);

  if (!tool) {
    notFound();
  }

  // Get dynamically mapped field values based on current question mappings
  const toolFields = getToolFieldsFromMappings(
    {
      name: tool.name,
      vendor: tool.vendor,
      website: tool.website,
      category: tool.category,
      rawData: (tool.rawData as Record<string, unknown>) ?? {},
    },
    questions,
  );

  // Create a map of question codes to question data
  const questionsByCode = new Map(questions.map((q) => [q.code, q]));

  // Only show entries for questions marked forComparison (respects admin hide flag)
  const comparisonEntries = Object.entries(tool.comparisonData ?? {})
    .filter(([key]) => {
      const code = extractQuestionCode(key);
      if (!code) return false;
      const question = questionsByCode.get(code);
      return question?.forComparison === true;
    })
    .sort(([keyA], [keyB]) => {
      const codeA = extractQuestionCode(keyA) ?? "";
      const codeB = extractQuestionCode(keyB) ?? "";
      return codeA.localeCompare(codeB);
    });

  return (
    <div className="py-12">
      <Container className="space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold tracking-[0.3em] text-[hsl(var(--muted))] uppercase">
            {toolFields.category ?? "Uncategorized"}
          </p>
          <h1 className="text-4xl font-semibold text-[hsl(var(--foreground))]">
            {toolFields.name}
          </h1>
          {tool.summary && (
            <div>
              <Text variant="lead">{tool.summary}</Text>
              <p className="mt-1 text-xs text-[hsl(var(--muted))]/50 italic">
                AI-generated from vendor data
              </p>
            </div>
          )}
        </div>

        {comparisonEntries.length > 0 && (
          <div className="border-border/50 overflow-hidden rounded-[32px] border bg-[hsl(var(--surface))]/70 shadow-[0_26px_90px_-45px_hsl(var(--primary)/0.55)]">
            <div className="border-border/40 grid grid-cols-[220px,1fr] items-stretch border-b bg-[hsl(var(--surface-strong))]/70">
              <div className="text-muted-foreground text-md border-border/40 border-r px-6 py-4 font-semibold uppercase">
                Dimension
              </div>
              <div className="px-6 py-4">
                <span className="text-foreground text-xl font-semibold">
                  {toolFields.name}
                </span>
              </div>
            </div>
            <div className="divide-border/60 divide-y">
              {toolFields.vendor && (
                <div className="bg-background/55 grid grid-cols-[220px,1fr] items-stretch">
                  <div className="text-muted-foreground border-border/40 flex flex-col gap-1 border-r bg-[hsl(var(--surface))] px-6 py-5">
                    <span className="text-md font-semibold uppercase">Vendor</span>
                  </div>
                  <div className="space-y-2 px-6 py-5">
                    <span className="text-sm">{toolFields.vendor}</span>
                  </div>
                </div>
              )}
              {comparisonEntries.map(([key, value]) => {
                const code = extractQuestionCode(key);
                const question = code ? questionsByCode.get(code) : null;
                const label =
                  question?.questionText ?? key.replace(QUESTION_CODE_REGEX, "").trim();

                const stringVal = Array.isArray(value) ? value.join(", ") : String(value);
                const isMultiChoice = question?.isMultipleChoice;
                const items = isMultiChoice ? parseMultipleChoiceValue(stringVal) : [];

                return (
                  <div
                    key={key}
                    className="bg-background/55 grid grid-cols-[220px,1fr] items-stretch"
                  >
                    <div className="text-muted-foreground border-border/40 flex flex-col gap-1 border-r bg-[hsl(var(--surface))] px-6 py-5">
                      <span className="text-md font-semibold uppercase">{label}</span>
                      {question?.supportiveText && (
                        <span className="text-muted-foreground/70 text-[10px] leading-tight font-normal tracking-normal normal-case">
                          {question.supportiveText}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 px-6 py-5">
                      {isMultiChoice && items.length >= 1 ? (
                        <ul className="list-disc space-y-0.5 pl-4 text-sm">
                          {items.map((item, index) => (
                            <li key={index}>
                              <AutoLinkedText text={item} />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <AutoLinkedText text={stringVal} className="text-sm" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {comparisonEntries.length === 0 && (
          <Card className="space-y-4">
            <Text>No data points yet.</Text>
          </Card>
        )}
      </Container>
    </div>
  );
}
