import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/server/auth/session";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const user = requireAdminSession();
  return <AdminShell user={user}>{children}</AdminShell>;
}
