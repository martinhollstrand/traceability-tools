import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getComparisonDataset } from "@/server/data/tools";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const DISABLED_KEYS = new Set(
  ["disabled", "skip", "dev-placeholder-key", "local-dev", "test-ai-key"].map((key) =>
    key.toLowerCase(),
  ),
);

const gatewayKey = env.AI_GATEWAY_API_KEY.trim();
const isAiGatewayEnabled = !DISABLED_KEYS.has(gatewayKey.toLowerCase());

const openai = isAiGatewayEnabled
  ? createOpenAI({
      apiKey: gatewayKey,
      baseURL: env.AI_GATEWAY_BASE_URL,
    })
  : null;

export async function POST(request: Request) {
  const { ids } = await request.json();
  if (!Array.isArray(ids) || !ids.length) {
    return Response.json({ error: "Tool IDs required" }, { status: 400 });
  }

  const dataset = await getComparisonDataset(ids.slice(0, 3));
  if (!dataset.length) {
    return Response.json({ error: "No tools found" }, { status: 404 });
  }

  if (!openai) {
    return Response.json(
      { summary: "AI summary is disabled in this environment." },
      { status: 200 },
    );
  }

  const prompt = [
    "You are helping sustainability leaders compare digital traceability tools.",
    "Summarize the overlapping strengths, standout differentiators, and implementation risks.",
    "Return Markdown with headings for Strengths, Differentiators, and Considerations.",
  ].join("\n");

  try {
    const result = await streamText({
      model: openai(env.AI_MODEL),
      prompt: `${prompt}\n\nTools:\n${dataset
        .map((tool) => `- ${tool.name}: ${tool.summary}`)
        .join("\n")}`,
    });

    // Use toTextStreamResponse for simpler text streaming
    return result.toTextStreamResponse();
  } catch (error) {
    try {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("worker has exited")) {
        logger.warn(
          { error: errorMessage },
          "AI worker thread exited unexpectedly - this may indicate API connection issues",
        );
      } else {
        logger.error(
          { error: error instanceof Error ? error : new Error(String(error)) },
          "Failed to generate AI summary",
        );
      }
    } catch (logError) {
      console.error("Failed to generate AI summary:", error);
      console.error("Logger error:", logError);
    }

    return Response.json(
      { error: "AI summary is temporarily unavailable." },
      { status: 500 },
    );
  }
}
