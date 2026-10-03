import { NextRequest, NextResponse } from "next/server";
import { getSessionRole } from "@/lib/admin-session";
import { supabaseServer } from "@/lib/supabase-server";
import {
  getLocalBookings,
  updateLocalBookingStatus,
  updateLocalBookingAttendance,
  updateLocalBookingRecord,
  deleteLocalBooking,
  BookingRecord,
  getBookingId,
} from "@/lib/bookings-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MEETING_DURATION_MINUTES = 60;

/** Current date/time in India (Asia/Kolkata), where all appointments happen. */
function nowInIndia(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
}

/** True when a booking's meeting window (start + 1 hour) has fully passed. */
function meetingHasEnded(bookingDate: string, bookingTime: string, now: Date): boolean {
  if (!bookingDate || !bookingTime) return false;
  const [y, m, d] = bookingDate.split("-").map(Number);
  const [hh, mm] = bookingTime.split(":").map(Number);
  if ([y, m, d, hh].some((n) => Number.isNaN(n))) return false;
  const end = new Date(y, m - 1, d, hh, (mm || 0) + MEETING_DURATION_MINUTES, 0, 0);
  return end <= now;
}

export async function GET() {
  const role = await getSessionRole();
  if (!role) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const localList = getLocalBookings();
  let supabaseList: BookingRecord[] = [];

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
        .select("*")
        .neq("service", "__SYSTEM_CONFIG__")
        .order("created_at", { ascending: false });

      if (!error && data) {
        supabaseList = (data as any[]).filter(
          (b) => !String(b.status).startsWith("system_") && b.service !== "__SYSTEM_CONFIG__"
        ) as BookingRecord[];
      }
    }
  } catch (err) {
    console.warn("Supabase fetch notice:", err);
  }

  // Merge and de-duplicate by ID
  const map = new Map<string, BookingRecord>();
  for (const b of [...supabaseList, ...localList]) {
    if (String(b.status).startsWith("system_") || b.service === "__SYSTEM_CONFIG__") continue;
    const bookingWithId: BookingRecord = {
      ...b,
      booking_id: b.booking_id || getBookingId(b),
    };
    if (!map.has(b.id)) {
      map.set(b.id, bookingWithId);
    }
  }
  const mergedBookings = Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Auto-complete: confirmed bookings whose meeting time has passed become "completed".
  const now = nowInIndia();
  for (const b of mergedBookings) {
    if (b.status === "confirmed" && meetingHasEnded(b.booking_date, b.booking_time, now)) {
      b.status = "completed";
      updateLocalBookingStatus(b.id, "completed");
    }
  }

  return NextResponse.json(
    { bookings: mergedBookings, role },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

export async function PATCH(req: NextRequest) {
  const role = await getSessionRole();
  if (!role) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const { id, status, attendance, booking_date, booking_time, meet_link } = await req.json();

    if (!id || (!status && !attendance && !booking_date && !booking_time && !meet_link)) {
      return NextResponse.json(
        { error: "id and at least one field (status, attendance, booking_date, booking_time, meet_link) are required." },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};

    if (status) {
      const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
      }
      updates.status = status;
    }

    if (attendance) {
      const validAttendances = ["attended", "no_show", "scheduled"];
      if (!validAttendances.includes(attendance)) {
        return NextResponse.json({ error: "Invalid attendance value." }, { status: 400 });
      }
      updates.attendance = attendance;
    }

    if (booking_date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(booking_date)) {
        return NextResponse.json({ error: "Invalid booking_date format (YYYY-MM-DD)." }, { status: 400 });
      }
      updates.booking_date = booking_date;
    }

    if (booking_time) {
      if (!/^\d{2}:\d{2}$/.test(booking_time)) {
        return NextResponse.json({ error: "Invalid booking_time format (HH:MM)." }, { status: 400 });
      }
      updates.booking_time = booking_time;
    }

    if (typeof meet_link === "string" && meet_link.trim()) {
      updates.meet_link = meet_link.trim();
    }

    // Try updating Supabase
    try {
      const supabase = supabaseServer();
      const { error: sbErr } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", id);

      if (sbErr) {
        if (sbErr.code === "23505") {
          return NextResponse.json(
            { error: "This time slot is already booked for that date. Please select another slot." },
            { status: 409 }
          );
        }
        console.error("Supabase update error:", sbErr.message);
      }
    } catch (sbErr) {
      console.warn("Supabase update exception:", sbErr);
    }

    // Update local store
    updateLocalBookingRecord(id, updates);

    return NextResponse.json({ success: true, booking: { id, ...updates } });
  } catch (err) {
    console.error("Admin bookings PATCH error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const role = await getSessionRole();
  if (!role) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id query parameter is required." }, { status: 400 });
    }

    // Try deleting from Supabase
    try {
      const supabase = supabaseServer();
      const { error: sbErr } = await supabase
        .from("bookings")
        .delete()
        .eq("id", id);

      if (sbErr) {
        console.error("Supabase delete error:", sbErr.message);
      }
    } catch (sbErr) {
      console.warn("Supabase delete exception:", sbErr);
    }

    // Delete from local store
    deleteLocalBooking(id);

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("Admin bookings DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete booking." }, { status: 500 });
  }
}

