import nodemailer from "nodemailer";
import { Resend } from "resend";
import { site } from "./site-config";

export type BookingEmailPayload = {
  name: string;
  phone: string;
  email?: string | null;
  service: string;
  sub_service?: string | null;
  booking_date: string;
  booking_time: string;
  consultation_mode?: string;
  meet_link?: string | null;
  message?: string | null;
  booking_id?: string;
};

export type ContactEmailPayload = {
  name: string;
  phone: string;
  email?: string | null;
  service?: string;
  mode?: string;
  message?: string | null;
};

const serviceLabels: Record<string, string> = {
  "court-marriage": "Court Marriage & Registration",
  "trademark-registration": "Trademark & Intellectual Property",
  "legal-services": "Litigation & Other Legal Services",
};

/**
 * Creates or reuses a Nodemailer SMTP transporter.
 */
function getSmtpTransporter() {
  const host = process.env.SMTP_HOST || "smtpout.secureserver.net";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER || "advshareens@trulegaladvice.com";
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;

  if (!pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    // Useful for servers with self-signed or intermediate chain certificates
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Low-level unified mail dispatch (SMTP primary, Resend secondary fallback).
 */
async function dispatchEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}) {
  const from =
    process.env.SMTP_FROM ||
    `"Adv. Shareen Hussain | True Legal Advice" <${process.env.SMTP_USER || "advshareens@trulegaladvice.com"}>`;

  // 1. Primary: SMTP via Nodemailer
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        replyTo: replyTo || process.env.SMTP_USER || "advshareens@trulegaladvice.com",
        subject,
        html,
        text,
      });
      console.log(`[SMTP] Sent email to ${to} (MessageId: ${info.messageId})`);
      return { success: true, method: "smtp", messageId: info.messageId };
    } catch (smtpErr) {
      console.error(`[SMTP] Error sending email to ${to}:`, smtpErr);
      // Fall through to Resend if available
    }
  }

  // 2. Secondary fallback: Resend API
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const res = await resend.emails.send({
        from: from.includes("<") ? from : `True Legal Advice <${from}>`,
        to,
        replyTo: replyTo || undefined,
        subject,
        html,
      });
      console.log(`[Resend] Sent email to ${to}`);
      return { success: true, method: "resend", data: res };
    } catch (resendErr) {
      console.error(`[Resend] Error sending email to ${to}:`, resendErr);
    }
  }

  if (!transporter && !resendApiKey) {
    console.warn(
      `[Email Service] Neither SMTP_PASSWORD nor RESEND_API_KEY is configured. Email to "${to}" was logged instead of dispatched.`
    );
  }

  return { success: false };
}

/**
 * Sends automated booking confirmation to the CLIENT and an alert to the ADVOCATE CHAMBERS.
 */
