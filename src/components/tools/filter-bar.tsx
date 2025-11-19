"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORY_FILTERS, FEATURE_TAGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type FilterBarProps = {
  defaultQuery?: string;
  defaultCategories?: string[];
  defaultTags?: string[];
};

export function FilterBar({
  defaultQuery = "",
  defaultCategories = [],
  defaultTags = [],
}: FilterBarProps) {
  const [query, setQuery] = React.useState(defaultQuery);
  const [categories, setCategories] = React.useState<string[]>(defaultCategories);
  const [tags, setTags] = React.useState<string[]>(defaultTags);

  function toggle(list: string[], value: string) {
    return list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];
  }

  function submitFilters(form: HTMLFormElement) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    categories.forEach((category) => params.append("category", category));
    tags.forEach((tag) => params.append("tag", tag));
    window.location.assign(`/tools?${params.toString()}`);
    form.reset();
  }

  return (
    <form
      className="border-border/80 bg-background/70 space-y-6 rounded-3xl border p-6"
      onSubmit={(event) => {
        event.preventDefault();
        submitFilters(event.currentTarget);
      }}
    >
      <div>
        <label className="text-muted-foreground text-xs font-semibold uppercase">
          Search
        </label>
        <Input
          placeholder="Search vendors, capabilities, or compliance keywords"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <label className="text-muted-foreground text-xs font-semibold uppercase">
          Categories
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((category) => {
            const active = categories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => setCategories((prev) => toggle(prev, category))}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="text-muted-foreground text-xs font-semibold uppercase">
          Feature tags
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {FEATURE_TAGS.map((tag) => {
            const active = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setTags((prev) => toggle(prev, tag))}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs",
                  active
                    ? "border-secondary bg-secondary/20 text-secondary-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => (setCategories([]), setTags([]), setQuery(""))}
        >
          Reset
        </Button>
        <Button type="submit">Apply filters</Button>
      </div>
    </form>
  );
}
