"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { clearAdminSession, setAdminSession } from "@/server/auth/session";

const loginSchema = z.object({
  accessKey: z.string().min(6, "Ange åtkomstnyckeln"),
});

export type LoginState = {
  success: boolean;
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const raw = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Ogiltig inmatning",
    };
  }

  const accessKey = process.env.ADMIN_ACCESS_KEY ?? "dev-admin";
  if (parsed.data.accessKey !== accessKey) {
    return {
      success: false,
      error: "Fel nyckel. Kontrollera din konfiguration.",
    };
  }

  setAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  clearAdminSession();
  redirect("/login");
}
