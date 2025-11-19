import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-border/40 from-background via-background/95 relative border-t bg-gradient-to-t to-transparent">
      <div className="via-primary/25 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12 text-sm md:flex-row md:items-center md:justify-between">
        <p className="text-muted-foreground/80">
          &copy; {new Date().getFullYear()} Traceability Tools. Crafted for responsible
          supply chains.
        </p>
        <div className="flex gap-4">
          <Link
            href="/docs/privacy"
            className="hover:text-foreground rounded-full px-3 py-1 transition hover:bg-[hsl(var(--surface-strong))]/70"
          >
            Privacy
          </Link>
          <Link
            href="/docs/security"
            className="hover:text-foreground rounded-full px-3 py-1 transition hover:bg-[hsl(var(--surface-strong))]/70"
          >
            Security
          </Link>
          <Link
            href="mailto:hello@traceabilitytools.com"
            className="hover:text-foreground rounded-full px-3 py-1 transition hover:bg-[hsl(var(--surface-strong))]/70"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
