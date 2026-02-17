"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortDropdown } from "@/components/tools/sort-dropdown";
import { ToolTable } from "@/components/tools/tool-table";
import type { Tool } from "@/lib/validators/tool";

type ToolsDirectoryProps = {
  tools: Tool[];
  currentSort: string;
  toolCount: number;
  compareLimit: number;
};

export function ToolsDirectory({
  tools,
  currentSort,
  toolCount,
  compareLimit,
}: ToolsDirectoryProps) {
  const [showSummaries, setShowSummaries] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm tracking-widest uppercase">
            Directory
          </p>
          <h1 className="text-3xl font-semibold">Traceability & ESG tools</h1>
          <p className="text-muted-foreground text-sm">
            {toolCount} tools match your filters. Select up to {compareLimit} to compare
            in detail.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs whitespace-nowrap"
            onClick={() => setShowSummaries(!showSummaries)}
          >
            {showSummaries ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                Hide summaries
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                Show summaries
              </>
            )}
          </Button>
          <SortDropdown currentSort={currentSort} />
        </div>
      </div>
      <ToolTable tools={tools} showSummaries={showSummaries} />
    </div>
  );
}
