import { listTools, getAvailableCategories } from "@/server/data/tools";
import { getSurveyQuestions } from "@/server/actions/survey-questions";
import { getToolFieldsFromMappings } from "@/server/data/tool-fields";
import { FilterBar } from "@/components/tools/filter-bar";
import { ToolTable } from "@/components/tools/tool-table";
import { COMPARE_LIMIT } from "@/lib/constants";

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const categories = params.category ? arrayify(params.category) : [];

  const [rawTools, availableCategories, allQuestions] = await Promise.all([
    listTools({
      query,
      categories,
    }),
    getAvailableCategories(),
    getSurveyQuestions(),
  ]);

  // Enrich tools with dynamically mapped field values
  const tools = rawTools.map((tool) => {
    const dynamicFields = getToolFieldsFromMappings(
      {
        name: tool.name,
        vendor: tool.vendor,
        website: tool.website,
        category: tool.category,
        rawData: (tool.rawData as Record<string, unknown>) ?? {},
      },
      allQuestions,
    );

    return {
      ...tool,
      name: dynamicFields.name,
      vendor: dynamicFields.vendor ?? tool.vendor,
      website: dynamicFields.website ?? tool.website,
      category: dynamicFields.category ?? tool.category,
    };
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
      <FilterBar
        defaultQuery={query}
        defaultCategories={categories}
        availableCategories={availableCategories}
      />
      <div className="space-y-4">
        <div>
          <p className="text-muted-foreground text-sm tracking-widest uppercase">
            Directory
          </p>
          <h1 className="text-3xl font-semibold">Traceability & ESG tools</h1>
          <p className="text-muted-foreground text-sm">
            {tools.length} tools match your filters. Select up to {COMPARE_LIMIT} to
            compare in detail.
          </p>
        </div>
        <ToolTable tools={tools} />
      </div>
    </div>
  );
}

function arrayify(value: string | string[]) {
  return Array.isArray(value) ? value : [value];
}
