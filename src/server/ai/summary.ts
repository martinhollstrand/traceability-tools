import "server-only";

import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const DISABLED_KEYS = new Set(
  ["disabled", "skip", "dev-placeholder-key", "local-dev", "test-ai-key"].map((key) =>
    key.toLowerCase(),
  ),
);

const gatewayKey = env.AI_GATEWAY_API_KEY.trim();
const isAiGatewayEnabled = !DISABLED_KEYS.has(gatewayKey.toLowerCase());
const AI_REQUEST_TIMEOUT_MS = 30000;

const openai = isAiGatewayEnabled
  ? createOpenAI({
      apiKey: gatewayKey,
      baseURL: env.AI_GATEWAY_BASE_URL,
    })
  : null;

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error(timeoutMessage));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}

export async function generateToolSummary(
  toolName: string,
  rawData: Record<string, unknown>,
) {
  if (!openai) {
    return null;
  }

  // Filter out empty values to reduce token usage
  const cleanData = Object.entries(rawData).reduce(
    (acc, [k, v]) => {
      if (v && String(v).trim()) acc[k] = v;
      return acc;
    },
    {} as Record<string, unknown>,
  );

  const prompt = [
    `Generate a concise, 2-3 sentence summary for the tool "${toolName}" based on the provided data attributes.`,
    "Focus on its primary function, target audience, and key strengths if mentioned.",
    "Do not use marketing fluff. Be objective.",
    "If there is not enough information to summarize, return an empty string.",
    "\nData attributes:",
    JSON.stringify(cleanData, null, 2),
  ].join("\n");

  try {
    const { text } = await withTimeout(
      generateText({
        model: openai(env.AI_MODEL),
        prompt,
        temperature: 0.3,
        maxTokens: 150,
      }),
      AI_REQUEST_TIMEOUT_MS,
      `Tool summary generation timed out after ${AI_REQUEST_TIMEOUT_MS / 1000} seconds`,
    );
    return text;
  } catch (error) {
    logger.error({ error }, "Failed to generate tool summary");
    return null;
  }
}

export async function buildComparisonSummary(
  tools: Array<{ name: string; summary: string }>,
) {
  const prompt = [
    "You are helping sustainability leaders compare digital traceability tools.",
    "Summarize the overlapping strengths, standout differentiators, and implementation risks.",
    "Return Markdown with headings for Strengths, Differentiators, and Considerations.",
  ].join("\n");

  if (!openai) {
    logger.info("AI summary skipped: gateway disabled for this environment");
    return "AI summary is disabled in this environment.";
  }

  try {
    const result = await withTimeout(
      generateText({
        model: openai(env.AI_MODEL),
        prompt: `${prompt}\n\nTools:\n${tools
          .map((tool) => `- ${tool.name}: ${tool.summary}`)
          .join("\n")}`,
      }),
      AI_REQUEST_TIMEOUT_MS,
      `AI summary generation timed out after ${AI_REQUEST_TIMEOUT_MS / 1000} seconds`,
    );

    return result.text;
  } catch (error) {
    // Handle specific error types - wrap logger calls to prevent uncaught exceptions
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
      // If logging itself fails, use console.error as fallback
      console.error("Failed to generate AI summary:", error);
      console.error("Logger error:", logError);
    }

    return "AI summary is temporarily unavailable.";
  }
}
