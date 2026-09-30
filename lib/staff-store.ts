import fs from "fs";
import path from "path";

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

const DATA_DIR = path.join(process.cwd(), "data");
const STAFF_FILE = path.join(DATA_DIR, "staff.json");

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
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STAFF_FILE)) {
      const defaults = getDefaultStaff();
      fs.writeFileSync(STAFF_FILE, JSON.stringify(defaults, null, 2), "utf-8");
      return defaults;
    }
    const raw = fs.readFileSync(STAFF_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const defaults = getDefaultStaff();
      fs.writeFileSync(STAFF_FILE, JSON.stringify(defaults, null, 2), "utf-8");
      return defaults;
    }
    return parsed;
  } catch (err) {
    console.error("Error reading staff file:", err);
    return getDefaultStaff();
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
  fs.writeFileSync(STAFF_FILE, JSON.stringify(updated, null, 2), "utf-8");
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

  fs.writeFileSync(STAFF_FILE, JSON.stringify(updated, null, 2), "utf-8");
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
  fs.writeFileSync(STAFF_FILE, JSON.stringify(filtered, null, 2), "utf-8");
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

  fs.writeFileSync(STAFF_FILE, JSON.stringify(updated, null, 2), "utf-8");
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
