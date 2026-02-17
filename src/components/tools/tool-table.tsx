"use client";

import { useState } from "react";
import Link from "next/link";
import { useCompareStore } from "@/store/useCompareStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Tool } from "@/lib/validators/tool";

type ToolTableProps = {
  tools: Tool[];
};

export function ToolTable({ tools }: ToolTableProps) {
  const selections = useCompareStore((state) => state.selections);
  const toggle = useCompareStore((state) => state.toggle);
  const [showSummaries, setShowSummaries] = useState(true);

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 text-xs"
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
      </div>
      <Table className="bg-[hsl(var(--surface))]/75">
        <TableHeader className="bg-[hsl(var(--surface-strong))]/70 font-bold">
          <TableRow>
            <TableHead className="min-w-[220px]">Tool</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>2nd Category</TableHead>
            <TableHead className="text-right">Select</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tools.map((tool) => {
            const isSelected = selections.some((item) => item.id === tool.id);
            const metadata = (tool.metadata ?? {}) as Record<string, unknown>;
            const tagline =
              typeof metadata["tagline"] === "string"
                ? (metadata["tagline"] as string)
                : undefined;

            return (
              <TableRow
                key={tool.id}
                data-state={isSelected ? "selected" : undefined}
                className="transition-colors hover:bg-[hsl(var(--surface-strong))]/40"
              >
                <TableCell className="align-top">
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="text-foreground hover:text-primary cursor-pointer text-sm font-semibold transition-colors"
                    >
                      {tool.name}
                    </Link>
                    {tagline && (
                      <p className="text-muted-foreground/70 text-[10px] tracking-wider uppercase">
                        {tagline}
                      </p>
                    )}
                    {showSummaries && tool.summary && (
                      <p className="text-muted-foreground line-clamp-2 text-xs leading-snug">
                        {tool.summary}
                      </p>
                    )}
                    <p className="text-muted-foreground/80 text-[11px]">
                      {tool.vendor ? `By ${tool.vendor}` : "Vendor TBD"}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <Badge variant="secondary">{tool.category}</Badge>
                </TableCell>
                <TableCell className="align-top">
                  {tool.secondaryCategory ? (
                    <Badge variant="secondary">{tool.secondaryCategory}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right align-top">
                  <Button
                    size="sm"
                    variant={isSelected ? "selected" : "secondary"}
                    onClick={() =>
                      toggle({
                        id: tool.id,
                        name: tool.name,
                        slug: tool.slug,
                        category: tool.category,
                        summary: tool.summary,
                      })
                    }
                    aria-pressed={isSelected}
                  >
                    {isSelected ? "Selected" : "Add to compare"}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
