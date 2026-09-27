import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export type StaffRole = "admin" | "secretary";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;

  // Fallback: derive a stable secret from the admin credentials so sessions
  // still work when ADMIN_SESSION_SECRET is not configured.
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not set, and ADMIN_EMAIL/ADMIN_PASSWORD are unavailable to derive one."
    );
  }
  return crypto.createHash("sha256").update(`tla-session:${email}:${password}`).digest("hex");
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createSessionToken(role: StaffRole) {
  const expires = Date.now() + SESSION_DURATION_MS;
  const payload = `${role}:${expires}`;
  const signature = sign(payload);
  return `${payload}:${signature}`;
}

function parseToken(token: string): { role: StaffRole } | null {
  const parts = token.split(":");
  if (parts.length !== 3) return null;
  const [role, expiresStr, signature] = parts;
  if (role !== "admin" && role !== "secretary") return null;

  const payload = `${role}:${expiresStr}`;
  const expectedSignature = sign(payload);

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  if (Date.now() > parseInt(expiresStr, 10)) return null;

  return { role };
}

export async function setStaffSessionCookie(role: StaffRole) {
  const token = createSessionToken(role);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

/** Backwards-compatible alias: sets an admin session. */
export async function setAdminSessionCookie() {
  await setStaffSessionCookie("admin");
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Returns the signed-in staff member's role, or null if not signed in. */
export async function getSessionRole(): Promise<StaffRole | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return parseToken(token)?.role ?? null;
}

/** True when any staff member (admin or secretary) is signed in. */
export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getSessionRole()) !== null;
}

/**
 * Checks credentials against both staff accounts.
 * Returns the matched role, or null when credentials are invalid.
 */
export function verifyStaffCredentials(email: string, password: string): StaffRole | null {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables.");
  }

  const normalized = email.trim().toLowerCase();

  if (normalized === adminEmail.toLowerCase() && password === adminPassword) {
    return "admin";
  }

  const secretaryEmail = process.env.SECRETARY_EMAIL;
  const secretaryPassword = process.env.SECRETARY_PASSWORD;
  if (
    secretaryEmail &&
    secretaryPassword &&
    normalized === secretaryEmail.toLowerCase() &&
    password === secretaryPassword
  ) {
    return "secretary";
  }

  return null;
}

/** Backwards-compatible boolean check for the admin account only. */
export function verifyAdminCredentials(email: string, password: string): boolean {
  return verifyStaffCredentials(email, password) === "admin";
}
