"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "@/server/actions/auth";

const initialState: LoginState = { success: false };

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-8"
    >
      <div className="space-y-1">
        <label className="text-sm font-medium text-[hsl(var(--foreground))]">
          Åtkomstnyckel
        </label>
        <input
          type="password"
          name="accessKey"
          required
          className="w-full rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/40"
          placeholder="••••••••"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="w-full rounded-xl bg-[hsl(var(--foreground))] py-3 text-sm font-semibold text-[hsl(var(--surface))] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={pending}
    >
      {pending ? "Loggar in…" : "Logga in"}
    </button>
  );
}
