import pino from "pino";

const isProd = process.env.NODE_ENV === "production";
// Disable pino-pretty in Next.js to avoid "worker has exited" errors
// pino-pretty uses worker threads that conflict with Next.js/SWC bundler
// Only use pino-pretty in standalone scripts (when NEXT_RUNTIME is not set)
const isNextJs = typeof process.env.NEXT_RUNTIME !== "undefined";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
  base: undefined,
  // Disable pino-pretty transport in Next.js environments
  // Logs will still be readable JSON format
  transport:
    !isNextJs && !isProd && process.env.USE_PRETTY_LOGS !== "false"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        }
      : undefined,
});

export function logError(error: unknown, context: Record<string, unknown> = {}) {
  logger.error({ error, ...context });
}
