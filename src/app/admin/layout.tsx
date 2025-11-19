import type { ReactNode } from "react";
import { headers } from "next/headers";
import { requireAdmin } from "@/server/auth";

const adminNav = [
  { label: "Dashboard", href: "/(admin)" },
  { label: "Data imports", href: "/(admin)/imports" },
  { label: "Reports", href: "/(admin)/reports" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const headersList = await headers();
  await requireAdmin(headersList);

  return (
    <div className="grid min-h-screen grid-cols-[220px,1fr] bg-slate-950 text-slate-50">
      <aside className="border-r border-white/5 px-6 py-8">
        <p className="text-xs tracking-[0.4em] text-white/50 uppercase">Admin</p>
        <h1 className="mt-2 text-xl font-semibold text-white">Traceability Tools</h1>
        <nav className="mt-8 space-y-4 text-sm">
          {adminNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block text-white/70 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
      <main className="bg-slate-900/40 p-10">{children}</main>
    </div>
  );
}
