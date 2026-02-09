import { getLandingSettings } from "@/server/data/landing";
import { listTools } from "@/server/data/tools";
import { LandingPageClient } from "./page-client";

export default async function AdminLandingPage() {
  const [settings, allTools] = await Promise.all([getLandingSettings(), listTools()]);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs tracking-[0.4em] text-[hsl(var(--muted))] uppercase">
          Site
        </p>
        <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))]">
          Landing page
        </h1>
        <p className="text-sm text-[hsl(var(--muted))]">
          Edit hero, featured section copy, insight bullets, and choose which tools appear
          in the curated shortlist on the homepage.
        </p>
      </div>

      <LandingPageClient initialSettings={settings} tools={allTools} />
    </div>
  );
}
