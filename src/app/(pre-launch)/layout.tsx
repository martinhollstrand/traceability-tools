import type { ReactNode } from "react";

export default function PreLaunchLayout({ children }: { children: ReactNode }) {
  return (
    <div className="from-background via-background/98 to-background relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b">
      <div className="bg-aurora pointer-events-none absolute inset-0 -z-10 opacity-80" />
      <div className="bg-primary/15 pointer-events-none absolute top-24 left-1/2 h-[540px] w-[540px] -translate-x-1/2 rounded-full blur-3xl" />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">{children}</div>
      </main>
    </div>
  );
}
