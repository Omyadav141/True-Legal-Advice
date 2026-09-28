import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { sendBookingEmail } from "@/lib/notify-email";
import { sendBookingWhatsApp, sendClientMeetLinkWhatsApp, sendClientOfficeVisitWhatsApp } from "@/lib/notify-whatsapp";
import { getAllDaySlots, isDateBookable } from "@/lib/availability";
import { createGoogleMeetLink } from "@/lib/google-meet";
import { site, services } from "@/lib/site-config";
import { saveLocalBooking, BookingRecord } from "@/lib/bookings-store";

// Postgres unique_violation error code
const UNIQUE_VIOLATION = "23505";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, service, sub_service, subService, bookingDate, bookingTime, consultationMode, message } = body;
    const finalSubService = sub_service || subService || null;

    if (!name || !phone || !service || !bookingDate || !bookingTime) {
      return NextResponse.json(
        { error: "Name, phone, service, date, and time slot are all required." },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate) || !getAllDaySlots().includes(bookingTime)) {
      return NextResponse.json({ error: "Invalid date or time slot." }, { status: 400 });
    }

    const mode: "online" | "offline" = consultationMode === "online" ? "online" : "offline";

    const [y, m, d] = bookingDate.split("-").map(Number);
    if (!isDateBookable(new Date(y, m - 1, d))) {
      return NextResponse.json(
        { error: "That date is no longer available. Please pick another date." },
        { status: 400 }
      );
    }

    // For online consultations, try to auto-generate a Google Meet link now.
    let meetLink: string | null = null;
    if (mode === "online") {
      const [hh] = bookingTime.split(":").map(Number);
      const start = new Date(y, m - 1, d, hh, 0, 0);
      const end = new Date(start);
      end.setHours(end.getHours() + 1);
      const serviceLabel = services.find((s) => s.slug === service)?.title || service;
      const matterDetail = finalSubService ? ` - ${finalSubService}` : "";

      const result = await createGoogleMeetLink({
        summary: `${serviceLabel}${matterDetail} consultation — ${name}`,
        description: `Video consultation with ${site.lawyerName} (${site.businessName}).\nClient: ${name}\nPhone: ${phone}\nMatter: ${finalSubService || serviceLabel}`,
        startISO: start.toISOString(),
        endISO: end.toISOString(),
        attendeeEmail: email || null,
      });
      meetLink = result.meetLink;
    }

    // Office visit consultations are auto-confirmed (paid slot); online can be confirmed or pending review
    const initialStatus = mode === "offline" ? "confirmed" : "pending";

    let bookingRecord: BookingRecord = {
      id: "bk_" + Date.now(),
      name,
      phone,
      email: email || null,
      service,
      sub_service: finalSubService,
      booking_date: bookingDate,
      booking_time: bookingTime,
      consultation_mode: mode,
      meet_link: meetLink || site.googleMeetRoom,
      message: message || null,
      status: initialStatus,
      created_at: new Date().toISOString(),
    };

    // Attempt to persist in Supabase
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
        const payload: Record<string, unknown> = {
          name,
          phone,
          email: email || null,
          service,
          booking_date: bookingDate,
          booking_time: bookingTime,
          consultation_mode: mode,
          meet_link: meetLink,
          message: finalSubService ? `[Matter: ${finalSubService}] ${message || ""}`.trim() : (message || null),
          status: initialStatus,
        };

        const { data: dbData, error } = await supabase
          .from("bookings")
          .insert(payload)
          .select()
          .single();

        if (error) {
          if (error.code === UNIQUE_VIOLATION) {
            return NextResponse.json(
              { error: "Sorry, that time slot was just booked by someone else. Please choose another slot.", slotTaken: true },
              { status: 409 }
            );
          }
          console.warn("Supabase insert notification:", error.message);
        } else if (dbData) {
          bookingRecord = { ...bookingRecord, ...dbData, sub_service: finalSubService };
        }
      }
    } catch (sbErr) {
      console.warn("Supabase connection issue:", sbErr);
    }

    // Always persist to local storage as rock-solid guarantee
    saveLocalBooking(bookingRecord);

    // Fire notifications, but don't let a notification failure block the booking itself.
    await Promise.allSettled([
      sendBookingEmail(bookingRecord),
      sendBookingWhatsApp(bookingRecord),
      mode === "offline"
        ? sendClientOfficeVisitWhatsApp(bookingRecord)
        : sendClientMeetLinkWhatsApp(bookingRecord),
    ]);

    return NextResponse.json({ success: true, booking: bookingRecord });
  } catch (err) {
    console.error("Booking API error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
