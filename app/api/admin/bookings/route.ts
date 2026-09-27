import { NextRequest, NextResponse } from "next/server";
import { getSessionRole } from "@/lib/admin-session";
import { supabaseServer } from "@/lib/supabase-server";

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

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json({ error: "Could not load bookings." }, { status: 500 });
  }

  // Auto-complete: confirmed bookings whose meeting time has passed become "completed".
  const now = nowInIndia();
  const toComplete = (data || []).filter(
    (b) => b.status === "confirmed" && meetingHasEnded(b.booking_date, b.booking_time, now)
  );

  if (toComplete.length > 0) {
    const ids = toComplete.map((b) => b.id);
    const { error: completeError } = await supabase
      .from("bookings")
      .update({ status: "completed" })
      .in("id", ids);

    if (completeError) {
      console.error("Failed to auto-complete bookings:", completeError);
    } else {
      for (const b of data || []) {
        if (ids.includes(b.id)) b.status = "completed";
      }
    }
  }

  return NextResponse.json({ bookings: data, role });
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

    const supabase = supabaseServer();

    // The legal secretary may only confirm or cancel pending requests.
    if (role === "secretary") {
      if (status !== "confirmed" && status !== "cancelled") {
        return NextResponse.json(
          { error: "The secretary account can only confirm or cancel bookings." },
          { status: 403 }
        );
      }

      const { data: existing, error: fetchError } = await supabase
        .from("bookings")
        .select("status")
        .eq("id", id)
        .single();

      if (fetchError || !existing) {
        return NextResponse.json({ error: "Booking not found." }, { status: 404 });
      }
      if (existing.status !== "pending") {
        return NextResponse.json(
          { error: "Only pending bookings can be confirmed or cancelled." },
          { status: 403 }
        );
      }
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update booking:", error);
      return NextResponse.json({ error: "Could not update booking." }, { status: 500 });
    }

    return NextResponse.json({ booking: data });
  } catch (err) {
    console.error("Admin bookings PATCH error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
