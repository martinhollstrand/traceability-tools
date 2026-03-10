import { CategoriesPageClient } from "./page-client";
import { listToolCategorySettings } from "@/server/data/tool-categories";

export default async function CategoriesPage() {
  const categories = await listToolCategorySettings();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.4em] text-[hsl(var(--muted))]">Directory</p>
        <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))]">
          Category Management
        </h1>
        <p className="text-sm text-[hsl(var(--muted))]">
          Categories are discovered from published tools. Toggle whether each one should
          be available in the public `/tools` category filter.
        </p>
      </div>

      <CategoriesPageClient categories={categories} />
    </div>
  );
}
