import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { AutoLinkedText } from "@/components/ui/auto-linked-text";
import { AI_SUMMARY_SOURCE_NOTE } from "@/lib/constants";
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

type DetailEntry = {
  id: string;
  label: string;
  supportiveText?: string | null;
  value: string;
  items: string[];
  isLongForm: boolean;
};

function normalizeFieldValue(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldUseLongForm(
  value: string,
  items: string[],
  isMultipleChoice: boolean,
): boolean {
  if (!value) return false;
  if (value.length > 180) return true;
  if (items.length >= 3) return true;
  if (isMultipleChoice && items.length >= 2) return true;
  if (items.length >= 2 && value.length > 120) return true;
  return false;
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

  // Show all available survey entries for this tool detail view.
  const comparisonEntries = Object.entries(tool.comparisonData ?? {}).sort(
    ([keyA], [keyB]) => {
      const codeA = extractQuestionCode(keyA);
      const codeB = extractQuestionCode(keyB);
      if (codeA && codeB) return codeA.localeCompare(codeB);
      if (codeA) return -1;
      if (codeB) return 1;
      return keyA.localeCompare(keyB);
    },
  );

  const detailEntries: DetailEntry[] = [];

  if (toolFields.vendor) {
    const vendorValue = normalizeFieldValue(toolFields.vendor);
    if (vendorValue) {
      detailEntries.push({
        id: "vendor",
        label: "Vendor",
        value: vendorValue,
        items: [],
        isLongForm: false,
      });
    }
  }

  for (const [key, value] of comparisonEntries) {
    const code = extractQuestionCode(key);
    const question = code ? questionsByCode.get(code) : null;
    const label = question?.questionText ?? key.replace(QUESTION_CODE_REGEX, "").trim();

    const normalizedValue = normalizeFieldValue(
      Array.isArray(value) ? value.join("; ") : value,
    );
    if (!normalizedValue) continue;

    const isMultipleChoice = question?.isMultipleChoice === true;
    const semicolonItems = normalizedValue.includes(";")
      ? parseMultipleChoiceValue(normalizedValue)
      : [];

    detailEntries.push({
      id: key,
      label,
      supportiveText: question?.supportiveText ?? null,
      value: normalizedValue,
      items: semicolonItems,
      isLongForm: shouldUseLongForm(normalizedValue, semicolonItems, isMultipleChoice),
    });
  }

  const compactEntries = detailEntries.filter((entry) => !entry.isLongForm);
  const longFormEntries = detailEntries.filter((entry) => entry.isLongForm);

  return (
    <div className="py-8 md:py-10">
      <Container className="max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-muted-foreground text-sm font-medium">
            {toolFields.category ?? "Uncategorized"}
          </p>
          <h1 className="text-foreground text-3xl font-semibold md:text-4xl">
            {toolFields.name}
          </h1>
          {tool.summary && (
            <div className="space-y-1">
              <Text variant="lead" className="leading-relaxed">
                {tool.summary}
              </Text>
              <p className="text-xs text-[hsl(var(--muted))]/70 italic">
                {AI_SUMMARY_SOURCE_NOTE}
              </p>
            </div>
          )}
        </header>

        {compactEntries.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-foreground text-lg font-semibold">Quick facts</h2>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {compactEntries.map((entry) => (
                <article
                  key={entry.id}
                  className="border-border/60 min-w-0 space-y-2 rounded-xl border bg-[hsl(var(--background))] p-4"
                >
                  <h3 className="text-muted-foreground text-xs font-medium tracking-wide">
                    {entry.label}
                  </h3>
                  <div className="text-foreground space-y-1.5 text-[15px] leading-6">
                    {entry.items.length > 1 ? (
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                        {entry.items.map((item, index) => (
                          <span
                            key={`${entry.id}-${index}`}
                            className="inline-flex items-center"
                          >
                            <AutoLinkedText
                              text={item}
                              className="text-[15px] leading-6 break-words"
                            />
                            {index < entry.items.length - 1 && (
                              <span className="text-muted-foreground/50 mx-1.5">·</span>
                            )}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <AutoLinkedText
                        text={entry.value}
                        className="text-[15px] leading-6 break-words"
                      />
                    )}
                    {entry.supportiveText && (
                      <p className="text-muted-foreground/80 text-xs leading-relaxed">
                        {entry.supportiveText}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {longFormEntries.length > 0 && (
          <section className="space-y-6 pt-1">
            <h2 className="text-foreground text-lg font-semibold">Details</h2>
            <div className="space-y-12 md:space-y-16">
              {longFormEntries.map((entry) => (
                <article key={entry.id} className="space-y-4">
                  <h3 className="text-foreground text-2xl leading-tight font-semibold md:text-3xl">
                    {entry.label}
                  </h3>
                  {entry.supportiveText && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {entry.supportiveText}
                    </p>
                  )}

                  {entry.items.length > 1 ? (
                    <ul className="text-foreground m-0 list-none space-y-2 p-0 text-[15px] leading-7">
                      {entry.items.map((item, index) => (
                        <li
                          key={`${entry.id}-item-${index}`}
                          className="flex items-start gap-2"
                        >
                          <span
                            className="text-foreground/70 mt-[0.08em] shrink-0 text-base leading-7"
                            aria-hidden
                          >
                            •
                          </span>
                          <AutoLinkedText text={item} className="text-[15px] leading-7" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-foreground text-[15px] leading-7">
                      <AutoLinkedText
                        text={entry.value}
                        className="text-[15px] leading-7"
                      />
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {detailEntries.length === 0 && (
          <Card className="space-y-4">
            <Text>No data points yet.</Text>
          </Card>
        )}
      </Container>
    </div>
  );
}
