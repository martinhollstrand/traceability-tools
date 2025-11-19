"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCompareStore } from "@/store/useCompareStore";
import { COMPARE_LIMIT } from "@/lib/constants";

export function CompareBar() {
  const selections = useCompareStore((state) => state.selections);
  const toggle = useCompareStore((state) => state.toggle);
  const clear = useCompareStore((state) => state.clear);

  if (!selections.length) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40">
      <div className="border-border bg-background/95 mx-auto flex max-w-3xl items-center justify-between rounded-full border px-4 py-2 shadow-xl backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {selections.map((id) => (
            <Badge key={id} variant="secondary" className="gap-2">
              {id}
              <button
                className="text-muted-foreground text-xs"
                onClick={() => toggle(id)}
              >
                ✕
              </button>
            </Badge>
          ))}
          {selections.length < COMPARE_LIMIT && (
            <span className="text-muted-foreground text-xs">
              {COMPARE_LIMIT - selections.length} slots remaining
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear
          </Button>
          <Button size="sm" asChild>
            <Link href={`/compare?ids=${selections.join(",")}`}>Compare</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
