import fs from "fs";
import path from "path";

export interface BookingRecord {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string;
  sub_service?: string | null;
  booking_date: string;
  booking_time: string;
  consultation_mode: "online" | "offline";
  meet_link: string | null;
  message: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  attendance?: "attended" | "no_show" | "scheduled" | null;
  created_at: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");

function ensureFileExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

export function getLocalBookings(): BookingRecord[] {
  try {
    ensureFileExists();
    const raw = fs.readFileSync(BOOKINGS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading local bookings:", err);
    return [];
  }
}

export function saveLocalBooking(record: BookingRecord): BookingRecord {
  try {
    ensureFileExists();
    const existing = getLocalBookings();
    // Check if duplicate ID exists
    const filtered = existing.filter((b) => b.id !== record.id);
    const updated = [record, ...filtered];
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
    return record;
  } catch (err) {
    console.error("Error saving local booking:", err);
    return record;
  }
}

export function updateLocalBookingStatus(id: string, status: BookingRecord["status"]): boolean {
  return updateLocalBookingRecord(id, { status });
}

export function updateLocalBookingAttendance(
  id: string,
  attendance: "attended" | "no_show" | "scheduled"
): boolean {
  return updateLocalBookingRecord(id, { attendance });
}

export function updateLocalBookingRecord(
  id: string,
  updates: Partial<BookingRecord>
): boolean {
  try {
    ensureFileExists();
    const existing = getLocalBookings();
    let found = false;
    const updated = existing.map((b) => {
      if (b.id === id) {
        found = true;
        return { ...b, ...updates };
      }
      return b;
    });
    if (found) {
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
    }
    return found;
  } catch (err) {
    console.error("Error updating local booking record:", err);
    return false;
  }
}
