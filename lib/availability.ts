// ============================================================
// Single source of truth for bookable hours.
// Chamber hours: Morning 9:30 AM – 1:00 PM & Evening 5:30 PM – 8:30 PM
// ============================================================

export const BOOKING_WINDOW_DAYS = 30; // how far ahead clients can book
export const OFFICE_OPEN_HOUR = 9; // 9 AM
export const OFFICE_CLOSE_HOUR = 21; // 9 PM (last slot 20:30 / 8:30 PM)
export const CLOSED_WEEKDAYS: number[] = []; // open all days

/** Returns every 30-minute slot start time in "HH:00" or "HH:30" format */
export function getAllDaySlots(): string[] {
  const slots: string[] = [
    "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
  ];
  return slots;
}

/** "2026-07-05" style date key in the *local* timezone */
export function toDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** True if the given date is bookable */
export function isDateBookable(date: Date, today?: Date): boolean {
  const ref = today ?? getIndiaTime();
  const start = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + BOOKING_WINDOW_DAYS);

  const check = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (check < start || check > end) return false;
  if (CLOSED_WEEKDAYS.includes(check.getDay())) return false;
  return true;
}

/**
 * Accurately extracts real-time India Standard Time (IST, UTC+5:30) values
 * regardless of whether the hosting environment/browser is UTC, US, or India.
 */
export function getIndiaNow(): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  dateKey: string;
  totalMinutes: number;
} {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  let year = 0, month = 0, day = 0, hour = 0, minute = 0;
  for (const p of parts) {
    if (p.type === "year") year = parseInt(p.value, 10);
    if (p.type === "month") month = parseInt(p.value, 10);
    if (p.type === "day") day = parseInt(p.value, 10);
    if (p.type === "hour") hour = parseInt(p.value, 10);
    if (p.type === "minute") minute = parseInt(p.value, 10);
  }
  if (hour === 24) hour = 0;
  const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const totalMinutes = hour * 60 + minute;
  return { year, month, day, hour, minute, dateKey, totalMinutes };
}

/** Legacy helper returning a Date in IST */
export function getIndiaTime(): Date {
  const ist = getIndiaNow();
  return new Date(ist.year, ist.month - 1, ist.day, ist.hour, ist.minute, 0, 0);
}

export interface SlotDetail {
  time: string;
  status: "available" | "booked" | "passed";
}

/**
 * Given a date key and booked times, returns detailed statuses for all day slots:
 * whether each slot is available, already booked, or time has passed for today.
 */
export function getDetailedSlotsForDate(
  dateKey: string,
  bookedTimes: string[],
  nowIST = getIndiaNow()
): {
  allSlots: string[];
  availableSlots: string[];
  bookedSlots: string[];
  passedSlots: string[];
  slots: SlotDetail[];
} {
  const all = getAllDaySlots();
  const bookedSet = new Set(bookedTimes);
  const isToday = dateKey === nowIST.dateKey;

  const bookedSlots: string[] = [];
  const passedSlots: string[] = [];
  const availableSlots: string[] = [];

  const slots: SlotDetail[] = all.map((slot) => {
    if (bookedSet.has(slot)) {
      bookedSlots.push(slot);
      return { time: slot, status: "booked" };
    }
    if (isToday) {
      const [h, m] = slot.split(":").map(Number);
      const slotMinutes = h * 60 + m;
      // Slot has only passed if current IST minute is past the slot time
      if (slotMinutes <= nowIST.totalMinutes) {
        passedSlots.push(slot);
        return { time: slot, status: "passed" };
      }
    }
    availableSlots.push(slot);
    return { time: slot, status: "available" };
  });

  return {
    allSlots: all,
    availableSlots,
    bookedSlots,
    passedSlots,
    slots,
  };
}

/**
 * Given a date key and booked times, returns which of the day's slots are still available.
 */
export function getAvailableSlotsForDate(dateKey: string, bookedTimes: string[]): string[] {
  const { availableSlots } = getDetailedSlotsForDate(dateKey, bookedTimes);
  return availableSlots;
}