export async function sendBookingEmail(booking: BookingEmailPayload) {
  const rawChamberEmails = [
    process.env.NOTIFY_EMAIL_TO,
    process.env.CONTACT_EMAIL_TO,
    site.email,
    "advshareens@trulegaladvice.com",
  ].filter(Boolean) as string[];

  const chamberEmails = Array.from(
    new Set(
      rawChamberEmails
        .flatMap((s) => s.split(","))
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s && s.includes("@"))
    )
  );

  const effectiveMatter =
    booking.sub_service ||
    serviceLabels[booking.service] ||
    booking.service ||
    "Legal Consultation";

  const isOnline = booking.consultation_mode === "online";
  const meetUrl = booking.meet_link || site.googleMeetRoom;
  const bookingId = booking.booking_id || `TLA-${Date.now().toString().slice(-6)}`;

  // ==========================================
  // 1. CLIENT CONFIRMATION EMAIL TEMPLATE
  // ==========================================
  const clientHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consultation Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0e14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0e14; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #12161f; border: 1px solid #cba758; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Chamber Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #181d28 0%, #0d1017 100%); padding: 28px 24px; border-bottom: 1px solid rgba(203, 167, 88, 0.3); text-align: center;">
              <span style="font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #cba758; font-weight: bold; display: block; margin-bottom: 6px;">
                CONFIRMED CONSULTATION APPOINTMENT
              </span>
              <h1 style="margin: 0; font-family: Georgia, serif; font-size: 24px; color: #ffffff; font-weight: bold;">
                Chambers of Adv. Shareen Hussain
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #a1a1aa;">
                High Court & District Court Advocate · True Legal Advice
              </p>
            </td>
          </tr>

          <!-- Greeting & Pass -->
          <tr>
            <td style="padding: 24px;">
              <p style="font-size: 15px; color: #e4e4e7; margin: 0 0 16px 0; line-height: 1.5;">
                Dear <strong>${booking.name}</strong>,
              </p>
              <p style="font-size: 14px; color: #d4d4d8; margin: 0 0 20px 0; line-height: 1.6;">
                Your legal consultation appointment has been scheduled with Adv. Shareen Hussain. Please find your official appointment pass and joining details below.
              </p>

              <!-- Appointment Pass Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0c0f16; border: 1px solid #27272a; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #a1a1aa; width: 38%;">Booking Ref:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #cba758; font-weight: bold; font-family: monospace;">${bookingId}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #a1a1aa;">Scheduled Date:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #ffffff; font-weight: 600;">${booking.booking_date}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #a1a1aa;">Time Slot:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #ffffff; font-weight: 600;">${booking.booking_time} (30 Minutes)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #a1a1aa;">Legal Matter:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #ffffff; font-weight: 600;">${effectiveMatter}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #a1a1aa;">Consultation Mode:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: ${isOnline ? "#38bdf8" : "#fbbf24"}; font-weight: bold;">
                    ${isOnline ? "Online Video Call (Google Meet)" : "In-Person Office Visit"}
                  </td>
                </tr>
              </table>

              <!-- Action Link / Venue Detail -->
              ${
                isOnline
                  ? `
              <div style="background-color: #0e1e2d; border: 1px solid #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #bae6fd; font-weight: bold;">
                  YOUR GOOGLE MEET SESSION LINK:
                </p>
                <a href="${meetUrl}" target="_blank" style="display: inline-block; background: #0284c7; color: #ffffff; font-weight: bold; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 8px;">
                  Join Video Consultation &rarr;
                </a>
                <p style="margin: 10px 0 0 0; font-size: 11px; color: #7dd3fc; font-family: monospace; word-break: break-all;">
                  ${meetUrl}
                </p>
              </div>
              `
                  : `
              <div style="background-color: #1a160d; border: 1px solid #ca8a04; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #fde047; font-weight: bold;">
                  CHAMBER OFFICE VENUE:
                </p>
                <p style="margin: 0; font-size: 14px; color: #ffffff; font-weight: 600;">
                  Trisharan Square, Nagpur - 440027, Maharashtra
                </p>
                <p style="margin: 6px 0 12px 0; font-size: 12px; color: #a1a1aa;">
                  (Adv. Shareen Hussain Chambers · High Court & District Court Practice)
                </p>
                <a href="https://maps.app.goo.gl/Vwohsi756p55cBZp7?g_st=iwb" target="_blank" style="display: inline-block; background: #cba758; color: #000000; font-weight: bold; font-size: 12px; text-decoration: none; padding: 8px 18px; border-radius: 6px;">
                  Open in Google Maps &rarr;
                </a>
              </div>
              `
              }

              <!-- Preparation Advisory -->
              <div style="border-left: 3px solid #cba758; padding-left: 14px; margin-bottom: 24px;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #cba758; font-weight: bold; text-transform: uppercase;">
                  Important Instructions
                </p>
                <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 1.5;">
                  • Please be ready 5 minutes before your scheduled slot.<br>
                  • Have relevant documents, notices, or matter details available.<br>
                  • All consultations are strictly protected by advocate-client confidentiality.
                </p>
              </div>

              <!-- Assistance -->
              <p style="font-size: 13px; color: #a1a1aa; margin: 0; line-height: 1.6;">
                For rescheduling or immediate assistance, reply to this email or call our desk at 
                <a href="tel:+918329631199" style="color: #cba758; text-decoration: none; font-weight: bold;">+91 83296 31199</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0d1017; padding: 18px 24px; border-top: 1px solid #1f2430; text-align: center; font-size: 11px; color: #71717a;">
              True Legal Advice · Trisharan Square, Nagpur - 440027, Maharashtra<br>
              Official Website: <a href="https://trulegaladvice.com" style="color: #cba758; text-decoration: none;">trulegaladvice.com</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

  const dispatches: Promise<any>[] = [];

  // 1. CLIENT CONFIRMATION EMAIL (if email exists)
  if (booking.email && booking.email.includes("@")) {
    dispatches.push(
      dispatchEmail({
        to: booking.email,
        replyTo: "advshareens@trulegaladvice.com",
        subject: `Confirmed: Consultation with Adv. Shareen Hussain [Ref: ${bookingId}]`,
        html: clientHtml,
        text: `Appointment Confirmed with Adv. Shareen Hussain\nBooking Ref: ${bookingId}\nDate: ${booking.booking_date}\nTime: ${booking.booking_time}\nMode: ${
          isOnline ? `Online (Google Meet: ${meetUrl})` : "In-Person Office (Trisharan Sq, Nagpur)"
        }\nHelpline: +91 83296 31199\nWebsite: https://trulegaladvice.com`,
      })
    );
  }

  // ==========================================
  // 2. CHAMBER NOTIFICATION EMAIL
  // ==========================================
  const cleanClientPhone = booking.phone.replace(/\D/g, "").slice(-10);
  const chamberHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Consultation Booking Alert</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 20px; color: #18181b;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; padding: 24px; border: 1px solid #e4e4e7; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <div style="border-bottom: 2px solid #cba758; padding-bottom: 12px; margin-bottom: 16px;">
      <span style="font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #854d0e; font-weight: bold; display: block;">
        True Legal Advice · Chambers Alert
      </span>
      <h2 style="color: #09090b; margin: 4px 0 0 0; font-family: Georgia, serif; font-size: 20px;">
        New Consultation Booking Received
      </h2>
    </div>

    <p style="font-size: 13.5px; color: #52525b; line-height: 1.5; margin: 0 0 16px 0;">
      A client has scheduled a consultation through the True Legal Advice website. Here are the client and meeting details:
    </p>

    <table width="100%" cellpadding="9" cellspacing="0" style="border-collapse: collapse; font-size: 13px; margin: 0 0 20px 0; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px;">
      <tr style="border-bottom: 1px solid #e4e4e7;">
        <td style="font-weight: bold; width: 34%; color: #71717a;">Booking Ref:</td>
        <td style="font-family: monospace; color: #854d0e; font-weight: bold; font-size: 14px;">${bookingId}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e4e4e7;">
        <td style="font-weight: bold; color: #71717a;">Client Name:</td>
        <td><strong style="color: #09090b; font-size: 14px;">${booking.name}</strong></td>
      </tr>
      <tr style="border-bottom: 1px solid #e4e4e7;">
        <td style="font-weight: bold; color: #71717a;">Client Contact:</td>
        <td>
          <a href="tel:${booking.phone}" style="color: #09090b; font-weight: 600; text-decoration: none;">📞 ${booking.phone}</a> &nbsp;|&nbsp;
          <a href="https://wa.me/91${cleanClientPhone}?text=${encodeURIComponent(
            `Hello ${booking.name}, this is Adv. Shareen Hussain from True Legal Advice regarding your consultation on ${booking.booking_date} at ${booking.booking_time}.${isOnline ? ` Google Meet Link: ${meetUrl}` : ""}`
          )}" target="_blank" style="color: #16a34a; font-weight: bold; text-decoration: none;">💬 WhatsApp Client</a>
        </td>
      </tr>
      <tr style="border-bottom: 1px solid #e4e4e7;">
        <td style="font-weight: bold; color: #71717a;">Email Address:</td>
        <td>${booking.email ? `<a href="mailto:${booking.email}" style="color: #2563eb;">${booking.email}</a>` : '<span style="color: #a1a1aa;">Not provided</span>'}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e4e4e7;">
        <td style="font-weight: bold; color: #71717a;">Legal Matter:</td>
        <td><strong style="color: #09090b;">${effectiveMatter}</strong></td>
      </tr>
      <tr style="border-bottom: 1px solid #e4e4e7;">
        <td style="font-weight: bold; color: #71717a;">Date & Time:</td>
        <td><strong style="color: #09090b;">${booking.booking_date}</strong> at <strong style="color: #09090b;">${booking.booking_time}</strong> (IST)</td>
      </tr>
      <tr style="border-bottom: 1px solid #e4e4e7;">
        <td style="font-weight: bold; color: #71717a;">Consultation Mode:</td>
        <td><strong style="color: ${isOnline ? '#7c3aed' : '#09090b'};">${isOnline ? "Online Video Meeting (Google Meet)" : "In-Person Office (Trisharan Sq.)"}</strong></td>
      </tr>
      ${
        isOnline
          ? `
      <tr style="border-bottom: 1px solid #e4e4e7; background-color: #f5f3ff;">
        <td style="font-weight: bold; color: #6b21a8;">Google Meet Link:</td>
        <td>
          <a href="${meetUrl}" target="_blank" style="color: #7c3aed; font-weight: bold; font-family: monospace; word-break: break-all;">${meetUrl}</a>
          <div style="margin-top: 8px;">
            <a href="${meetUrl}" target="_blank" style="background: #7c3aed; color: #ffffff; padding: 7px 16px; border-radius: 6px; font-size: 12px; font-weight: bold; text-decoration: none; display: inline-block;">
              Join Video Room &rarr;
            </a>
          </div>
        </td>
      </tr>
      `
          : ""
      }
      ${
        booking.message
          ? `
      <tr>
        <td style="font-weight: bold; color: #71717a; vertical-align: top;">Client Notes:</td>
        <td style="color: #27272a; line-height: 1.5;">${booking.message}</td>
      </tr>
      `
          : ""
      }
    </table>

    <div style="text-align: center; margin-top: 20px;">
      <a href="https://trulegaladvice.com/admin/dashboard" style="background: #18181b; color: #ffffff; padding: 11px 22px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: bold; display: inline-block;">
        Open Advocate Admin Dashboard &rarr;
      </a>
    </div>

    <p style="font-size: 11px; color: #a1a1aa; text-align: center; margin: 18px 0 0 0;">
      Automated dispatch from True Legal Advice Booking Desk (trulegaladvice.com)
    </p>
  </div>
