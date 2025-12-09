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
      <div className="border-primary/60 from-primary via-primary/95 to-accent mx-auto flex max-w-3xl items-center justify-between rounded-full border-2 bg-gradient-to-r px-4 py-2 shadow-[0_30px_70px_-40px_hsl(var(--primary)/0.8),0_0_0_1px_hsl(var(--primary)/0.3)] backdrop-blur-xl">
        <div className="flex flex-wrap gap-2 pr-4">
          {selections.map((item) => (
            <Badge
              key={item.id}
              variant="secondary"
              className="bg-background/95 border-primary-foreground/20 gap-2 border backdrop-blur-sm"
            >
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
            <span className="text-primary-foreground text-xs font-semibold">
              {COMPARE_LIMIT - selections.length} slots remaining
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={clear}
            className="text-primary-foreground hover:bg-primary-foreground/25"
          >
            Clear
          </Button>
          {canCompare ? (
            <Button
              variant="selected"
              size="sm"
              asChild
              className="bg-background text-foreground hover:bg-background/95 ring-primary-foreground/40 font-semibold shadow-xl ring-2"
            >
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
