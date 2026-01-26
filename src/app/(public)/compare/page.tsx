import { getComparisonDataset } from "@/server/data/tools";
import {
  getComparisonQuestions,
  getSurveyQuestions,
} from "@/server/actions/survey-questions";
import { getToolFieldsFromMappings } from "@/server/data/tool-fields";
import { CompareContent } from "./compare-content";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams;
  const idsParam = params.ids ?? "";
  const ids = typeof idsParam === "string" ? idsParam.split(",").filter(Boolean) : [];

  // Fetch tools and all questions in parallel
  // We need all questions for metadata field mappings, and comparison questions for filtering
  const [rawTools, allQuestions, comparisonQuestions] = await Promise.all([
    ids.length ? getComparisonDataset(ids) : Promise.resolve([]),
    getSurveyQuestions(),
    getComparisonQuestions(),
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

  return <CompareContent tools={tools} questions={comparisonQuestions} />;
}
