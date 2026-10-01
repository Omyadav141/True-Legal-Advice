import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getAllDaySlots, getDetailedSlotsForDate, isDateBookable, getIndiaNow } from "@/lib/availability";
import { getChamberStatus, isDateInChamberLeave } from "@/lib/chamber-status";
import { getLocalBookings } from "@/lib/bookings-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// In-memory booked slots fallback when Supabase credentials are not set
const localBookedSlots: Record<string, string[]> = {};

export async function GET(req: NextRequest) {
  try {
    const dateParam = req.nextUrl.searchParams.get("date");
    const modeParam = req.nextUrl.searchParams.get("mode") as "offline" | "online" | null;
    if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json({ error: "A valid date (YYYY-MM-DD) is required." }, { status: 400 });
    }

    const nowIST = getIndiaNow();
    const [y, m, d] = dateParam.split("-").map(Number);
    const requestedDate = new Date(y, m - 1, d);
    const todayISTDate = new Date(nowIST.year, nowIST.month - 1, nowIST.day);

    if (!isDateBookable(requestedDate, todayISTDate)) {
      return NextResponse.json(
        { date: dateParam, availableSlots: [], allSlots: getAllDaySlots(), bookedSlots: [], passedSlots: [] },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    // Check if the chamber is on multi-day scheduled leave / holiday for this date
    const chamber = await getChamberStatus();
    if (isDateInChamberLeave(dateParam, chamber, modeParam)) {
      const allSlots = getAllDaySlots();
      return NextResponse.json(
        {
          date: dateParam,
          availableSlots: [],
          bookedSlots: allSlots,
          passedSlots: [],
          allSlots,
          onLeave: true,
          leaveReason: chamber.leaveReason || "Scheduled Chamber Leave / Holiday",
          leaveStartDate: chamber.leaveStartDate,
          leaveEndDate: chamber.leaveEndDate,
          isOfficeOpen: chamber.isOfficeOpen,
          isOnlineOpen: chamber.isOnlineOpen,
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    let bookedTimes: string[] = localBookedSlots[dateParam] || [];

    // Check local store: only include active pending/confirmed bookings that are NOT marked no_show or cancelled
    try {
      const localRecords = getLocalBookings();
      for (const b of localRecords) {
        if (
          b.booking_date === dateParam &&
          (b.status === "pending" || b.status === "confirmed") &&
          b.attendance !== "no_show"
        ) {
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
          .select("booking_time, status, attendance")
          .eq("booking_date", dateParam)
          .in("status", ["pending", "confirmed"]);

        if (!error && data) {
          const activeSlots = data
            .filter((r) => r.attendance !== "no_show" && r.status !== "cancelled")
            .map((r) => r.booking_time as string);
          bookedTimes = Array.from(new Set([...bookedTimes, ...activeSlots]));
        }
      }
    } catch {
      // Supabase not configured in local environment; fallback to memory
    }

    const { availableSlots, bookedSlots, passedSlots, allSlots, slots } = getDetailedSlotsForDate(dateParam, bookedTimes, nowIST);

    return NextResponse.json(
      {
        date: dateParam,
        availableSlots,
        bookedSlots,
        passedSlots,
        allSlots,
        slots,
        isOfficeOpen: chamber.isOfficeOpen,
        isOnlineOpen: chamber.isOnlineOpen,
        awayReason: chamber.awayReason,
        returnEstimate: chamber.returnEstimate,
        onLeave: chamber.onLeave,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );

  } catch (err) {
    console.error("Availability API error:", err);
    // Graceful fallback to guarantee slots are never completely empty
    return NextResponse.json({
      date: req.nextUrl.searchParams.get("date") || "today",
      availableSlots: ["10:00", "10:30", "11:00", "11:30", "12:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"],
      bookedSlots: [],
      passedSlots: [],
      allSlots: ["10:00", "10:30", "11:00", "11:30", "12:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"],
    });
  }
}
