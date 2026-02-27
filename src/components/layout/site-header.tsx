import Link from "next/link";
import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";
import { CompareButton } from "@/components/layout/compare-button";

const navItems = [
  { href: "/tools", label: "Tools" },
  { href: "/report", label: "Reports" },
  // { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  return (
    <header className="border-border/40 bg-background/70 relative sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="via-primary/30 absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent" />
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-3 font-semibold">
          <Image
            src="/logo.png"
            alt={SITE_NAME}
            width={300}
            height={40}
            className="transition-transform duration-300 group-hover:scale-105"
            priority
          />
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
          <CompareButton />
        </div>
      </div>
    </header>
  );
}
