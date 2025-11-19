import { NextResponse } from "next/server";
import { buildComparisonSummary } from "@/server/ai/summary";
import { getComparisonDataset } from "@/server/data/tools";

export async function POST(request: Request) {
  const { ids } = await request.json();
  if (!Array.isArray(ids) || !ids.length) {
    return NextResponse.json({ error: "Tool IDs required" }, { status: 400 });
  }

  const dataset = await getComparisonDataset(ids.slice(0, 3));
  if (!dataset.length) {
    return NextResponse.json({ error: "No tools found" }, { status: 404 });
  }

  const summary = await buildComparisonSummary(
    dataset.map((tool) => ({
      name: tool.name,
      summary: tool.summary,
    })),
  );

  return NextResponse.json({ summary });
}
