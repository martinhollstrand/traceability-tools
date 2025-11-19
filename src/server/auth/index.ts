import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle-adapter";
import { env } from "@/lib/env";
import { db } from "@/server/db";
import * as schema from "@/server/db/schema";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  appUrl: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    schema,
    provider: "pg",
    camelCase: false,
  }),
  emailAndPassword: {
    enabled: true,
    passwordReset: true,
  },
  rateLimit: {
    window: 60,
    max: 10,
  },
});

export async function requireAdmin(headers: Headers) {
  const session = await auth.api.getSession({ headers });
  if (!session) {
    throw new Error("Unauthorized");
  }
  const adminEmails = env.BETTER_AUTH_ADMIN_EMAILS?.split(",").map((email) =>
    email.trim(),
  );
  if (adminEmails && !adminEmails.includes(session.user.email)) {
    throw new Error("Forbidden");
  }
  return session;
}
