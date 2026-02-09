"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/server/db";
import { landingSettingsTable, toolsTable } from "@/server/db/schema";
import { requireAdminSession } from "@/server/auth/session";
import type { LandingContent } from "@/server/db/schema/landing-settings";

const insightBulletSchema = z.object({
  title: z.string(),
  copy: z.string(),
  icon: z.string(),
});

const landingContentSchema = z.object({
  hero: z.object({
    badge: z.string(),
    headline: z.string(),
    subtext: z.string(),
  }),
  featuredSection: z.object({
    label: z.string(),
    title: z.string(),
    description: z.string(),
  }),
  insightBullets: z.array(insightBulletSchema).length(3),
});

export type UpdateLandingState = { success: boolean; error?: string };

export async function updateLandingSettingsAction(
  _prev: UpdateLandingState,
  formData: FormData,
): Promise<UpdateLandingState> {
  await requireAdminSession();

  const raw = {
    heroBadge: formData.get("heroBadge"),
    heroHeadline: formData.get("heroHeadline"),
    heroSubtext: formData.get("heroSubtext"),
    featuredLabel: formData.get("featuredLabel"),
    featuredTitle: formData.get("featuredTitle"),
    featuredDescription: formData.get("featuredDescription"),
    bullet0Title: formData.get("bullet0Title"),
    bullet0Copy: formData.get("bullet0Copy"),
    bullet0Icon: formData.get("bullet0Icon"),
    bullet1Title: formData.get("bullet1Title"),
    bullet1Copy: formData.get("bullet1Copy"),
    bullet1Icon: formData.get("bullet1Icon"),
    bullet2Title: formData.get("bullet2Title"),
    bullet2Copy: formData.get("bullet2Copy"),
    bullet2Icon: formData.get("bullet2Icon"),
  };

  const parsed = landingContentSchema.safeParse({
    hero: {
      badge: raw.heroBadge ?? "",
      headline: raw.heroHeadline ?? "",
      subtext: raw.heroSubtext ?? "",
    },
    featuredSection: {
      label: raw.featuredLabel ?? "",
      title: raw.featuredTitle ?? "",
      description: raw.featuredDescription ?? "",
    },
    insightBullets: [
      {
        title: raw.bullet0Title ?? "",
        copy: raw.bullet0Copy ?? "",
        icon: raw.bullet0Icon ?? "",
      },
      {
        title: raw.bullet1Title ?? "",
        copy: raw.bullet1Copy ?? "",
        icon: raw.bullet1Icon ?? "",
      },
      {
        title: raw.bullet2Title ?? "",
        copy: raw.bullet2Copy ?? "",
        icon: raw.bullet2Icon ?? "",
      },
    ],
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  try {
    const db = getDb();
    const content: LandingContent = parsed.data;

    await db
      .insert(landingSettingsTable)
      .values({
        id: "default",
        content,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: landingSettingsTable.id,
        set: {
          content,
          updatedAt: new Date(),
        },
      });

    revalidatePath("/");
    revalidatePath("/admin/landing");
    return { success: true };
  } catch (error) {
    console.error("Update landing error:", error);
    return {
      success: false,
      error: (error as Error).message ?? "Could not save landing settings",
    };
  }
}

export async function setToolFeaturedAction(
  toolId: string,
  isFeatured: boolean,
): Promise<void> {
  await requireAdminSession();

  const db = getDb();
  await db
    .update(toolsTable)
    .set({ isFeatured, updatedAt: new Date() })
    .where(eq(toolsTable.id, toolId));

  revalidatePath("/");
  revalidatePath("/admin/landing");
  revalidatePath("/admin");
}
