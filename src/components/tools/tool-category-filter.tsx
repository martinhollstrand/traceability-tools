"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  categories: string[];
  current: string;
};

export function ToolCategoryFilter({ categories, current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "alla") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  const pills = ["alla", ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((pill) => (
        <button
          key={pill}
          type="button"
          onClick={() => handleSelect(pill)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm font-medium capitalize",
            current === pill
              ? "border-transparent bg-[hsl(var(--foreground))] text-[hsl(var(--surface))]"
              : "border-[hsl(var(--border))] text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
          )}
        >
          {pill}
        </button>
      ))}
    </div>
  );
}
