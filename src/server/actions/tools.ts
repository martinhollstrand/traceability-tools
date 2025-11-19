import "server-only";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { toolsTable } from "@/server/db/schema";
import { logError } from "@/lib/logger";

type ToolPayload = {
  name: string;
  slug: string;
  vendor?: string;
  category?: string;
  summary?: string;
  website?: string;
  highlights?: string[];
  regions?: string[];
  capabilities?: Record<string, unknown>;
  comparisonData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  status?: "draft" | "published" | "archived";
  isFeatured?: boolean;
};

export async function createTool(payload: ToolPayload) {
  try {
    await db.insert(toolsTable).values({
      name: payload.name,
      slug: payload.slug,
      vendor: payload.vendor,
      category: payload.category,
      summary: payload.summary,
      website: payload.website,
      highlights: payload.highlights ?? [],
      regions: payload.regions ?? [],
      capabilities: payload.capabilities ?? {},
      comparisonData: payload.comparisonData ?? {},
      metadata: payload.metadata ?? {},
      status: payload.status ?? "draft",
      isFeatured: payload.isFeatured ?? false,
    });
    revalidatePath("/tools");
  } catch (error) {
    logError(error, { action: "createTool" });
    throw error;
  }
}

export async function updateTool(id: string, payload: Partial<ToolPayload>) {
  try {
    await db.update(toolsTable).set(payload).where(eq(toolsTable.id, id));
    revalidatePath("/tools");
  } catch (error) {
    logError(error, { action: "updateTool", id });
    throw error;
  }
}

export async function deleteTool(id: string) {
  try {
    await db.delete(toolsTable).where(eq(toolsTable.id, id));
    revalidatePath("/tools");
  } catch (error) {
    logError(error, { action: "deleteTool", id });
    throw error;
  }
}
