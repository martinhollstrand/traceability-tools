"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCompareStore } from "@/store/useCompareStore";
import { ComparisonGrid } from "@/components/tools/comparison-grid";
import { Button } from "@/components/ui/button";
import type { Tool } from "@/lib/validators/tool";
import type { SurveyQuestion } from "@/server/actions/survey-questions";

type CompareContentProps = {
  tools: Tool[];
  questions: SurveyQuestion[];
};

export function CompareContent({ tools, questions }: CompareContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selections = useCompareStore((state) => state.selections);

  // Check if we need to redirect to include IDs from store
  useEffect(() => {
    const idsParam = searchParams.get("ids");
    const hasIdsInUrl = Boolean(idsParam);

    // If no IDs in URL but we have selections in store, redirect with IDs
    if (!hasIdsInUrl && selections.length > 0) {
      const ids = selections.map((item) => item.id).join(",");
      router.replace(`/compare?ids=${ids}`, { scroll: false });
    }
  }, [searchParams, selections, router]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm tracking-widest uppercase">
            Workspace
          </p>
          <h1 className="text-3xl font-semibold">Comparison</h1>
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
        <ComparisonGrid tools={tools} questions={questions} />
      ) : (
        <div className="border-border/70 text-muted-foreground rounded-3xl border border-dashed p-10 text-center">
          You have not selected any tools yet. Choose them from the directory to start
          comparing.
        </div>
      )}
    </div>
  );
}