</body>
</html>
  `;

  // 2. Chamber Alert Dispatch (Sent to all chamber emails concurrently)
  const chamberSubject = `[New Booking Alert] ${booking.name} — ${booking.booking_date} at ${booking.booking_time} (${effectiveMatter})`;
  for (const cEmail of chamberEmails) {
    dispatches.push(
      dispatchEmail({
        to: cEmail,
        replyTo: booking.email || "support@trulegaladvice.com",
        subject: chamberSubject,
        html: chamberHtml,
        text: `New consultation booking from ${booking.name}\nPhone: ${booking.phone}\nEmail: ${booking.email || "N/A"}\nMatter: ${effectiveMatter}\nDate: ${booking.booking_date} at ${booking.booking_time}\nMode: ${
          isOnline ? `Online (Google Meet: ${meetUrl})` : "In-Person Office Visit"
        }`,
      })
    );
  }

  const results = await Promise.allSettled(dispatches);
  console.log(`[sendBookingEmail] Dispatched ${dispatches.length} emails. Results:`, results.map((r) => r.status));
  return results;
}

/**
 * Sends notification for general website contact inquiries.
 */
export async function sendContactEmail(contact: ContactEmailPayload) {
  const chamberEmail =
    process.env.CONTACT_EMAIL_TO ||
    process.env.NOTIFY_EMAIL_TO ||
    site.email ||
    "advshareens@trulegaladvice.com";

  // 1. Notify Chamber
  const chamberHtml = `
    <div style="font-family: sans-serif; max-width: 500px; padding: 16px; background: #fff; border: 1px solid #ddd; border-radius: 8px;">
      <h3 style="color: #09090b; margin-top: 0;">New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Phone:</strong> <a href="tel:${contact.phone}">${contact.phone}</a></p>
      <p><strong>Email:</strong> ${contact.email || "Not provided"}</p>
      <p><strong>Matter:</strong> ${contact.service || "General Inquiry"}</p>
      <p><strong>Preferred Mode:</strong> ${contact.mode || "Not specified"}</p>
      <p><strong>Message:</strong> ${contact.message || "None"}</p>
      <p style="font-size: 12px; color: #71717a; margin-top: 20px;">Received via trulegaladvice.com contact form</p>
    </div>
  `;

  await dispatchEmail({
    to: chamberEmail,
    subject: `📩 New Contact Inquiry: ${contact.name}`,
    html: chamberHtml,
    text: `New inquiry from ${contact.name} (${contact.phone}): ${contact.message || "No message"}`,
  });

  // 2. Acknowledge Client if email provided
  if (contact.email && contact.email.includes("@")) {
    const ackHtml = `
      <div style="font-family: sans-serif; max-width: 520px; padding: 20px; background: #0c0f16; color: #fff; border: 1px solid #cba758; border-radius: 12px;">
        <h2 style="font-family: Georgia, serif; color: #cba758; margin-top: 0;">Inquiry Received</h2>
        <p>Dear ${contact.name},</p>
        <p>Thank you for reaching out to the Chambers of <strong>Adv. Shareen Hussain</strong>. We have received your inquiry regarding <strong>${contact.service || "legal advisory"}</strong>.</p>
        <p>Our chamber desk will review your details and contact you at <strong>${contact.phone}</strong> shortly.</p>
        <p style="font-size: 13px; color: #a1a1aa; border-top: 1px solid #333; padding-top: 12px; margin-top: 20px;">
          Chambers of Adv. Shareen Hussain · True Legal Advice<br>
          Trisharan Square, Nagpur - 440027, Maharashtra · +91 83296 31199<br>
          <a href="https://trulegaladvice.com" style="color: #cba758;">trulegaladvice.com</a>
        </p>
      </div>
    `;

    await dispatchEmail({
      to: contact.email,
      subject: `Inquiry Received — Chambers of Adv. Shareen Hussain`,
      html: ackHtml,
      text: `Dear ${contact.name},\nThank you for reaching out to the Chambers of Adv. Shareen Hussain. We have received your inquiry and will contact you shortly.\nHelpline: +91 83296 31199\nhttps://trulegaladvice.com`,
    });
  }
}
