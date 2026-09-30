import { cookies } from "next/headers";
import crypto from "crypto";
import { authenticateStaff, getStaffByEmail, StaffMember, StaffPermissions } from "./staff-store";

const COOKIE_NAME = "admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export type StaffRole = "admin" | "secretary" | "assistant";

export interface StaffSessionData {
  role: StaffRole;
  id: string;
  name: string;
  email: string;
  title: string;
  permissions: StaffPermissions;
}

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;

  const email = process.env.ADMIN_EMAIL || "shareenhussain@truelegaladvice.com";
  const password = process.env.ADMIN_PASSWORD || "password123";
  return crypto.createHash("sha256").update(`tla-session:${email}:${password}`).digest("hex");
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createSessionToken(sessionData: StaffSessionData) {
  const expires = Date.now() + SESSION_DURATION_MS;
  const payloadStr = Buffer.from(JSON.stringify({ ...sessionData, expires })).toString("base64url");
  const signature = sign(payloadStr);
  return `${payloadStr}.${signature}`;
}

export function parseToken(token: string): StaffSessionData | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) {
      // Legacy format fallback: role:expires:sig
      const legacyParts = token.split(":");
      if (legacyParts.length === 3) {
        const [role, expiresStr, sig] = legacyParts;
        const legacyPayload = `${role}:${expiresStr}`;
        const expectedSig = sign(legacyPayload);
        if (sig === expectedSig && Date.now() <= parseInt(expiresStr, 10)) {
          return {
            role: (role as StaffRole) || "admin",
            id: "master-admin",
            name: "Adv. Shareen Hussain",
            email: process.env.ADMIN_EMAIL || "shareenhussain@truelegaladvice.com",
            title: "Lead Advocate",
            permissions: {
              canManageBookings: true,
              canManageInquiries: true,
              canViewClients: true,
              canManageChamber: true,
              canManageStaff: role === "admin",
            },
          };
        }
      }
      return null;
    }

    const [payloadStr, signature] = parts;
    const expectedSignature = sign(payloadStr);

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

    const decoded = JSON.parse(Buffer.from(payloadStr, "base64url").toString("utf-8"));
    if (!decoded.expires || Date.now() > decoded.expires) return null;

    return {
      role: decoded.role,
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      title: decoded.title || "Chamber Staff",
      permissions: decoded.permissions,
    };
  } catch (err) {
    return null;
  }
}

export async function setStaffSessionCookie(staff: StaffMember) {
  const token = createSessionToken({
    role: staff.role,
    id: staff.id,
    name: staff.name,
    email: staff.email,
    title: staff.title,
    permissions: staff.permissions,
  });

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
  const adminEmail = process.env.ADMIN_EMAIL || "shareenhussain@truelegaladvice.com";
  const existing = await getStaffByEmail(adminEmail);
  if (existing) {
    await setStaffSessionCookie(existing);
  } else {
    await setStaffSessionCookie({
      id: "master-admin",
      name: "Adv. Shareen Hussain",
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || "password123",
      role: "admin",
      title: "Lead Advocate & Head of Chambers",
      permissions: {
        canManageBookings: true,
        canManageInquiries: true,
        canViewClients: true,
        canManageChamber: true,
        canManageStaff: true,
      },
      createdAt: new Date().toISOString(),
    });
  }
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Returns the signed-in staff member's full session data, or null if not signed in. */
export async function getSessionStaff(): Promise<StaffSessionData | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return parseToken(token);
}

/** Returns the signed-in staff member's role, or null if not signed in. */
export async function getSessionRole(): Promise<StaffRole | null> {
  const session = await getSessionStaff();
  return session?.role ?? null;
}

/** True when any staff member (admin, secretary, assistant) is signed in. */
export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getSessionRole()) !== null;
}

/**
 * Checks credentials against all staff accounts (master admin & assistants).
 * Returns the matched staff member, or null when credentials are invalid.
 */
export async function verifyStaffCredentials(email: string, password: string): Promise<StaffMember | null> {
  const result = await authenticateStaff(email, password);
  if (result.success && result.staff) {
    return result.staff;
  }
  return null;
}

/** Backwards-compatible boolean check for the admin account only. */
export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const staff = await verifyStaffCredentials(email, password);
  return staff?.role === "admin";
}
