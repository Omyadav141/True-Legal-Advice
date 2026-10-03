import { site } from "./site-config";

export type BookingWhatsAppPayload = {
  name: string;
  phone: string;
  service: string;
  sub_service?: string | null;
  booking_date: string;
  booking_time: string;
  consultation_mode?: string;
  meet_link?: string | null;
  booking_id?: string;
};

export type ContactWhatsAppPayload = {
  name: string;
  phone: string;
  service?: string;
  mode?: string;
  message?: string | null;
};

const serviceLabels: Record<string, string> = {
  "court-marriage": "Court Marriage & Registration",
  "trademark-registration": "Trademark & Brand IP",
  "legal-services": "Litigation & Legal Services",
};

/**
 * Sanitizes phone numbers for WhatsApp API (defaults to Indian 91 country code if 10 digits).
 */
function formatWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }
  return digits;
}

/**
 * Core multi-provider WhatsApp dispatch engine.
 * Supports:
 * 1. Meta WhatsApp Cloud API (Graph API)
 * 2. Twilio WhatsApp API
 * 3. Generic WhatsApp Gateway / Webhook
 */
async function dispatchWhatsAppMessage({
  to,
  body,
  templateName,
  templateParams,
}: {
  to: string;
  body: string;
  templateName?: string;
  templateParams?: string[];
}): Promise<boolean> {
  const cleanTo = formatWhatsAppNumber(to);

  // 1. Provider: Meta WhatsApp Cloud API
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const metaToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (metaPhoneId && metaToken) {
    try {
      let metaPayload: Record<string, unknown>;

      if (templateName) {
        metaPayload = {
          messaging_product: "whatsapp",
          to: cleanTo,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
            components: templateParams
              ? [
                  {
                    type: "body",
                    parameters: templateParams.map((text) => ({ type: "text", text })),
                  },
                ]
              : [],
          },
        };
      } else {
        metaPayload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanTo,
          type: "text",
          text: { preview_url: true, body },
        };
      }

      const res = await fetch(`https://graph.facebook.com/v20.0/${metaPhoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${metaToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metaPayload),
      });

      if (res.ok) {
        console.log(`[WhatsApp Meta] Dispatched successfully to ${cleanTo}`);
        return true;
      }

      const errorText = await res.text();
      console.warn(`[WhatsApp Meta] Error response for ${cleanTo}:`, errorText);
    } catch (err) {
      console.error(`[WhatsApp Meta] Exception sending to ${cleanTo}:`, err);
    }
  }

  // 2. Provider: Twilio WhatsApp API
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER;

  if (twilioSid && twilioAuth && twilioFrom) {
    try {
      const fromParam = twilioFrom.startsWith("whatsapp:") ? twilioFrom : `whatsapp:${twilioFrom}`;
      const toParam = `whatsapp:+${cleanTo}`;

      const params = new URLSearchParams();
      params.append("From", fromParam);
      params.append("To", toParam);
      params.append("Body", body);

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );

      if (res.ok) {
        console.log(`[WhatsApp Twilio] Dispatched to ${toParam}`);
        return true;
      }
      console.warn(`[WhatsApp Twilio] Failed to send:`, await res.text());
    } catch (err) {
      console.error(`[WhatsApp Twilio] Exception:`, err);
    }
  }

  // 3. Provider: Generic Webhook / UltraMsg / Gateway
  const genericApiUrl = process.env.WHATSAPP_API_URL || process.env.WHATSAPP_WEBHOOK_URL;
  if (genericApiUrl) {
    try {
      const res = await fetch(genericApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.WHATSAPP_API_KEY ? { "x-api-key": process.env.WHATSAPP_API_KEY } : {}),
        },
        body: JSON.stringify({
          to: cleanTo,
          message: body,
          text: body,
        }),
      });
      if (res.ok) {
        console.log(`[WhatsApp Gateway] Dispatched to ${cleanTo}`);
        return true;
      }
    } catch (err) {
      console.error(`[WhatsApp Gateway] Exception:`, err);
    }
  }

  // If no automated provider credentials are set, log clearly for setup guidance
  if (!metaToken && !twilioAuth && !genericApiUrl) {
    console.warn(
      `[WhatsApp Automation] Credentials not configured in .env (WHATSAPP_ACCESS_TOKEN or TWILIO_AUTH_TOKEN). Message to ${cleanTo} logged:\n${body}`
    );
  }

  return false;
}

/**
 * Sends a real-time WhatsApp alert to the Lawyer / Chamber Desk when a new booking is booked.
 */
export async function sendBookingWhatsApp(booking: BookingWhatsAppPayload) {
  const notifyNumber = process.env.NOTIFY_WHATSAPP_TO || site.whatsappNumber;
  const matterLabel =
    booking.sub_service || serviceLabels[booking.service] || booking.service;
  const isOnline = booking.consultation_mode === "online";
  const meetUrl = booking.meet_link || site.googleMeetRoom;
  const bookingId = booking.booking_id || `TLA-${Date.now().toString().slice(-6)}`;

  const body = `🏛️ *NEW CONSULTATION BOOKING ALERT*
*Chambers of Adv. Shareen Hussain*

🆔 *Ref:* ${bookingId}
👤 *Client:* ${booking.name}
📞 *Phone:* ${booking.phone}
⚖️ *Matter:* ${matterLabel}
📅 *Date:* ${booking.booking_date}
⏰ *Time:* ${booking.booking_time}
💻 *Mode:* ${isOnline ? `Online (Google Meet: ${meetUrl})` : "Office Visit (Trisharan Sq.)"}
🌐 *Dashboard:* https://trulegaladvice.com/admin/dashboard`;

  const templateName = process.env.WHATSAPP_TEMPLATE_ALERT || "new_booking_alert";

  await dispatchWhatsAppMessage({
    to: notifyNumber,
    body,
    templateName,
    templateParams: [booking.name, matterLabel, booking.phone],
  });
}

/**
 * Sends the client a WhatsApp confirmation with Google Meet session link for Online Consultations.
 */
export async function sendClientMeetLinkWhatsApp(booking: BookingWhatsAppPayload) {
  const meetUrl = booking.meet_link || site.googleMeetRoom;
  const bookingId = booking.booking_id || `TLA-${Date.now().toString().slice(-6)}`;

  const body = `*CONSULTATION CONFIRMED — Adv. Shareen Hussain*
🏛️ *True Legal Advice Chambers (Nagpur)*

Dear ${booking.name},
Your online consultation is confirmed.

🆔 *Booking Ref:* ${bookingId}
📅 *Date:* ${booking.booking_date}
⏰ *Time:* ${booking.booking_time} (30 mins)
🔗 *Google Meet Link:* ${meetUrl}

Please click the link above 5 minutes prior to your slot. For assistance, contact our desk at +91 83296 31199.
Website: https://trulegaladvice.com`;

  const templateName = process.env.WHATSAPP_TEMPLATE_MEET || "meet_link_confirmation";

  await dispatchWhatsAppMessage({
    to: booking.phone,
    body,
    templateName,
    templateParams: [booking.name, `${booking.booking_date} at ${booking.booking_time}`, meetUrl],
  });
}

/**
 * Sends the client a WhatsApp confirmation with Chamber Office address for In-Person Consultations.
 */
export async function sendClientOfficeVisitWhatsApp(booking: BookingWhatsAppPayload) {
  const bookingId = booking.booking_id || `TLA-${Date.now().toString().slice(-6)}`;

  const body = `*CONSULTATION CONFIRMED — Adv. Shareen Hussain*
🏛️ *True Legal Advice Chambers (Nagpur)*

Dear ${booking.name},
Your in-person consultation at our chamber is confirmed.

🆔 *Booking Ref:* ${bookingId}
📅 *Date:* ${booking.booking_date}
⏰ *Time:* ${booking.booking_time}
📍 *Chamber Address:* Trisharan Square, Nagpur - 440027, Maharashtra
🗺️ *Google Maps:* https://maps.app.goo.gl/Vwohsi756p55cBZp7?g_st=iwb

Please arrive 5–10 minutes before your slot with relevant documents.
Desk: +91 83296 31199 | Website: https://trulegaladvice.com`;

  const templateName = process.env.WHATSAPP_TEMPLATE_OFFICE || "office_visit_confirmation";

  await dispatchWhatsAppMessage({
    to: booking.phone,
    body,
    templateName,
    templateParams: [
      booking.name,
      `${booking.booking_date} at ${booking.booking_time}`,
      "Trisharan Square, Nagpur - 440027, Maharashtra",
    ],
  });
}
