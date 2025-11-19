import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "traceabilitytools-admin";

export type AdminSession = {
  email: string;
};

const getAccessKey = () => process.env.ADMIN_ACCESS_KEY ?? "dev-admin";

export const requireAdminSession = (): AdminSession => {
  const sessionCookie = cookies().get(SESSION_COOKIE);
  const accessKey = getAccessKey();

  if (!sessionCookie || sessionCookie.value !== accessKey) {
    redirect("/login");
  }

  return {
    email: "admin@traceabilitytools.com",
  };
};

export const setAdminSession = () => {
  const accessKey = getAccessKey();
  cookies().set(SESSION_COOKIE, accessKey, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
};

export const clearAdminSession = () => {
  cookies().delete(SESSION_COOKIE);
};
