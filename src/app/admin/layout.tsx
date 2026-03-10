import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/server/auth/session";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Landing", href: "/admin/landing" },
  { label: "About", href: "/admin/about" },
  { label: "Data imports", href: "/admin/imports" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Questions", href: "/admin/questions" },
  { label: "AI Summaries", href: "/admin/summaries" },
  { label: "Reports", href: "/admin/reports" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdminSession();

  return (
    <AdminShell user={user} navItems={ADMIN_NAV}>
      {children}
    </AdminShell>
  );
}
