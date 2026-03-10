"use client";

import { useMemo, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { setToolCategorySearchFilterVisibility } from "@/server/actions/tool-categories";

type ToolCategorySetting = {
  id: string;
  name: string;
  showInSearchFilter: boolean;
  usageCount: number;
};

type CategoriesPageClientProps = {
  categories: ToolCategorySetting[];
};

export function CategoriesPageClient({ categories }: CategoriesPageClientProps) {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  const visibleCount = categories.filter(
    (category) => category.showInSearchFilter,
  ).length;
  const unusedCount = categories.filter((category) => category.usageCount === 0).length;

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return categories;

    return categories.filter((category) =>
      category.name.toLowerCase().includes(normalizedQuery),
    );
  }, [categories, query]);

  const handleToggle = (category: ToolCategorySetting) => {
    startTransition(async () => {
      await setToolCategorySearchFilterVisibility({
        id: category.id,
        showInSearchFilter: !category.showInSearchFilter,
      });
    });
  };

  if (categories.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-[hsl(var(--muted))]">
        No categories found yet. Categories appear here automatically after they are
        detected on published tools.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-[hsl(var(--muted))]">
          {categories.length} categories total, {visibleCount} visible in the `/tools`
          filter
          {unusedCount > 0 ? `, ${unusedCount} unused` : ""}
        </div>
        <div className="w-full sm:w-80">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search categories..."
          />
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))]">
              <tr>
                <th className="px-4 py-3 font-semibold text-[hsl(var(--muted))]">
                  Category
                </th>
                <th className="px-4 py-3 font-semibold text-[hsl(var(--muted))]">
                  Tools using it
                </th>
                <th className="px-4 py-3 text-center font-semibold text-[hsl(var(--muted))]">
                  Search Filter
                </th>
                <th className="px-4 py-3 font-semibold text-[hsl(var(--muted))]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-sm text-[hsl(var(--muted))]"
                  >
                    No categories match &quot;{query.trim()}&quot;.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-[hsl(var(--surface-strong))]/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[hsl(var(--foreground))]">
                          {category.name}
                        </span>
                        {category.usageCount === 0 && (
                          <Badge variant="outline">Unused</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted))]">
                      {category.usageCount}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(category)}
                        disabled={isPending}
                        aria-label={`${category.showInSearchFilter ? "Hide" : "Show"} ${
                          category.name
                        } in tools search filters`}
                        className={cn(
                          "inline-flex h-6 w-10 items-center rounded-full transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50",
                          category.showInSearchFilter
                            ? "bg-[hsl(var(--foreground))]"
                            : "bg-[hsl(var(--border))]",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                            category.showInSearchFilter
                              ? "translate-x-5"
                              : "translate-x-1",
                          )}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted))]">
                      {category.showInSearchFilter
                        ? "Visible in `/tools` filter"
                        : "Hidden"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
