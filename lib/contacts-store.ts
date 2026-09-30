import fs from "fs";
import path from "path";
import os from "os";

export interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string;
  mode: string;
  message: string | null;
  status: "new" | "contacted" | "converted" | "closed";
  created_at: string;
}

const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT
);

const DATA_DIR = isServerless ? path.join(os.tmpdir(), "tla_data") : path.join(process.cwd(), "data");
const CONTACTS_FILE = path.join(DATA_DIR, "contacts.json");
const BUNDLED_FILE = path.join(process.cwd(), "data", "contacts.json");

let memoryContacts: ContactInquiry[] | null = null;

function ensureFileExists() {
  if (memoryContacts && memoryContacts.length > 0) return;

  try {
    if (fs.existsSync(CONTACTS_FILE)) {
      const raw = fs.readFileSync(CONTACTS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryContacts = parsed;
        return;
      }
    }
    if (fs.existsSync(BUNDLED_FILE)) {
      const raw = fs.readFileSync(BUNDLED_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryContacts = parsed;
        return;
      }
    }
  } catch (err) {
    console.error("Notice reading contacts file:", err);
  }

  memoryContacts = [];
}

function writeContactsToFile(contacts: ContactInquiry[]) {
  memoryContacts = contacts;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2), "utf-8");
  } catch (err: any) {
    console.warn("Notice: could not write contacts file in serverless:", err?.message || err);
  }
}

export function getLocalContacts(): ContactInquiry[] {
  ensureFileExists();
  return memoryContacts || [];
}

export function saveLocalContact(record: ContactInquiry): ContactInquiry {
  ensureFileExists();
  const existing = memoryContacts || [];
  const filtered = existing.filter((c) => c.id !== record.id);
  const updated = [record, ...filtered];
  writeContactsToFile(updated);
  return record;
}

export function updateLocalContactStatus(
  id: string,
  status: ContactInquiry["status"]
): boolean {
  ensureFileExists();
  const existing = memoryContacts || [];
  let found = false;
  const updated = existing.map((c) => {
    if (c.id === id) {
      found = true;
      return { ...c, status };
    }
    return c;
  });
  if (found) {
    writeContactsToFile(updated);
  }
  return found;
}

export function deleteLocalContact(id: string): boolean {
  ensureFileExists();
  const existing = memoryContacts || [];
  const filtered = existing.filter((c) => c.id !== id);
  if (filtered.length !== existing.length) {
    writeContactsToFile(filtered);
    return true;
  }
  return false;
}
