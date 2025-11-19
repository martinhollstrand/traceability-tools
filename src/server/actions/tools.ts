import "server-only";

import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/server/db";
import { tools } from "@/server/db/schema";
import { CACHE_TAGS } from "@/lib/constants";
import { logError } from "@/lib/logger";

type ToolPayload = {
  name: string;
  slug: string;
  vendor: string;
  category: string;
  summary: string;
  website: string;
  logoUrl?: string;
  features?: string[];
};

export async function createTool(payload: ToolPayload) {
  try {
    await db.insert(tools).values({
      id: nanoid(),
      ...payload,
      features: payload.features ?? [],
      stats: { customers: 0, coverage: 0, contracts: 0 },
    });
    revalidateTag(CACHE_TAGS.tools);
  } catch (error) {
    logError(error, { action: "createTool" });
    throw error;
  }
}

export async function updateTool(id: string, payload: Partial<ToolPayload>) {
  try {
    await db.update(tools).set(payload).where(eq(tools.id, id));
    revalidateTag(CACHE_TAGS.tools);
  } catch (error) {
    logError(error, { action: "updateTool", id });
    throw error;
  }
}

export async function deleteTool(id: string) {
  try {
    await db.delete(tools).where(eq(tools.id, id));
    revalidateTag(CACHE_TAGS.tools);
  } catch (error) {
    logError(error, { action: "deleteTool", id });
    throw error;
  }
}
