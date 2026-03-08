"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  regenerateToolSummaryAction,
  regenerateMissingSummariesAction,
  type SummaryStats,
} from "@/server/actions/ai-summaries";

type SummariesPageClientProps = {
  initialStats: SummaryStats;
};

export function SummariesPageClient({ initialStats }: SummariesPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingToolId, setLoadingToolId] = useState<string | null>(null);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchResult, setBatchResult] = useState<{
    generated: number;
    failed: number;
    total: number;
  } | null>(null);
  const [toolResults, setToolResults] = useState<
    Record<string, { success: boolean; error?: string }>
  >({});

  const stats = initialStats;

  const handleRegenerate = async (toolId: string) => {
    setLoadingToolId(toolId);
    setToolResults((prev) => ({ ...prev, [toolId]: undefined! }));

    try {
      const result = await regenerateToolSummaryAction(toolId);
      setToolResults((prev) => ({
        ...prev,
        [toolId]: { success: result.success, error: result.error },
      }));
      if (result.success) {
        startTransition(() => router.refresh());
      }
    } catch {
      setToolResults((prev) => ({
        ...prev,
        [toolId]: { success: false, error: "Unexpected error" },
      }));
    } finally {
      setLoadingToolId(null);
    }
  };

  const handleBatchGenerate = async () => {
    setBatchRunning(true);
    setBatchResult(null);

    try {
      const result = await regenerateMissingSummariesAction();
      setBatchResult(result);
      startTransition(() => router.refresh());
    } catch {
      setBatchResult({ generated: 0, failed: 0, total: 0 });
    } finally {
      setBatchRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total tools" value={stats.total} />
        <StatCard label="With summary" value={stats.withSummary} />
        <StatCard
          label="Missing summary"
          value={stats.withoutSummary}
          highlight={stats.withoutSummary > 0}
        />
      </div>

      {stats.withoutSummary > 0 && (
        <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="font-semibold text-[hsl(var(--foreground))]">
              Generate missing summaries
            </p>
            <p className="text-sm text-[hsl(var(--muted))]">
              Run AI summary generation for all {stats.withoutSummary} tools that
              don&apos;t have one yet. Tools are processed one at a time.
            </p>
          </div>
          <Button onClick={handleBatchGenerate} disabled={batchRunning || isPending}>
            {batchRunning ? "Generating…" : "Generate all missing"}
          </Button>
        </Card>
      )}

      {batchResult && (
        <Card className="p-5">
          <p className="text-sm text-[hsl(var(--foreground))]">
            Batch complete: {batchResult.generated} generated, {batchResult.failed} failed
            out of {batchResult.total} tools.
          </p>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))]">
              <tr>
                <th className="px-4 py-3 font-semibold text-[hsl(var(--muted))]">Tool</th>
                <th className="px-4 py-3 font-semibold text-[hsl(var(--muted))]">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[hsl(var(--muted))]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {stats.tools.map((tool) => {
                const result = toolResults[tool.id];
                const isLoading = loadingToolId === tool.id;

                return (
                  <tr
                    key={tool.id}
                    className={cn(
                      "hover:bg-[hsl(var(--surface-strong))]/50",
                      !tool.hasSummary && "bg-amber-50/30 dark:bg-amber-950/10",
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))]">
                      {tool.name}
                    </td>
                    <td className="px-4 py-3">
                      {result?.success ? (
                        <Badge variant="success">Generated</Badge>
                      ) : result?.error ? (
                        <Badge variant="destructive">Failed</Badge>
                      ) : tool.hasSummary ? (
                        <Badge variant="success">Has summary</Badge>
                      ) : (
                        <Badge variant="warning">Missing</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerate(tool.id)}
                        disabled={isLoading || batchRunning || isPending}
                      >
                        {isLoading
                          ? "Generating…"
                          : tool.hasSummary
                            ? "Regenerate"
                            : "Generate"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5",
        highlight && "border-amber-500/30",
      )}
    >
      <p className="text-xs tracking-[0.3em] text-[hsl(var(--muted))]">{label}</p>
      <p
        className={cn(
          "mt-2 text-3xl font-semibold",
          highlight
            ? "text-amber-600 dark:text-amber-400"
            : "text-[hsl(var(--foreground))]",
        )}
      >
        {value}
      </p>
    </div>
  );
}
