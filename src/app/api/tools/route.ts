import { NextResponse } from "next/server";
import { listTools } from "@/server/data/tools";
import { createTool } from "@/server/actions/tools";
import { toolSchema } from "@/lib/validators/tool";

export async function GET() {
  const tools = await listTools();
  return NextResponse.json(tools, {
    headers: {
      "Cache-Tag": "tools:data",
    },
  });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = toolSchema.partial({ id: true, stats: true }).safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await createTool({
    name: parsed.data.name ?? "",
    slug: parsed.data.slug ?? "",
    vendor: parsed.data.vendor ?? "",
    category: parsed.data.category ?? "",
    summary: parsed.data.summary ?? "",
    website: parsed.data.website ?? "",
    highlights: parsed.data.tags ?? [],
    capabilities: parsed.data.capabilities,
    comparisonData: parsed.data.comparisonData,
    metadata: parsed.data.metadata,
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
