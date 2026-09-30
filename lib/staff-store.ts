import fs from "fs";
import path from "path";
import os from "os";

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

// Global in-memory cache across serverless warm executions
let memoryStaff: StaffMember[] | null = null;

function getStoragePaths() {
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
  );

  const bundledDir = path.join(process.cwd(), "data");
  const bundledFile = path.join(bundledDir, "staff.json");

  // In serverless environments, /var/task is read-only.
  // Use os.tmpdir() (/tmp) which is the only writable directory.
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

function ensureFileExists(): StaffMember[] {
  if (memoryStaff && Array.isArray(memoryStaff) && memoryStaff.length > 0) {
    return memoryStaff;
  }

  const { isServerless, bundledFile, writableFile } = getStoragePaths();

  // 1. If running on serverless, attempt to read from writable /tmp location
  if (isServerless) {
    try {
      if (fs.existsSync(writableFile)) {
        const raw = fs.readFileSync(writableFile, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryStaff = parsed;
          return memoryStaff;
        }
      }
    } catch (err) {
      console.warn("Could not read writable staff file from tmp:", err);
    }
  }

  // 2. Try to read from bundled staff.json in project
  try {
    if (fs.existsSync(bundledFile)) {
      const raw = fs.readFileSync(bundledFile, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryStaff = parsed;
        saveStaffList(memoryStaff);
        return memoryStaff;
      }
    }
  } catch (err) {
    console.warn("Could not read bundled staff.json:", err);
  }

  // 3. Fallback to default staff
  const defaults = getDefaultStaff();
  memoryStaff = defaults;
  saveStaffList(defaults);
  return defaults;
}

function saveStaffList(staff: StaffMember[]): boolean {
  memoryStaff = staff;
  const { writableDir, writableFile } = getStoragePaths();

  try {
    if (!fs.existsSync(writableDir)) {
      fs.mkdirSync(writableDir, { recursive: true });
    }
    fs.writeFileSync(writableFile, JSON.stringify(staff, null, 2), "utf-8");
    return true;
  } catch (err: any) {
    console.warn("Notice: could not write staff to filesystem in serverless:", err?.message || err);
    // In-memory cache is already updated, so the app remains fully functional
    return true;
  }
}

export function getAllStaff(): StaffMember[] {
  return ensureFileExists();
}

export function getStaffById(id: string): StaffMember | null {
  const staff = ensureFileExists();
  return staff.find((s) => s.id === id) || null;
}

export function getStaffByEmail(email: string): StaffMember | null {
  const staff = ensureFileExists();
  const normalized = email.toLowerCase().trim();
  return staff.find((s) => s.email.toLowerCase().trim() === normalized) || null;
}

export function addStaffMember(data: {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "secretary" | "assistant";
  title?: string;
  permissions?: Partial<StaffPermissions>;
}): { success: boolean; staff?: StaffMember; error?: string } {
  const staff = ensureFileExists();
  const normalized = data.email.toLowerCase().trim();

  if (staff.some((s) => s.email.toLowerCase().trim() === normalized)) {
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

  const updated = [...staff, newMember];
  saveStaffList(updated);
  return { success: true, staff: newMember };
}

export function updateStaffPermissions(
  id: string,
  permissions: Partial<StaffPermissions>
): { success: boolean; staff?: StaffMember; error?: string } {
  const staff = ensureFileExists();
  let target: StaffMember | null = null;

  const updated = staff.map((s) => {
    if (s.id === id) {
      target = {
        ...s,
        permissions: {
          ...s.permissions,
          ...permissions,
          // Master admin always retains full permissions
          ...(s.role === "admin" ? { canManageStaff: true } : {}),
        },
      };
      return target;
    }
    return s;
  });

  if (!target) return { success: false, error: "Staff member not found." };

  saveStaffList(updated);
  return { success: true, staff: target };
}

export function deleteStaffMember(id: string): { success: boolean; error?: string } {
  const staff = ensureFileExists();
  const target = staff.find((s) => s.id === id);

  if (!target) return { success: false, error: "Staff member not found." };
  if (target.role === "admin" || target.id === "master-admin") {
    return { success: false, error: "Cannot delete the Master Admin account." };
  }

  const filtered = staff.filter((s) => s.id !== id);
  saveStaffList(filtered);
  return { success: true };
}

export function updatePassword(
  email: string,
  newPassword: string
): { success: boolean; error?: string } {
  const staff = ensureFileExists();
  const normalized = email.toLowerCase().trim();
  let found = false;

  const updated = staff.map((s) => {
    if (s.email.toLowerCase().trim() === normalized) {
      found = true;
      return { ...s, password: newPassword.trim() };
    }
    return s;
  });

  if (!found) {
    // If not found in file, check if it's the master admin from env
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
      updated.push(newAdmin);
      found = true;
    }
  }

  if (!found) return { success: false, error: "Account not found." };

  saveStaffList(updated);
  return { success: true };
}

export function authenticateStaff(
  email: string,
  password: string
): { success: boolean; staff?: StaffMember; error?: string } {
  const staff = ensureFileExists();
  const normalized = email.toLowerCase().trim();
  const found = staff.find((s) => s.email.toLowerCase().trim() === normalized);

  if (!found) {
    // Fallback: check env variables
    const adminEmail = (process.env.ADMIN_EMAIL || "shareenhussain@truelegaladvice.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "password123";
    if (normalized === adminEmail && password === adminPassword) {
      return {
        success: true,
        staff: {
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
      };
    }
    return { success: false, error: "Invalid email or password." };
  }

  if (found.password !== password.trim()) {
    return { success: false, error: "Invalid email or password." };
  }

  return { success: true, staff: found };
}
