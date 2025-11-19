import { logoutAction } from "@/server/actions/auth";
import { type AdminSession } from "@/server/auth/session";

type Props = {
  user: AdminSession;
};

export function AdminTopbar({ user }: Props) {
  return (
    <header className="flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-6 py-4">
      <div>
        <p className="text-xs tracking-[0.3em] text-[hsl(var(--muted))] uppercase">
          Kontroller
        </p>
        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
          {user.email}
        </p>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="rounded-full border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--surface-strong))]"
        >
          Logga ut
        </button>
      </form>
    </header>
  );
}
