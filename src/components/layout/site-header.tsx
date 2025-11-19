import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";

const navItems = [
  { href: "/tools", label: "Tools" },
  { href: "/compare", label: "Compare" },
  { href: "/report", label: "Reports" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  return (
    <header className="border-border/40 bg-background/70 relative sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="via-primary/30 absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent" />
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-3 font-semibold">
          <span className="border-primary/25 relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.28),hsl(var(--background)))]">
            <span className="absolute inset-0 bg-[conic-gradient(from_140deg,hsl(var(--primary)/0.45),hsl(var(--accent)/0.35),transparent_80%)] opacity-70 blur-md transition duration-500 group-hover:scale-[1.15]" />
            <span className="bg-primary/90 relative h-2 w-2 rounded-full shadow-[0_0_16px_hsl(var(--accent)/0.8)] transition duration-500 group-hover:shadow-[0_0_24px_hsl(var(--accent)/0.9)]" />
          </span>
          <span className="text-gradient text-lg tracking-tight">{SITE_NAME}</span>
        </Link>
        <nav className="border-border/40 hidden items-center gap-2 rounded-full border bg-[hsl(var(--surface))]/70 px-2 py-1 text-sm font-medium shadow-[0_12px_35px_-25px_hsl(var(--primary)/0.35)] md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground rounded-full px-4 py-1.5 transition hover:bg-[hsl(var(--surface-strong))]/80"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground/80 hidden text-xs lg:inline">
            Private beta access
          </span>
          <Button asChild size="sm">
            <Link href="/compare">Launch Compare</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
