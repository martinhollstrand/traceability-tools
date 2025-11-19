"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type SidebarProps = {
  items: { label: string; href: string }[];
};

export function AdminSidebar({ items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 border-r border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 lg:block">
      <p className="mb-6 text-sm font-semibold tracking-[0.3em] text-[hsl(var(--muted))] uppercase">
        Admin
      </p>
      <nav className="space-y-2">
        {items.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === item.href
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[hsl(var(--foreground))] text-[hsl(var(--surface))]"
                  : "text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
