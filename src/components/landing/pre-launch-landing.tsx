import Image from "next/image";
import { Button } from "@/components/ui/button";

export function PreLaunchLanding() {
  return (
    <div className="flex flex-col items-center space-y-12">
      {/* Logo */}
      <div className="flex justify-center">
        <Image
          src="/logo.png"
          alt="TraceabilityTools.com"
          width={400}
          height={100}
          className="h-auto w-auto max-w-[300px] md:max-w-[400px]"
          priority
        />
      </div>

      {/* Launch announcement */}
      <div className="text-center">
        <p className="text-muted-foreground text-lg font-medium tracking-wide uppercase">
          Launching March 11, 2026
        </p>
      </div>

      {/* Main content card */}
      <section className="border-border/40 shadow-glow relative w-full max-w-3xl overflow-hidden rounded-[36px] border bg-[hsl(var(--surface))]/82 px-8 py-12 sm:px-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.22),transparent_58%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.18),transparent_62%)]" />
        <div className="bg-primary/15 pointer-events-none absolute top-1/2 -left-24 h-64 w-64 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="bg-accent/20 pointer-events-none absolute -top-28 right-10 h-48 w-48 rounded-full blur-3xl" />

        <div className="relative space-y-8 text-center">
          <p className="text-foreground text-lg leading-relaxed md:text-xl">
            Here you will find a non-biased overview of available traceability solutions
            designed to support the textile industry.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            We invite all service providers to include their services in this year&apos;s
            update. Being listed offers your tool visibility to textile companies actively
            looking to invest in traceability technology. Participation is free of charge
            and carries no obligations.
          </p>

          {/* Timeline */}
          <div className="border-border/40 mx-auto max-w-md rounded-2xl border bg-[hsl(var(--background))]/60 p-6 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Survey Deadline</span>
                <span className="text-foreground font-semibold">March 1st, 2026</span>
              </div>
              <div className="via-border/60 h-px bg-gradient-to-r from-transparent to-transparent" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Platform Launch</span>
                <span className="text-foreground font-semibold">March 11th, 2026</span>
              </div>
              <div className="via-border/60 h-px bg-gradient-to-r from-transparent to-transparent" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">
                  Full Report Publication
                </span>
                <span className="text-foreground font-semibold">Spring 2026</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              To add information about your solution, please provide your details via this
              form:
            </p>
            <Button size="lg" variant="secondary" asChild>
              <a
                href="https://forms.cloud.microsoft/e/QZE8ArAcFP"
                target="_blank"
                rel="noopener noreferrer"
              >
                Submit Your Solution
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <div className="text-center">
        <p className="text-muted-foreground">
          For more information - contact:{" "}
          <a
            href="mailto:info@peak63.se"
            className="text-foreground hover:text-primary font-medium underline underline-offset-4 transition-colors"
          >
            info@peak63.se
          </a>
        </p>
      </div>

      {/* Partner logos footer */}
      <footer className="border-border/40 mt-8 w-full rounded-3xl border bg-[hsl(var(--surface))]/80 px-8 py-12">
        <div className="flex flex-col items-center justify-center gap-8">
          <Image
            src="/Logotyper_fot A4.png"
            alt="Partner logos - Interreg, European Union, Science Park Borås, and others"
            width={900}
            height={120}
            className="h-auto max-h-28 w-auto rounded-xl"
          />
          <div className="flex items-center justify-center gap-6">
            <Image
              src="/TF2030_Logotyp_Mark_Pos.png"
              alt="Textile & Fashion 2030"
              width={80}
              height={80}
              className="h-auto max-h-14 w-auto"
            />
            <Image
              src="/PEAK63N_Logo_blue.png"
              alt="Peak 63°N Outdoor Lab"
              width={180}
              height={80}
              className="h-auto max-h-12 w-auto"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
