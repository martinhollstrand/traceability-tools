import { type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { type AdminSession } from "@/server/auth/session";

export const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Data & Excel", href: "/admin/data" },
  { label: "Rapport", href: "/admin/report" },
  { label: "Versioner", href: "/admin/versions" },
];

type Props = {
  children: ReactNode;
  user: AdminSession;
  navItems?: { label: string; href: string }[];
};

export function AdminShell({ children, user, navItems = ADMIN_NAV }: Props) {
  return (
    <div className="flex min-h-screen bg-[hsl(var(--surface-strong))]">
      <AdminSidebar items={navItems} />
      {/* min-w-0 is critical in flex layouts to prevent wide children (tables)
          from forcing the whole page to overflow horizontally. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar user={user} />
        <main className="min-w-0 flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
