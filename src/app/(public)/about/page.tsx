import { PartnerLogos } from "@/components/branding/partner-logos";
import { getAboutSettings } from "@/server/data/about";

export default async function AboutPage() {
  const about = await getAboutSettings();

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <p className="text-muted-foreground text-sm tracking-widest">{about.eyebrow}</p>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight">{about.title}</h1>
        <p className="text-muted-foreground max-w-3xl text-lg leading-relaxed">
          {about.intro}
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <article className="border-border/60 space-y-3 rounded-2xl border bg-[hsl(var(--surface))]/70 p-6">
          <h2 className="text-xl font-semibold">{about.missionTitle}</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {about.missionBody}
          </p>
        </article>
        <article className="border-border/60 space-y-3 rounded-2xl border bg-[hsl(var(--surface))]/70 p-6">
          <h2 className="text-xl font-semibold">{about.methodologyTitle}</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {about.methodologyBody}
          </p>
        </article>
        <article className="border-border/60 space-y-3 rounded-2xl border bg-[hsl(var(--surface))]/70 p-6">
          <h2 className="text-xl font-semibold">{about.audienceTitle}</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {about.audienceBody}
          </p>
        </article>
      </section>

      <section className="border-border/60 rounded-2xl border bg-[hsl(var(--surface))]/70 p-6">
        <h2 className="text-lg font-semibold">{about.contactLabel}</h2>
        <a
          href={`mailto:${about.contactEmail}`}
          className="text-primary mt-2 inline-block text-sm underline underline-offset-4"
        >
          {about.contactEmail}
        </a>
      </section>

      <section className="border-border/40 w-full rounded-3xl border bg-[hsl(var(--surface))]/80 px-8 py-12">
        <PartnerLogos />
      </section>
    </div>
  );
}
