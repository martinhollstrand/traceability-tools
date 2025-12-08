"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useCompareStore } from "@/store/useCompareStore";
import { cn } from "@/lib/utils";

export function CompareButton() {
  const selections = useCompareStore((state) => state.selections);
  const hasEnoughSelections = selections.length >= 2;

  const compareHref = useMemo(() => {
    if (!hasEnoughSelections) {
      return "/compare";
    }
    const ids = selections.map((item) => item.id);
    return `/compare?ids=${ids.join(",")}`;
  }, [selections, hasEnoughSelections]);

  return (
    <Button
      asChild
      size="sm"
      variant={hasEnoughSelections ? "secondary" : "outline"}
      className={cn(
        hasEnoughSelections &&
          "shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.5)] hover:shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.6)]",
      )}
    >
      <Link href={compareHref}>
        Launch Compare
        {hasEnoughSelections && (
          <span className="bg-primary-foreground/20 ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
            {selections.length}
          </span>
        )}
      </Link>
    </Button>
  );
}
