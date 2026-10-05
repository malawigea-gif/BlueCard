import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, signSession, verifySession, type SessionPayload } from "./session";

export async function getSession() {
  const c = await cookies();
  return verifySession(c.get(SESSION_COOKIE)?.value);
}

export async function createSession(p: SessionPayload) {
  const token = await signSession(p);
  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const c = await cookies();
  c.delete(SESSION_COOKIE);
}

export async function requireAdmin() {
  const s = await getSession();
  if (!s || s.role !== "ADMIN") redirect("/login?next=/admin");
  return s;
}

export async function requireUser() {
  const s = await getSession();
  if (!s) redirect("/login?next=/profile");
  return s;
}
