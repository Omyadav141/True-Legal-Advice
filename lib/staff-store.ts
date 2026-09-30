import fs from "fs";
import path from "path";
import os from "os";
import { supabaseServer } from "./supabase-server";

export interface StaffPermissions {
  canManageBookings: boolean;
  canManageInquiries: boolean;
  canViewClients: boolean;
  canManageChamber: boolean;
  canManageStaff: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "secretary" | "assistant";
  title: string;
  permissions: StaffPermissions;
  createdAt: string;
}

export interface StaffStorePayload {
  version: number;
  staff: StaffMember[];
  deletedEmails: string[];
  updatedAt: string;
}

// System Row Constants in Supabase bookings table
const SYS_STAFF_ROW_ID = "00000000-0000-0000-0000-00000000574f";
const SYS_SERVICE_FLAG = "__SYSTEM_CONFIG__";
const SYS_STATUS_FLAG = "system_staff_store";

// Global in-memory cache across serverless warm executions
let memoryPayload: StaffStorePayload | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 3000; // 3 seconds TTL to ensure cross-device consistency across serverless containers

function getStoragePaths() {
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
  );

  const bundledDir = path.join(process.cwd(), "data");
  const bundledFile = path.join(bundledDir, "staff.json");
  const writableDir = isServerless ? path.join(os.tmpdir(), "tla_data") : bundledDir;
  const writableFile = path.join(writableDir, "staff.json");

  return { isServerless, bundledFile, writableDir, writableFile };
}

function getDefaultStaff(): StaffMember[] {
  const adminEmail = (process.env.ADMIN_EMAIL || "shareenhussain@truelegaladvice.com").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "password123";

  return [
    {
      id: "master-admin",
      name: "Adv. Shareen Hussain",
      email: adminEmail,
      password: adminPassword,
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
    },
    {
      id: "staff-secretary",
      name: "Chamber Legal Assistant",
      email: "secretary@truelegaladvice.com",
      password: "password123",
      role: "secretary",
      title: "Legal Secretary & Registry Desk",
      permissions: {
        canManageBookings: true,
        canManageInquiries: true,
        canViewClients: true,
        canManageChamber: false,
        canManageStaff: false,
      },
      createdAt: new Date().toISOString(),
    },
  ];
}

/** Reads fallback payload from local disk cache */
function readLocalDiskPayload(): StaffStorePayload | null {
  const { isServerless, bundledFile, writableFile } = getStoragePaths();

  if (isServerless) {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ writableFile)) {
        const raw = fs.readFileSync(/*turbopackIgnore: true*/ writableFile, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.staff)) return parsed;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { version: 1, staff: parsed, deletedEmails: [], updatedAt: new Date().toISOString() };
        }
      }
    } catch (err) {
      console.warn("Could not read writable staff file from tmp:", err);
    }
  }

  try {
    if (fs.existsSync(/*turbopackIgnore: true*/ bundledFile)) {
      const raw = fs.readFileSync(/*turbopackIgnore: true*/ bundledFile, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.staff)) return parsed;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { version: 1, staff: parsed, deletedEmails: [], updatedAt: new Date().toISOString() };
      }
    }
  } catch (err) {
    console.warn("Could not read bundled staff.json:", err);
  }

  return null;
}

/** Saves payload to local disk cache */
function saveLocalDiskPayload(payload: StaffStorePayload) {
  const { writableDir, writableFile } = getStoragePaths();
  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ writableDir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ writableDir, { recursive: true });
    }
    fs.writeFileSync(/*turbopackIgnore: true*/ writableFile, JSON.stringify(payload, null, 2), "utf-8");
  } catch (err: any) {
    console.warn("Notice: could not write staff to filesystem in serverless:", err?.message || err);
  }
}

/**
 * Fetches the global staff store payload from Supabase.
 * Checks staff_members table first, then the dedicated system row in bookings.
 */
