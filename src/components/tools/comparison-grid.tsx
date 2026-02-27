"use client";

import {
  Fragment,
  useState,
  type ReactNode,
  useRef,
  useEffect,
  useCallback,
} from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThinkingLoader } from "@/components/ui/thinking-loader";
import { AutoLinkedText } from "@/components/ui/auto-linked-text";
import type { Tool } from "@/lib/validators/tool";
import { AI_SUMMARY_SOURCE_NOTE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import type { SurveyQuestion } from "@/server/actions/survey-questions";

type ComparisonGridProps = {
  tools: Tool[];
  questions?: SurveyQuestion[];
};

// Regex to extract question code from column header (e.g., "Question text [001]" -> "001")
const QUESTION_CODE_REGEX = /\[(\d{3})\]\s*$/;

function extractQuestionCode(header: string): string | null {
  const match = header.match(QUESTION_CODE_REGEX);
  return match ? match[1] : null;
}

/**
 * Parse a multiple choice value (semicolon or comma separated) into an array.
 * Handles common separators: semicolon (;), comma followed by space (, )
 */
function parseMultipleChoiceValue(value: string): string[] {
  // Split by semicolon first (most common in the data)
  // Then filter out empty strings and trim whitespace
  return value
    .split(/[;]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

const summaryDisabledCopy = "AI summary is disabled in this environment.";

export function ComparisonGrid({ tools, questions = [] }: ComparisonGridProps) {
  const [summary, setSummary] = useState<string>("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowRightArrow(
          scrollWidth > clientWidth && scrollLeft + clientWidth < scrollWidth - 10,
        );
        setShowLeftArrow(scrollLeft > 10);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      setTimeout(checkScroll, 100);
    }

    return () => {
      if (container) container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [tools.length, isExpanded]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    isDragging.current = true;
    dragStart.current = { x: e.pageX, scrollLeft: container.scrollLeft };
    container.style.cursor = "grabbing";
    container.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const dx = e.pageX - dragStart.current.x;
    container.scrollLeft = dragStart.current.scrollLeft - dx;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    const container = scrollContainerRef.current;
    if (container) {
      container.style.cursor = "grab";
      container.style.userSelect = "";
    }
  }, []);

  const handleGenerateSummary = async () => {
    if (tools.length < 2 || isLoadingSummary) return;

    setIsLoadingSummary(true);
    setIsStreaming(true);
    setSummary("");

    try {
      const response = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: tools.map((tool) => tool.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let hasReceivedData = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // toTextStreamResponse sends plain text chunks - append all chunks
        if (chunk) {
          hasReceivedData = true;
          setSummary((prev) => prev + chunk);
        }
      }

      // If we never received any data, set error message
      if (!hasReceivedData) {
        console.warn("No data received from stream");
        setSummary("AI summary is temporarily unavailable.");
      }
    } catch (error) {
      console.error("Failed to fetch AI summary:", error);
      setSummary("AI summary is temporarily unavailable.");
    } finally {
      setIsLoadingSummary(false);
      setIsStreaming(false);
    }
  };

  const baseColumnWidth = 260;
  const gridTemplateColumns =
    tools.length > 0
      ? `220px repeat(${tools.length}, minmax(${baseColumnWidth}px, 1fr))`
      : "220px";
  const gridMinWidth = 220 + tools.length * baseColumnWidth;
  const gridTemplateStyle = { gridTemplateColumns };

  // Create a map of question codes to question data for quick lookup
  const questionsByCode = new Map(questions.map((q) => [q.code, q]));

  // Collect all unique comparison keys, sorted by question code (001, 002, …)
  const allComparisonKeys = Array.from(
    new Set(
      tools.flatMap((tool) =>
        Object.keys((tool.comparisonData as Record<string, unknown>) || {}),
      ),
    ),
  ).sort((a, b) => {
    const codeA = extractQuestionCode(a) ?? "";
    const codeB = extractQuestionCode(b) ?? "";
    return codeA.localeCompare(codeB);
  });

  // Filter comparison keys based on questions marked for comparison
  // If we have questions data, only show keys that match comparison-enabled questions
  // Otherwise (for backward compatibility), show all keys
  const filteredComparisonKeys =
    questions.length > 0
      ? allComparisonKeys.filter((key) => {
          const code = extractQuestionCode(key);
          if (!code) return false; // Skip keys without question codes
          const question = questionsByCode.get(code);
          return question?.forComparison === true;
        })
      : allComparisonKeys;

  const rows: Array<{
    label: string;
    supportiveText?: string | null;
    subtle?: boolean;
    render: (tool: Tool) => ReactNode;
  }> = [
    {
      label: "Description",
      render: (tool) =>
        tool.vendor ? <span className="text-sm">{tool.vendor}</span> : "—",
    },
    {
      label: "Summary",
      subtle: true,
      render: (tool) =>
        tool.summary ? (
          <div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {tool.summary}
            </p>
            <p className="text-muted-foreground/50 mt-1 text-[10px] italic">
              {AI_SUMMARY_SOURCE_NOTE}
            </p>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    ...filteredComparisonKeys.map((key) => {
      const code = extractQuestionCode(key);
      const question = code ? questionsByCode.get(code) : null;
      // Use question text if available, otherwise clean up the key
      const label =
        question?.questionText ??
        key
          .replace(QUESTION_CODE_REGEX, "")
          .trim()
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());

      return {
        label,
        supportiveText: question?.supportiveText,
        render: (tool: Tool) => {
          const val = (tool.comparisonData as Record<string, unknown>)?.[key];
          if (val === undefined || val === null || val === "") {
            return <span className="text-muted-foreground text-sm">—</span>;
          }

          const stringVal = typeof val === "object" ? JSON.stringify(val) : String(val);

          // Render multiple choice answers as bullet lists (even single items)
          if (question?.isMultipleChoice) {
            const items = parseMultipleChoiceValue(stringVal);
            if (items.length >= 1) {
              return (
                <ul className="list-disc space-y-0.5 pl-4 text-sm">
                  {items.map((item, index) => (
                    <li key={index} className="text-sm">
                      <AutoLinkedText text={item} />
                    </li>
                  ))}
                </ul>
              );
            }
          }

          return <AutoLinkedText text={stringVal} className="text-sm" />;
        },
      };
    }),
  ];

  const INITIAL_ROW_COUNT = 5;
  const visibleRows = isExpanded ? rows : rows.slice(0, INITIAL_ROW_COUNT);

  return (
    <div className="space-y-8">
      {/* AI Summary Section */}
      {tools.length >= 2 && (
        <Card className="border-primary/20 bg-[hsl(var(--surface))]/75 shadow-[0_30px_80px_-50px_hsl(var(--primary)/0.65)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-gradient">AI Highlights</CardTitle>
              <p className="text-muted-foreground text-sm">
                Pattern-matched risks and strengths
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingSummary && !summary ? (
              <ThinkingLoader />
            ) : isLoadingSummary && summary ? (
              <article className="prose prose-sm text-muted-foreground max-w-none">
                <SummaryContent summary={summary} />
                {isStreaming && (
                  <span className="bg-primary/60 ml-1 inline-block h-4 w-0.5 animate-pulse" />
                )}
              </article>
            ) : summary ? (
              summary === summaryDisabledCopy ? (
                <p className="text-muted-foreground text-sm">
                  AI summaries are disabled for this environment. Add a valid API key to
                  your `.env` to enable automated write-ups.
                </p>
              ) : (
                <article className="prose prose-sm text-muted-foreground max-w-none">
                  <SummaryContent summary={summary} />
                </article>
              )
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2 text-sm">
                    Generate AI-powered insights comparing {tools.length} selected tools
                  </p>
                  <p className="text-muted-foreground/70 text-xs">
                    Get pattern-matched strengths, differentiators, and implementation
                    considerations
                  </p>
                </div>
                <Button
                  onClick={handleGenerateSummary}
                  variant="default"
                  className="gap-2"
                  disabled={isLoadingSummary}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate AI Highlights
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="hidden md:block">
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="cursor-grab overflow-x-auto pb-6"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "hsl(var(--border)) transparent",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="border-border/50 inline-block overflow-hidden rounded-[32px] border bg-[hsl(var(--surface))]/70 shadow-[0_26px_90px_-45px_hsl(var(--primary)/0.55)]"
              style={{ minWidth: `${gridMinWidth}px` }}
            >
              <div
                className="border-border/40 grid items-stretch gap-0 border-b bg-[hsl(var(--surface-strong))]/70"
                style={gridTemplateStyle}
              >
                <div className="text-muted-foreground border-border/40 text-md sticky left-0 z-10 border-r bg-[hsl(var(--surface-strong))] px-6 py-4 font-semibold uppercase shadow-[4px_0_24px_-12px_rgba(0,0,0,0.3)]">
                  Tool
                </div>
                {tools.map((tool) => (
                  <div key={tool.id} className="flex flex-col gap-1 px-6 py-4">
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="text-foreground hover:text-primary text-xl font-semibold underline-offset-2 hover:underline"
                    >
                      {tool.name}
                    </Link>
                    <span className="text-muted-foreground text-xs uppercase">
                      {tool.category}
                    </span>
                  </div>
                ))}
              </div>
              <div className="divide-border/60 divide-y">
                {visibleRows.map((row) => (
                  <div
                    key={row.label}
                    className={cn(
                      "grid items-stretch gap-0",
                      row.subtle ? "bg-background/40" : "bg-background/55",
                    )}
                    style={gridTemplateStyle}
                  >
                    <div className="text-muted-foreground border-border/40 sticky left-0 z-10 flex flex-col gap-1 border-r bg-[hsl(var(--surface))] px-6 py-5 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.3)]">
                      <span className="text-md font-semibold uppercase">{row.label}</span>
                      {row.supportiveText && (
                        <span className="text-muted-foreground/70 text-[10px] leading-tight font-normal tracking-normal normal-case">
                          {row.supportiveText}
                        </span>
                      )}
                    </div>
                    {tools.map((tool) => (
                      <div
                        key={`${tool.id}-${row.label}`}
                        className="space-y-2 px-6 py-5"
                      >
                        {row.render(tool)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {rows.length > INITIAL_ROW_COUNT && (
                <div className="sticky left-0 z-10 w-full bg-[hsl(var(--surface))]/70 p-2">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground w-full justify-center gap-2"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show {rows.length - INITIAL_ROW_COUNT} more rows
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
          {showLeftArrow && (
            <div className="pointer-events-none absolute top-0 bottom-6 left-0 z-20 flex w-24 items-center justify-start bg-gradient-to-r from-[hsl(var(--background))] to-transparent pl-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--surface))] shadow-lg ring-1 ring-white/10">
                <ChevronLeft className="text-foreground h-6 w-6" />
              </div>
            </div>
          )}
          {showRightArrow && (
            <div className="pointer-events-none absolute top-0 right-0 bottom-6 z-20 flex w-24 items-center justify-end bg-gradient-to-l from-[hsl(var(--background))] to-transparent pr-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--surface))] shadow-lg ring-1 ring-white/10">
                <ChevronRight className="text-foreground h-6 w-6" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:hidden">
        {tools.map((tool) => (
          <Card key={tool.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-base">
                <Link
                  href={`/tools/${tool.slug}`}
                  className="hover:text-primary underline-offset-2 hover:underline"
                >
                  {tool.name}
                </Link>
                <Badge variant="secondary">{tool.category}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4 text-sm">
              <p>{tool.summary}</p>

              <div className="space-y-3">
                {filteredComparisonKeys.map((key) => {
                  const val = (tool.comparisonData as Record<string, unknown>)?.[key];
                  if (!val) return null;
                  const code = extractQuestionCode(key);
                  const question = code ? questionsByCode.get(code) : null;
                  const label =
                    question?.questionText ??
                    key
                      .replace(QUESTION_CODE_REGEX, "")
                      .trim()
                      .replace(/([A-Z])/g, " $1");

                  const stringVal =
                    typeof val === "object" ? JSON.stringify(val) : String(val);
                  const isMultiChoice = question?.isMultipleChoice;
                  const items = isMultiChoice ? parseMultipleChoiceValue(stringVal) : [];

                  return (
                    <div key={key}>
                      <p className="text-foreground mb-1 text-xs font-semibold tracking-wider uppercase">
                        {label}
                      </p>
                      {question?.supportiveText && (
                        <p className="text-muted-foreground/70 mb-1 text-[10px]">
                          {question.supportiveText}
                        </p>
                      )}
                      {isMultiChoice && items.length >= 1 ? (
                        <ul className="list-disc space-y-0.5 pl-4 text-sm">
                          {items.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm">{stringVal}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Parse inline markdown formatting (**bold**, *italic*) into React nodes.
 */
function formatInline(text: string, keyPrefix: string): ReactNode {
  const parts: ReactNode[] = [];
  // Match **bold** and *italic* (non-greedy)
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(<strong key={`${keyPrefix}-b-${match.index}`}>{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={`${keyPrefix}-i-${match.index}`}>{match[3]}</em>);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : <>{parts}</>;
}

function SummaryContent({ summary }: { summary: string }) {
  const lines = summary.split("\n").map((line) => line.trim());
  const content: ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (!currentList.length) return;
    content.push(
      <ul key={`list-${content.length}`} className="list-disc space-y-1 pl-5">
        {currentList.map((item, index) => (
          <li key={index}>{formatInline(item, `li-${content.length}-${index}`)}</li>
        ))}
      </ul>,
    );
    currentList = [];
  };

  lines.forEach((line) => {
    if (!line) {
      flushList();
      return;
    }
    if (line.startsWith("- ")) {
      currentList.push(line.slice(2));
      return;
    }
    flushList();
    if (line.startsWith("### ")) {
      content.push(
        <h3
          key={`h3-${content.length}`}
          className="text-foreground text-base font-semibold"
        >
          {formatInline(line.slice(4), `h3-${content.length}`)}
        </h3>,
      );
      return;
    }
    if (line.startsWith("## ")) {
      content.push(
        <h2
          key={`h2-${content.length}`}
          className="text-foreground text-lg font-semibold"
        >
          {formatInline(line.slice(3), `h2-${content.length}`)}
        </h2>,
      );
      return;
    }
    if (line.startsWith("# ")) {
      content.push(
        <h1
          key={`h1-${content.length}`}
          className="text-foreground text-xl font-semibold"
        >
          {formatInline(line.slice(2), `h1-${content.length}`)}
        </h1>,
      );
      return;
    }
    content.push(
      <p key={`p-${content.length}`} className="text-muted-foreground leading-relaxed">
        {formatInline(line, `p-${content.length}`)}
      </p>,
    );
  });

  flushList();

  return <Fragment>{content}</Fragment>;
}
