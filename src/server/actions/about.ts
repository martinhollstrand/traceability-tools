"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/server/db";
import { landingSettingsTable } from "@/server/db/schema";
import { requireAdminSession } from "@/server/auth/session";
import type { AboutContent, SiteContent } from "@/server/db/schema/landing-settings";

const aboutContentSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  intro: z.string(),
  missionTitle: z.string(),
  missionBody: z.string(),
  methodologyTitle: z.string(),
  methodologyBody: z.string(),
  audienceTitle: z.string(),
  audienceBody: z.string(),
  contactLabel: z.string(),
  contactEmail: z.string(),
});

export type UpdateAboutState = { success: boolean; error?: string };

export async function updateAboutSettingsAction(
  _prev: UpdateAboutState,
  formData: FormData,
): Promise<UpdateAboutState> {
  await requireAdminSession();

  const parsed = aboutContentSchema.safeParse({
    eyebrow: formData.get("eyebrow") ?? "",
    title: formData.get("title") ?? "",
    intro: formData.get("intro") ?? "",
    missionTitle: formData.get("missionTitle") ?? "",
    missionBody: formData.get("missionBody") ?? "",
    methodologyTitle: formData.get("methodologyTitle") ?? "",
    methodologyBody: formData.get("methodologyBody") ?? "",
    audienceTitle: formData.get("audienceTitle") ?? "",
    audienceBody: formData.get("audienceBody") ?? "",
    contactLabel: formData.get("contactLabel") ?? "",
    contactEmail: formData.get("contactEmail") ?? "",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  try {
    const db = getDb();
    const [existing] = await db
      .select({ content: landingSettingsTable.content })
      .from(landingSettingsTable)
      .where(eq(landingSettingsTable.id, "default"))
      .limit(1);

    const existingContent =
      (existing?.content as SiteContent | null | undefined) ?? undefined;
    const about: AboutContent = parsed.data;
    const content: SiteContent = {
      ...(existingContent ?? {}),
      about,
    };

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

    revalidatePath("/about");
    revalidatePath("/admin/about");
    return { success: true };
  } catch (error) {
    console.error("Update about error:", error);
    return {
      success: false,
      error: (error as Error).message ?? "Could not save about settings",
    };
  }
}
