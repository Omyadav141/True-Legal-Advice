import { Resend } from "resend";
import { site } from "./site-config";

type Booking = {
  name: string;
  phone: string;
  email?: string | null;
  service: string;
  booking_date: string;
  booking_time: string;
  consultation_mode?: string;
  meet_link?: string | null;
  message?: string | null;
};

const serviceLabels: Record<string, string> = {
  "court-marriage": "Court marriage",
  "trademark-registration": "Trademark registration",
  "legal-services": "Other legal services",
};

export async function sendBookingEmail(booking: Booking) {
  const apiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL_TO || site.email;

  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping email notification.");
    return;
  }

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: "Booking notifications <bookings@yourdomain.com>", // must be a verified domain in Resend
      to: notifyEmail,
      subject: `New appointment request: ${booking.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px;">
          <h2 style="color: #09090b;">New appointment request</h2>
          <p><strong>Name:</strong> ${booking.name}</p>
          <p><strong>Phone:</strong> ${booking.phone}</p>
          ${booking.email ? `<p><strong>Email:</strong> ${booking.email}</p>` : ""}
          <p><strong>Service:</strong> ${serviceLabels[booking.service] || booking.service}</p>
          <p><strong>Date:</strong> ${booking.booking_date}</p>
          <p><strong>Time slot:</strong> ${booking.booking_time}</p>
          <p><strong>Mode:</strong> ${booking.consultation_mode === "online" ? "Online (Video call)" : "In-person (Office visit)"}</p>
          ${booking.meet_link ? `<p><strong>Meet link:</strong> <a href="${booking.meet_link}">${booking.meet_link}</a></p>` : ""}
          ${booking.message ? `<p><strong>Message:</strong> ${booking.message}</p>` : ""}
          <p style="margin-top: 20px; color: #7c847d; font-size: 13px;">Log in to the admin dashboard to view and manage this booking.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send booking email:", err);
  }
}
