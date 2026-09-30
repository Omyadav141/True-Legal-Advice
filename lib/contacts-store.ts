import fs from "fs";
import path from "path";

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

const DATA_DIR = path.join(process.cwd(), "data");
const CONTACTS_FILE = path.join(DATA_DIR, "contacts.json");

function ensureFileExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CONTACTS_FILE)) {
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

export function getLocalContacts(): ContactInquiry[] {
  try {
    ensureFileExists();
    const raw = fs.readFileSync(CONTACTS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading local contacts:", err);
    return [];
  }
}

export function saveLocalContact(record: ContactInquiry): ContactInquiry {
  try {
    ensureFileExists();
    const existing = getLocalContacts();
    const filtered = existing.filter((c) => c.id !== record.id);
    const updated = [record, ...filtered];
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(updated, null, 2), "utf-8");
    return record;
  } catch (err) {
    console.error("Error saving local contact:", err);
    return record;
  }
}

export function updateLocalContactStatus(
  id: string,
  status: ContactInquiry["status"]
): boolean {
  try {
    ensureFileExists();
    const existing = getLocalContacts();
    let found = false;
    const updated = existing.map((c) => {
      if (c.id === id) {
        found = true;
        return { ...c, status };
      }
      return c;
    });
    if (found) {
      fs.writeFileSync(CONTACTS_FILE, JSON.stringify(updated, null, 2), "utf-8");
    }
    return found;
  } catch (err) {
    console.error("Error updating local contact status:", err);
    return false;
  }
}

export function deleteLocalContact(id: string): boolean {
  try {
    ensureFileExists();
    const existing = getLocalContacts();
    const filtered = existing.filter((c) => c.id !== id);
    if (filtered.length !== existing.length) {
      fs.writeFileSync(CONTACTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error deleting local contact:", err);
    return false;
  }
}

