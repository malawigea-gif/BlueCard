// JWT session — used by both middleware (edge) and the server
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "bc_session";
export type SessionPayload = { uid: number; role: "ADMIN" | "USER"; name: string };

function key() {
  const s = process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me-please-123";
  return new TextEncoder().encode(s);
}

export async function signSession(p: SessionPayload) {
  return new SignJWT(p as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key());
}

export async function verifySession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
