import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-border/60 bg-background border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} Traceability Tools. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/docs/privacy">Privacy</Link>
          <Link href="/docs/security">Security</Link>
          <Link href="mailto:hello@traceabilitytools.com">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
