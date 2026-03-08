import { getToolSummaryStats } from "@/server/actions/ai-summaries";
import { SummariesPageClient } from "./page-client";

export default async function SummariesPage() {
  const stats = await getToolSummaryStats();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.4em] text-[hsl(var(--muted))]">AI</p>
        <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))]">
          Tool Summaries
        </h1>
        <p className="text-sm text-[hsl(var(--muted))]">
          Generate or regenerate AI summaries for individual tools or in batch.
        </p>
      </div>

      <SummariesPageClient initialStats={stats} />
    </div>
  );
}
