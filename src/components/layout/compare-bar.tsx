"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCompareStore } from "@/store/useCompareStore";
import { COMPARE_LIMIT } from "@/lib/constants";

export function CompareBar() {
  const selections = useCompareStore((state) => state.selections);
  const remove = useCompareStore((state) => state.remove);
  const clear = useCompareStore((state) => state.clear);

  if (!selections.length) return null;

  const ids = selections.map((item) => item.id);
  const canCompare = ids.length > 0;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40">
      <div className="border-border/50 mx-auto flex max-w-3xl items-center justify-between rounded-full border bg-[hsl(var(--surface))]/85 px-4 py-2 shadow-[0_30px_70px_-40px_hsl(var(--primary)/0.5)] backdrop-blur-xl">
        <div className="flex flex-wrap gap-2 pr-4">
          {selections.map((item) => (
            <Badge key={item.id} variant="secondary" className="gap-2">
              <span className="max-w-[140px] truncate">{item.name}</span>
              <button
                className="text-muted-foreground hover:text-foreground text-xs transition"
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.name} from comparison`}
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
          {canCompare ? (
            <Button size="sm" asChild>
              <Link href={`/compare?ids=${ids.join(",")}`}>Compare</Link>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              className="pointer-events-none opacity-60"
              aria-disabled
            >
              Select tools
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
