import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(16),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  BETTER_AUTH_ADMIN_EMAILS: z.string().optional(),
  AI_GATEWAY_API_KEY: z.string().min(1),
  AI_GATEWAY_BASE_URL: z.string().url().default("https://ai-gateway.vercel.sh/v1"),
  AI_MODEL: z.string().default("xai/grok-code-fast-1"),
  STORAGE_BUCKET_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  EXCEL_UPLOAD_MAX_MB: z.string().default("15"),
});

const parsed = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  BETTER_AUTH_ADMIN_EMAILS: process.env.BETTER_AUTH_ADMIN_EMAILS,
  AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
  AI_GATEWAY_BASE_URL: process.env.AI_GATEWAY_BASE_URL,
  AI_MODEL: process.env.AI_MODEL,
  STORAGE_BUCKET_URL: process.env.STORAGE_BUCKET_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  EXCEL_UPLOAD_MAX_MB: process.env.EXCEL_UPLOAD_MAX_MB,
});

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = {
  ...parsed.data,
};