async function fetchGlobalPayload(): Promise<StaffStorePayload | null> {
  try {
    const supabase = supabaseServer();

    // 1. Try reading dedicated staff_members table if it exists
    try {
      const { data: tblData, error: tblErr } = await supabase
        .from("staff_members")
        .select("*");
      if (!tblErr && Array.isArray(tblData) && tblData.length > 0) {
        return {
          version: 1,
          staff: tblData.map((r: any) => ({
            id: r.id,
            name: r.name,
            email: r.email.toLowerCase().trim(),
            password: r.password,
            role: r.role || "assistant",
            title: r.title || "Legal Assistant",
            permissions: typeof r.permissions === "string" ? JSON.parse(r.permissions) : r.permissions,
            createdAt: r.created_at || r.createdAt || new Date().toISOString(),
          })),
          deletedEmails: [],
          updatedAt: new Date().toISOString(),
        };
      }
    } catch {
      // Table does not exist in schema cache, proceed to system config row
    }

    // 2. Read from system config row in bookings
    const { data, error } = await supabase
      .from("bookings")
      .select("message")
      .eq("id", SYS_STAFF_ROW_ID)
      .maybeSingle();

    if (!error && data && data.message) {
      const parsed = JSON.parse(data.message);
      if (parsed && Array.isArray(parsed.staff)) {
        return {
          version: parsed.version || 1,
          staff: parsed.staff,
          deletedEmails: Array.isArray(parsed.deletedEmails)
            ? parsed.deletedEmails.map((e: string) => e.toLowerCase().trim())
            : [],
          updatedAt: parsed.updatedAt || new Date().toISOString(),
        };
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          version: 1,
          staff: parsed,
          deletedEmails: [],
          updatedAt: new Date().toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn("Could not fetch global staff payload from Supabase:", err);
  }

  return null;
}

/**
 * Persists the global staff store payload to Supabase and local cache.
 */
async function saveGlobalPayload(payload: StaffStorePayload): Promise<boolean> {
  memoryPayload = payload;
  lastFetchTime = Date.now();
  saveLocalDiskPayload(payload);

  try {
    const supabase = supabaseServer();
    const { error } = await supabase.from("bookings").upsert({
      id: SYS_STAFF_ROW_ID,
      name: "SYSTEM_STAFF_STORE",
      phone: "0000000000",
      service: SYS_SERVICE_FLAG,
      booking_date: "2099-12-31",
      booking_time: "00:00",
      status: SYS_STATUS_FLAG,
      message: JSON.stringify(payload),
    });

    if (error) {
      console.error("Supabase staff save error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to persist staff globally to Supabase:", err);
    return false;
  }
}

/**
 * Returns the current active payload.
 * Refreshes from Supabase if cache is expired or empty.
 */
export async function getStaffStorePayload(forceRefresh = false): Promise<StaffStorePayload> {
  const now = Date.now();
  if (!forceRefresh && memoryPayload && now - lastFetchTime < CACHE_TTL_MS) {
    return memoryPayload;
  }

  // 1. Fetch from global Supabase
  const remote = await fetchGlobalPayload();
  if (remote) {
    memoryPayload = remote;
    lastFetchTime = now;
    saveLocalDiskPayload(remote);
    return remote;
  }

  // 2. Fallback to local disk
  const local = readLocalDiskPayload();
  if (local) {
    // Purge any deleted emails from local list if present
    const cleanStaff = local.staff.filter(
      (s) => !local.deletedEmails.includes(s.email.toLowerCase().trim())
    );
    const cleanPayload = { ...local, staff: cleanStaff };
    memoryPayload = cleanPayload;
    lastFetchTime = now;
    // Attempt saving to Supabase in background so global sync is established
    saveGlobalPayload(cleanPayload).catch(() => {});
    return cleanPayload;
  }

  // 3. Default initial staff
  const defaults = getDefaultStaff();
  const initialPayload: StaffStorePayload = {
    version: 1,
    staff: defaults,
    deletedEmails: [],
    updatedAt: new Date().toISOString(),
  };

  memoryPayload = initialPayload;
  lastFetchTime = now;
  saveGlobalPayload(initialPayload).catch(() => {});
  return initialPayload;
}

/** Returns all active staff members */
export async function getAllStaff(): Promise<StaffMember[]> {
  const payload = await getStaffStorePayload();
  return payload.staff.filter(
    (s) => !payload.deletedEmails.includes(s.email.toLowerCase().trim())
  );
}

/** Returns a staff member by ID */
export async function getStaffById(id: string): Promise<StaffMember | null> {
  const staff = await getAllStaff();
  return staff.find((s) => s.id === id) || null;
}

/** Returns a staff member by Email. Returns null if account is deleted or not found. */
export async function getStaffByEmail(email: string): Promise<StaffMember | null> {
  const normalized = email.toLowerCase().trim();
  const payload = await getStaffStorePayload(true); // force refresh for security

  if (payload.deletedEmails.includes(normalized)) {
    return null;
  }

  const found = payload.staff.find((s) => s.email.toLowerCase().trim() === normalized);
  return found || null;
}

/** Adds a new staff member or reactivates a previously deleted email */
export async function addStaffMember(data: {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "secretary" | "assistant";
  title?: string;
  permissions?: Partial<StaffPermissions>;
}): Promise<{ success: boolean; staff?: StaffMember; error?: string }> {
  const payload = await getStaffStorePayload(true);
  const normalized = data.email.toLowerCase().trim();

  // If already active
  if (payload.staff.some((s) => s.email.toLowerCase().trim() === normalized)) {
    return { success: false, error: "A staff member with this email already exists." };
  }

  const newMember: StaffMember = {
    id: `staff_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: data.name.trim(),
    email: normalized,
    password: data.password.trim(),
    role: data.role || "assistant",
    title: data.title?.trim() || "Legal Assistant",
    permissions: {
      canManageBookings: data.permissions?.canManageBookings ?? true,
      canManageInquiries: data.permissions?.canManageInquiries ?? true,
      canViewClients: data.permissions?.canViewClients ?? true,
      canManageChamber: data.permissions?.canManageChamber ?? false,
      canManageStaff: false, // only master admin can manage staff
    },
    createdAt: new Date().toISOString(),
  };

  // Remove from deletedEmails if Head of Chambers explicitly re-adds them
  const updatedDeleted = payload.deletedEmails.filter((e) => e !== normalized);
  const updatedStaff = [...payload.staff, newMember];

  const updatedPayload: StaffStorePayload = {
    ...payload,
    staff: updatedStaff,
    deletedEmails: updatedDeleted,
    updatedAt: new Date().toISOString(),
  };

  await saveGlobalPayload(updatedPayload);
  return { success: true, staff: newMember };
}

/** Updates permissions for a staff member */
export async function updateStaffPermissions(
  id: string,
  permissions: Partial<StaffPermissions>
): Promise<{ success: boolean; staff?: StaffMember; error?: string }> {
  const payload = await getStaffStorePayload(true);
  let target: StaffMember | null = null;

  const updatedStaff = payload.staff.map((s) => {
    if (s.id === id) {
      target = {
        ...s,
        permissions: {
          ...s.permissions,
          ...permissions,
          ...(s.role === "admin" ? { canManageStaff: true } : {}),
        },
      };
      return target;
    }
    return s;
  });

  if (!target) return { success: false, error: "Staff member not found." };

  const updatedPayload: StaffStorePayload = {
    ...payload,
    staff: updatedStaff,
    updatedAt: new Date().toISOString(),
  };

  await saveGlobalPayload(updatedPayload);
  return { success: true, staff: target };
}

/**
 * Permanently deletes a staff member and adds their email to the tombstone list.
 * Deleted staff can NEVER log in, reset password, or be re-seeded automatically.
 */
export async function deleteStaffMember(id: string): Promise<{ success: boolean; error?: string }> {
  const payload = await getStaffStorePayload(true);
  const target = payload.staff.find((s) => s.id === id);

  if (!target) return { success: false, error: "Staff member not found." };
  if (target.role === "admin" || target.id === "master-admin") {
    return { success: false, error: "Cannot delete the Master Admin account." };
  }

  const normalized = target.email.toLowerCase().trim();
  const updatedStaff = payload.staff.filter((s) => s.id !== id);
  const updatedDeleted = Array.from(new Set([...payload.deletedEmails, normalized]));

  const updatedPayload: StaffStorePayload = {
    ...payload,
    staff: updatedStaff,
    deletedEmails: updatedDeleted,
    updatedAt: new Date().toISOString(),
  };

  await saveGlobalPayload(updatedPayload);
  return { success: true };
}

/**
 * Globally updates the password for a staff account or master admin.
 * Writes immediately to Supabase so mobile and all containers reflect the new password.
 */
export async function updatePassword(
  email: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const payload = await getStaffStorePayload(true);
  const normalized = email.toLowerCase().trim();

  // If email is tombstoned/deleted, refuse update
  if (payload.deletedEmails.includes(normalized)) {
    return { success: false, error: "This staff account has been removed." };
  }

  let found = false;
  const updatedStaff = payload.staff.map((s) => {
    if (s.email.toLowerCase().trim() === normalized) {
      found = true;
      return { ...s, password: newPassword.trim() };
    }
    return s;
  });

  if (!found) {
    const adminEmail = (process.env.ADMIN_EMAIL || "shareenhussain@truelegaladvice.com").toLowerCase().trim();
    if (normalized === adminEmail) {
      const newAdmin: StaffMember = {
        id: "master-admin",
        name: "Adv. Shareen Hussain",
        email: adminEmail,
        password: newPassword.trim(),
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
      };
      updatedStaff.push(newAdmin);
      found = true;
    }
  }

  if (!found) return { success: false, error: "Account not found." };

  const updatedPayload: StaffStorePayload = {
    ...payload,
    staff: updatedStaff,
    updatedAt: new Date().toISOString(),
  };

  await saveGlobalPayload(updatedPayload);
  return { success: true };
}

/**
 * Authenticates staff credentials against the global database.
 * If password was updated from laptop, mobile will immediately verify against the new password.
 */
export async function authenticateStaff(
  email: string,
  password: string
): Promise<{ success: boolean; staff?: StaffMember; error?: string }> {
  const normalized = email.toLowerCase().trim();
  const payload = await getStaffStorePayload(true); // force fresh fetch from Supabase

  // Check tombstone list
  if (payload.deletedEmails.includes(normalized)) {
    return { success: false, error: "Account has been deactivated or removed by Head of Chambers." };
  }

  const found = payload.staff.find((s) => s.email.toLowerCase().trim() === normalized);

  if (!found) {
    return { success: false, error: "Invalid email or password." };
  }

  if (found.password !== password.trim()) {
    return { success: false, error: "Invalid email or password." };
  }

  return { success: true, staff: found };
}

/** Synchronous fallbacks for backwards compatibility */
export function getAllStaffSync(): StaffMember[] {
  if (memoryPayload && Array.isArray(memoryPayload.staff)) {
    return memoryPayload.staff.filter(
      (s) => !memoryPayload!.deletedEmails.includes(s.email.toLowerCase().trim())
    );
  }
  const local = readLocalDiskPayload();
  if (local) return local.staff;
  return getDefaultStaff();
}

export function getStaffByEmailSync(email: string): StaffMember | null {
  const list = getAllStaffSync();
  const normalized = email.toLowerCase().trim();
  return list.find((s) => s.email.toLowerCase().trim() === normalized) || null;
}
