import { z } from "zod";

export const toolSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  vendor: z.string(),
  category: z.string(),
  summary: z.string(),
  website: z.string().url(),
  logoUrl: z.string().url().optional(),
  tags: z.array(z.string()),
  features: z.array(z.string()).optional(),
  stats: z.object({
    customers: z.number().int().nonnegative(),
    coverage: z.number().min(0).max(1),
    contracts: z.number().int().nonnegative(),
  }),
  metadata: z.record(z.any()).optional(),
  capabilities: z.record(z.any()).optional(),
  comparisonData: z.record(z.any()).optional(),
  featureScore: z.record(z.number()).optional(),
  updatedAt: z.string(),
});

export type Tool = z.infer<typeof toolSchema>;

export const compareInputSchema = z.object({
  toolIds: z.array(z.string()).min(1).max(3),
});
