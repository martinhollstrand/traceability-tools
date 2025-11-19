import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CompareBar } from "@/components/layout/compare-bar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="from-background to-background/40 flex min-h-screen flex-col bg-gradient-to-b">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-6 py-12">{children}</div>
      </main>
      <SiteFooter />
      <CompareBar />
    </div>
  );
}
