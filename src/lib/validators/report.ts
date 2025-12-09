import { z } from "zod";

export const reportSchema = z.object({
  id: z.string(),
  toolId: z.string(),
  title: z.string(),
  pdfUrl: z.string().url().optional(),
  highlights: z.array(
    z.object({
      label: z.string(),
      detail: z.string(),
    }),
  ),
  metadata: z
    .object({
      author: z.string().optional(),
      publishedAt: z.string().optional(),
      tags: z.array(z.string()).optional(),
      pdfFilename: z.string().optional(),
      pdfSize: z.number().optional(),
      pdfUploadedAt: z.string().optional(),
    })
    .optional(),
});

export type ReportMetadata = z.infer<typeof reportSchema>;
