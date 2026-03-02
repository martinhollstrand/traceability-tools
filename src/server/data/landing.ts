import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/server/db";
import { landingSettingsTable } from "@/server/db/schema";
import type { LandingContent, SiteContent } from "@/server/db/schema/landing-settings";

const DEFAULT_LANDING: LandingContent = {
  hero: {
    badge: "Private beta · Early operators welcome",
    headline:
      "Discover, compare, and operationalize traceability tooling with confidence.",
    subtext:
      "Traceability Tools keeps your sourcing, ESG, and compliance teams synced on the market, integrations, and gaps—so you can deploy the right stack before the competition.",
  },
  featuredSection: {
    label: "Featured",
    title: "Curated shortlist",
    description:
      "Hand-picked platforms with the strongest coverage, reliability, and integration velocity.",
  },
  insightBullets: [
    {
      title: "Living dataset",
      copy: "Daily ingestion from vendor updates, product demos, and analyst calls ensures your view is never stale.",
      icon: "🛰️",
    },
    {
      title: "Excel-ready exports",
      copy: "Push curated shortlists into Excel or Sheets with raw feature flags so stakeholders can remix confidently.",
      icon: "📊",
    },
    {
      title: "AI-assisted summaries",
      copy: "Blend narrative analysis with structured metadata to uncover risks, integration complexity, and roadmap gaps.",
      icon: "🤖",
    },
  ],
};

export const getLandingSettings = cache(async (): Promise<LandingContent> => {
  const [row] = await db
    .select()
    .from(landingSettingsTable)
    .where(eq(landingSettingsTable.id, "default"))
    .limit(1);

  const content = row?.content as SiteContent | null | undefined;
  if (!content?.hero?.headline) {
    return DEFAULT_LANDING;
  }
  const insightBullets = content.insightBullets ?? [];
  const bullets =
    insightBullets.length >= 3
      ? insightBullets.slice(0, 3).map((b, i) => ({
          ...DEFAULT_LANDING.insightBullets[i],
          ...b,
        }))
      : DEFAULT_LANDING.insightBullets;
  return {
    hero: { ...DEFAULT_LANDING.hero, ...content.hero },
    featuredSection: {
      ...DEFAULT_LANDING.featuredSection,
      ...content.featuredSection,
    },
    insightBullets: bullets,
  };
});
