import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { sendBookingEmail } from "@/lib/notify-email";
import { sendBookingWhatsApp, sendClientMeetLinkWhatsApp } from "@/lib/notify-whatsapp";
import { getAllDaySlots, isDateBookable } from "@/lib/availability";
import { createGoogleMeetLink } from "@/lib/google-meet";
import { site, services } from "@/lib/site-config";

// Postgres unique_violation error code
const UNIQUE_VIOLATION = "23505";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, service, bookingDate, bookingTime, consultationMode, message } = body;

    if (!name || !phone || !service || !bookingDate || !bookingTime) {
      return NextResponse.json(
        { error: "Name, phone, service, date, and time slot are all required." },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate) || !getAllDaySlots().includes(bookingTime)) {
      return NextResponse.json({ error: "Invalid date or time slot." }, { status: 400 });
    }

    const mode = consultationMode === "online" ? "online" : "offline";

    const [y, m, d] = bookingDate.split("-").map(Number);
    if (!isDateBookable(new Date(y, m - 1, d))) {
      return NextResponse.json(
        { error: "That date is no longer available. Please pick another date." },
        { status: 400 }
      );
    }

    // For online consultations, try to auto-generate a Google Meet link now.
    // If Google credentials aren't configured yet, this quietly returns null
    // and the booking still goes through — the lawyer can add a link later.
    let meetLink: string | null = null;
    if (mode === "online") {
      const [hh] = bookingTime.split(":").map(Number);
      const start = new Date(y, m - 1, d, hh, 0, 0);
      const end = new Date(start);
      end.setHours(end.getHours() + 1);
      const serviceLabel = services.find((s) => s.slug === service)?.title || service;

      const result = await createGoogleMeetLink({
        summary: `${serviceLabel} consultation — ${name}`,
        description: `Video consultation with ${site.lawyerName} (${site.businessName}).\nClient: ${name}\nPhone: ${phone}`,
        startISO: start.toISOString(),
        endISO: end.toISOString(),
        attendeeEmail: email || null,
      });
      meetLink = result.meetLink;
    }

    let bookingRecord = {
      id: "bk_" + Date.now(),
      name,
      phone,
      email: email || null,
      service,
      booking_date: bookingDate,
      booking_time: bookingTime,
      consultation_mode: mode,
      meet_link: meetLink || site.googleMeetRoom,
      message: message || null,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    try {
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = supabaseServer();
        const { data, error } = await supabase
          .from("bookings")
          .insert({
            name,
            phone,
            email: email || null,
            service,
            booking_date: bookingDate,
            booking_time: bookingTime,
            consultation_mode: mode,
            meet_link: meetLink,
            message: message || null,
            status: "pending",
          })
          .select()
          .single();

        if (error) {
          if (error.code === UNIQUE_VIOLATION) {
            return NextResponse.json(
              { error: "Sorry, that time slot was just booked by someone else. Please choose another slot.", slotTaken: true },
              { status: 409 }
            );
          }
          console.error("Supabase insert error:", error);
        } else if (data) {
          bookingRecord = data;
        }
      }
    } catch {
      // Fallback in-memory booking
    }

    // Fire notifications, but don't let a notification failure block the booking itself.
    // The client also gets their own WhatsApp message with the Meet link when one was generated.
    await Promise.allSettled([
      sendBookingEmail(data),
      sendBookingWhatsApp(data),
      sendClientMeetLinkWhatsApp(data),
    ]);

    return NextResponse.json({ success: true, booking: data });
  } catch (err) {
    console.error("Booking API error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
