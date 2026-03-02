import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/server/db";
import { landingSettingsTable } from "@/server/db/schema";
import type { AboutContent, SiteContent } from "@/server/db/schema/landing-settings";

export const DEFAULT_ABOUT: AboutContent = {
  eyebrow: "About",
  title: "Independent guidance for traceability technology decisions",
  intro:
    "Traceability Tools helps sustainability, sourcing, and product teams understand the software landscape with less noise and more practical clarity. We combine supplier-submitted data, structured comparisons, and editorial analysis to support better buying decisions.",
  missionTitle: "Why this exists",
  missionBody:
    "Many teams are asked to choose platforms before they have time to compare capabilities, data depth, and implementation reality. This project exists to create a neutral reference point where tools can be assessed side-by-side with transparent criteria.",
  methodologyTitle: "How we evaluate",
  methodologyBody:
    "Vendors submit structured responses that are validated, mapped, and published in a comparable format. We continuously refine question design and metadata mappings so stakeholders can evaluate both strategic fit and operational readiness.",
  audienceTitle: "Who uses the platform",
  audienceBody:
    "The platform is designed for brands, retailers, manufacturers, and ecosystem partners working with traceability, digital product passports, ESG data, and compliance workflows.",
  contactLabel: "Questions or collaboration ideas",
  contactEmail: "info@peak63.se",
};

export const getAboutSettings = cache(async (): Promise<AboutContent> => {
  const [row] = await db
    .select({ content: landingSettingsTable.content })
    .from(landingSettingsTable)
    .where(eq(landingSettingsTable.id, "default"))
    .limit(1);

  const content = row?.content as SiteContent | null | undefined;
  return {
    ...DEFAULT_ABOUT,
    ...(content?.about ?? {}),
  };
});
