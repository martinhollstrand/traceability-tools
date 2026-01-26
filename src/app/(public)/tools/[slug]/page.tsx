import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
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

  const capabilityEntries = Object.entries(tool.capabilities ?? {});
  const comparisonEntries = Object.entries(tool.comparisonData ?? {});

  // Create a map of question codes to question data
  const questionsByCode = new Map(questions.map((q) => [q.code, q]));

  return (
    <div className="py-12">
      <Container className="space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold tracking-[0.3em] text-[hsl(var(--muted))] uppercase">
            {toolFields.category ?? "Okategoriserad"}
          </p>
          <h1 className="text-4xl font-semibold text-[hsl(var(--foreground))]">
            {toolFields.name}
          </h1>
          {tool.summary && <Text variant="lead">{tool.summary}</Text>}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold">Kapabiliteter</h2>
            {capabilityEntries.length === 0 ? (
              <Text>Inga kapabiliteter dokumenterade ännu.</Text>
            ) : (
              <dl className="space-y-3">
                {capabilityEntries.map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm tracking-[0.2em] text-[hsl(var(--muted))] uppercase">
                      {key}
                    </dt>
                    <dd className="text-[hsl(var(--foreground))]">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-semibold">Jämförelsedata</h2>
            {comparisonEntries.length === 0 ? (
              <Text>Inga datapunkter ännu.</Text>
            ) : (
              <dl className="space-y-4">
                {comparisonEntries.map(([key, value]) => {
                  const code = extractQuestionCode(key);
                  const question = code ? questionsByCode.get(code) : null;
                  const label =
                    question?.questionText ?? key.replace(QUESTION_CODE_REGEX, "").trim();

                  const stringVal = Array.isArray(value)
                    ? value.join(", ")
                    : String(value);
                  const isMultiChoice = question?.isMultipleChoice;
                  const items = isMultiChoice ? parseMultipleChoiceValue(stringVal) : [];

                  return (
                    <div key={key}>
                      <dt className="text-sm tracking-[0.2em] text-[hsl(var(--muted))] uppercase">
                        {label}
                      </dt>
                      {question?.supportiveText && (
                        <dd className="mt-0.5 mb-1 text-xs text-[hsl(var(--muted))]/70">
                          {question.supportiveText}
                        </dd>
                      )}
                      <dd className="text-[hsl(var(--foreground))]">
                        {isMultiChoice && items.length > 1 ? (
                          <ul className="list-disc space-y-0.5 pl-4">
                            {items.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          stringVal
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            )}
          </Card>
        </div>
      </Container>
    </div>
  );
}
