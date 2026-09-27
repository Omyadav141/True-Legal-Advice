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
export function isDateBookable(date: Date, today: Date = new Date()): boolean {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + BOOKING_WINDOW_DAYS);

  const check = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (check < start || check > end) return false;
  if (CLOSED_WEEKDAYS.includes(check.getDay())) return false;
  return true;
}

/**
 * Convert UTC to India Standard Time (IST, UTC+5:30)
 */
export function getIndiaTime(): Date {
  const utcNow = new Date();
  const istTime = new Date(utcNow.getTime() + 5.5 * 60 * 60 * 1000);
  return istTime;
}

/**
 * Given a date key and booked times, returns which of the day's slots are still available.
 */
export function getAvailableSlotsForDate(dateKey: string, bookedTimes: string[], now: Date = getIndiaTime()): string[] {
  const all = getAllDaySlots();
  const bookedSet = new Set(bookedTimes);
  const todayKey = toDateKey(now);
  const isToday = dateKey === todayKey;

  const available = all.filter((slot) => {
    if (bookedSet.has(slot)) return false;
    if (isToday) {
      const [h, m] = slot.split(":").map(Number);
      const slotTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
      if (slotTime <= now) return false;
    }
    return true;
  });

  // If today is selected but all standard daytime slots passed, provide the evening chamber slots so the user always has bookable slots!
  if (isToday && available.length === 0) {
    return ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30"].filter((s) => !bookedSet.has(s));
  }

  return available;
}
