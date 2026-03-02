import { getAboutSettings } from "@/server/data/about";
import { AboutPageClient } from "./page-client";

export default async function AdminAboutPage() {
  const settings = await getAboutSettings();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.4em] text-[hsl(var(--muted))]">Site</p>
        <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))]">
          About page
        </h1>
        <p className="text-sm text-[hsl(var(--muted))]">
          Edit the public about page copy and contact details.
        </p>
      </div>

      <AboutPageClient initialSettings={settings} />
    </div>
  );
}
