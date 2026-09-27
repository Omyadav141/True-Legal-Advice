import { NextRequest, NextResponse } from "next/server";
import { getSessionRole } from "@/lib/admin-session";
import { supabaseServer } from "@/lib/supabase-server";
import { getLocalBookings, updateLocalBookingStatus, BookingRecord } from "@/lib/bookings-store";

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
        .order("created_at", { ascending: false });

      if (!error && data) {
        supabaseList = data as BookingRecord[];
      }
    }
  } catch (err) {
    console.warn("Supabase fetch notice:", err);
  }

  // Merge and de-duplicate by ID
  const map = new Map<string, BookingRecord>();
  for (const b of [...supabaseList, ...localList]) {
    if (!map.has(b.id)) {
      map.set(b.id, b);
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

  return NextResponse.json({ bookings: mergedBookings, role });
}

export async function PATCH(req: NextRequest) {
  const role = await getSessionRole();
  if (!role) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required." }, { status: 400 });
    }

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }

    // Try updating Supabase
    try {
      const supabase = supabaseServer();
      await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);
    } catch {}

    // Update local store
    updateLocalBookingStatus(id, status);

    return NextResponse.json({ success: true, booking: { id, status } });
  } catch (err) {
    console.error("Admin bookings PATCH error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
