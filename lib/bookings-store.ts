import fs from "fs";
import path from "path";
import os from "os";
import { BookingRecord, getBookingId } from "./booking-utils";

export * from "./booking-utils";

const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT
);

const DATA_DIR = isServerless ? path.join(os.tmpdir(), "tla_data") : path.join(process.cwd(), "data");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");
const BUNDLED_FILE = path.join(process.cwd(), "data", "bookings.json");

let memoryBookings: BookingRecord[] | null = null;

function ensureFileExists() {
  if (memoryBookings && memoryBookings.length > 0) return;

  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const raw = fs.readFileSync(BOOKINGS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryBookings = parsed.map((b) => ({
          ...b,
          booking_id: b.booking_id || getBookingId(b),
        }));
        return;
      }
    }
    if (fs.existsSync(BUNDLED_FILE)) {
      const raw = fs.readFileSync(BUNDLED_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryBookings = parsed.map((b) => ({
          ...b,
          booking_id: b.booking_id || getBookingId(b),
        }));
        return;
      }
    }
  } catch (err) {
    console.error("Notice reading local bookings:", err);
  }

  memoryBookings = [];
}

function writeBookingsToFile(bookings: BookingRecord[]) {
  memoryBookings = bookings;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), "utf-8");
  } catch (err: any) {
    console.warn("Notice: could not write bookings file in serverless:", err?.message || err);
  }
}

export function getLocalBookings(): BookingRecord[] {
  ensureFileExists();
  return memoryBookings || [];
}

export function saveLocalBooking(record: BookingRecord): BookingRecord {
  ensureFileExists();
  const existing = memoryBookings || [];
  const ensuredRecord: BookingRecord = {
    ...record,
    booking_id: record.booking_id || getBookingId(record),
  };
  const filtered = existing.filter((b) => b.id !== ensuredRecord.id);
  const updated = [ensuredRecord, ...filtered];
  writeBookingsToFile(updated);
  return ensuredRecord;
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
  ensureFileExists();
  const existing = memoryBookings || [];
  let found = false;
  const updated = existing.map((b) => {
    if (b.id === id) {
      found = true;
      return { ...b, ...updates };
    }
    return b;
  });
  if (found) {
    writeBookingsToFile(updated);
  }
  return found;
}

export function deleteLocalBooking(id: string): boolean {
  ensureFileExists();
  const existing = memoryBookings || [];
  const filtered = existing.filter((b) => b.id !== id && b.booking_id !== id);
  if (filtered.length !== existing.length) {
    writeBookingsToFile(filtered);
    return true;
  }
  return false;
}
