import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Logga in | ${SITE_NAME}`,
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold tracking-[0.3em] text-[hsl(var(--muted))] uppercase">
            Admin
          </p>
          <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))]">
            Logga in
          </h1>
          <p className="text-sm text-[hsl(var(--muted))]">
            Ange åtkomstnyckeln för att öppna kontrollpanelen.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
