"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdminSession } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { toolCategoriesTable } from "@/server/db/schema";

const updateToolCategoryVisibilitySchema = z.object({
  id: z.string().uuid(),
  showInSearchFilter: z.boolean(),
});

export async function setToolCategorySearchFilterVisibility(input: {
  id: string;
  showInSearchFilter: boolean;
}): Promise<void> {
  await requireAdminSession();

  const parsed = updateToolCategoryVisibilitySchema.parse(input);
  const db = getDb();

  await db
    .update(toolCategoriesTable)
    .set({
      showInSearchFilter: parsed.showInSearchFilter,
      updatedAt: new Date(),
    })
    .where(eq(toolCategoriesTable.id, parsed.id));

  revalidatePath("/admin/categories");
  revalidatePath("/tools");
}
