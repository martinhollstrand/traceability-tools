"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useOptimistic, useTransition } from "react";

export function ToolSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";
  const [value, setValue] = useOptimistic(queryFromUrl);
  const [isPending, startTransition] = useTransition();

  const updateQuery = (nextValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextValue) {
      params.set("q", nextValue);
    } else {
      params.delete("q");
    }
    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  };

  return (
    <div className="relative w-full">
      <input
        type="search"
        placeholder="Sök verktyg, vendor eller kategori"
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);
          updateQuery(nextValue);
        }}
        className="w-full rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-3 text-sm transition-shadow outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/40"
      />
      {isPending && (
        <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-[hsl(var(--muted))]">
          Laddar…
        </span>
      )}
    </div>
  );
}
