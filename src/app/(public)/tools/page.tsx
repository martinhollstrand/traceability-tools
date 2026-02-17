import { listTools, getAvailableCategories } from "@/server/data/tools";
import { getSurveyQuestions } from "@/server/actions/survey-questions";
import { getToolFieldsFromMappings } from "@/server/data/tool-fields";
import { FilterBar } from "@/components/tools/filter-bar";
import { ToolsDirectory } from "@/components/tools/tools-directory";
import { COMPARE_LIMIT } from "@/lib/constants";

const VALID_SORTS = ["name", "category", "updated"] as const;
type SortOption = (typeof VALID_SORTS)[number];

function parseSortParam(value: unknown): SortOption {
  if (typeof value === "string" && VALID_SORTS.includes(value as SortOption)) {
    return value as SortOption;
  }
  return "name";
}

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const categories = params.category ? arrayify(params.category) : [];
  const sortBy = parseSortParam(params.sort);

  const [rawTools, availableCategories, allQuestions] = await Promise.all([
    listTools({
      query,
      categories,
      sortBy,
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
        secondaryCategory: tool.secondaryCategory,
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
      secondaryCategory: dynamicFields.secondaryCategory ?? tool.secondaryCategory,
    };
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
      <FilterBar
        defaultQuery={query}
        defaultCategories={categories}
        availableCategories={availableCategories}
      />
      <ToolsDirectory
        tools={tools}
        currentSort={sortBy}
        toolCount={tools.length}
        compareLimit={COMPARE_LIMIT}
      />
    </div>
  );
}

function arrayify(value: string | string[]) {
  return Array.isArray(value) ? value : [value];
}
