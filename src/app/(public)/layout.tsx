import type { ReactNode } from "react";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CompareBar } from "@/components/layout/compare-bar";
import { PRE_LAUNCH_MODE } from "@/lib/config";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  // Check if we're on the home page for pre-launch mode
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isHomePage = pathname === "/" || pathname === "";

  const showNavigation = !PRE_LAUNCH_MODE || !isHomePage;

  return (
    <div className="from-background via-background/98 to-background relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b">
      <div className="bg-aurora pointer-events-none absolute inset-0 -z-10 opacity-80" />
      <div className="bg-primary/15 pointer-events-none absolute top-24 left-1/2 h-[540px] w-[540px] -translate-x-1/2 rounded-full blur-3xl" />
      {showNavigation && <SiteHeader />}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">{children}</div>
      </main>
      {showNavigation && <SiteFooter />}
      {showNavigation && <CompareBar />}
    </div>
  );
}
