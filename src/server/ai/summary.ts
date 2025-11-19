import "server-only";

import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const openai = createOpenAI({
  apiKey: env.AI_GATEWAY_API_KEY,
});

export async function buildComparisonSummary(
  tools: Array<{ name: string; summary: string }>,
) {
  const prompt = [
    "You are helping sustainability leaders compare digital traceability tools.",
    "Summarize the overlapping strengths, standout differentiators, and implementation risks.",
    "Return Markdown with headings for Strengths, Differentiators, and Considerations.",
  ].join("\n");

  try {
    const result = await generateText({
      model: openai(env.AI_MODEL),
      prompt: `${prompt}\n\nTools:\n${tools
        .map((tool) => `- ${tool.name}: ${tool.summary}`)
        .join("\n")}`,
    });
    return result.text;
  } catch (error) {
    logger.error({ error }, "Failed to generate AI summary");
    return "AI summary is temporarily unavailable.";
  }
}
