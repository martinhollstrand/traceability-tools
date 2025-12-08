import { getComparisonDataset } from "@/server/data/tools";
import { CompareContent } from "./compare-content";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams;
  const idsParam = params.ids ?? "";
  const ids = typeof idsParam === "string" ? idsParam.split(",").filter(Boolean) : [];
  const tools = ids.length ? await getComparisonDataset(ids) : [];

  return <CompareContent tools={tools} />;
}
