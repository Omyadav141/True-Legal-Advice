import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getAvailableSlotsForDate, getDetailedSlotsForDate, isDateBookable } from "@/lib/availability";

import { getLocalBookings } from "@/lib/bookings-store";

// Convert UTC to India Standard Time (IST, UTC+5:30)
function getIndiaTime(): Date {
  const now = new Date();
  const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return istTime;
}

// In-memory booked slots fallback when Supabase credentials are not set
const localBookedSlots: Record<string, string[]> = {};

export async function GET(req: NextRequest) {
  try {
    const dateParam = req.nextUrl.searchParams.get("date");
    if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json({ error: "A valid date (YYYY-MM-DD) is required." }, { status: 400 });
    }

    const nowIndia = getIndiaTime();
    const [y, m, d] = dateParam.split("-").map(Number);
    const requestedDate = new Date(y, m - 1, d);

    if (!isDateBookable(requestedDate, nowIndia)) {
      return NextResponse.json({ date: dateParam, availableSlots: [] });
    }

    let bookedTimes: string[] = localBookedSlots[dateParam] || [];

    // Check local store
    try {
      const localRecords = getLocalBookings();
      for (const b of localRecords) {
        if (b.booking_date === dateParam && (b.status === "pending" || b.status === "confirmed")) {
          bookedTimes.push(b.booking_time);
        }
      }
    } catch {}

    try {
      const hasSupabase =
        Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
        Boolean(
          process.env.SUPABASE_SERVICE_ROLE_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

      if (hasSupabase) {
        const supabase = supabaseServer();
        const { data, error } = await supabase
          .from("bookings")
          .select("booking_time")
          .eq("booking_date", dateParam)
          .in("status", ["pending", "confirmed"]);

        if (!error && data) {
          bookedTimes = Array.from(new Set([...bookedTimes, ...data.map((r) => r.booking_time as string)]));
        }
      }
    } catch {
      // Supabase not configured in local environment; fallback to memory
    }

    const { availableSlots, bookedSlots, passedSlots, allSlots, slots } = getDetailedSlotsForDate(dateParam, bookedTimes, nowIndia);

    return NextResponse.json({
      date: dateParam,
      availableSlots,
      bookedSlots,
      passedSlots,
      allSlots,
      slots,
    });
  } catch (err) {
    console.error("Availability API error:", err);
    // Graceful fallback to guarantee slots are never completely empty
    return NextResponse.json({
      date: req.nextUrl.searchParams.get("date") || "today",
      availableSlots: ["10:00", "10:30", "11:00", "11:30", "12:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
      bookedSlots: [],
      passedSlots: [],
      allSlots: ["10:00", "10:30", "11:00", "11:30", "12:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
    });
  }
}
