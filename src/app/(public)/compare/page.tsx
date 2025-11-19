import { ComparisonGrid } from "@/components/tools/comparison-grid";
import { Button } from "@/components/ui/button";
import { buildComparisonSummary } from "@/server/ai/summary";
import { getComparisonDataset } from "@/server/data/tools";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams;
  const idsParam = params.ids ?? "";
  const ids =
    typeof idsParam === "string" ? idsParam.split(",").filter(Boolean).slice(0, 3) : [];
  const tools = ids.length ? await getComparisonDataset(ids) : [];
  const summary = tools.length
    ? await buildComparisonSummary(
        tools.map((tool) => ({ name: tool.name, summary: tool.summary })),
      )
    : undefined;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm tracking-widest uppercase">
            Workspace
          </p>
          <h1 className="text-3xl font-semibold">Comparison studio</h1>
          <p className="text-muted-foreground text-sm">
            Select up to three tools to unlock AI insights, metadata diffs, and exportable
            notes.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href="/tools">Add more tools</a>
        </Button>
      </div>

      {tools.length ? (
        <ComparisonGrid tools={tools} summary={summary} />
      ) : (
        <div className="border-border/70 text-muted-foreground rounded-3xl border border-dashed p-10 text-center">
          You have not selected any tools yet. Choose them from the directory to start
          comparing.
        </div>
      )}
    </div>
  );
}
