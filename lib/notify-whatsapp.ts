import { site } from "./site-config";

type Booking = {
  name: string;
  phone: string;
  service: string;
  booking_date: string;
  booking_time: string;
  consultation_mode?: string;
  meet_link?: string | null;
};

const serviceLabels: Record<string, string> = {
  "court-marriage": "Court marriage",
  "trademark-registration": "Trademark registration",
  "legal-services": "Other legal services",
};

// Sends a WhatsApp message to the lawyer via Meta's WhatsApp Cloud API
// whenever a new booking comes in.
//
// SETUP NEEDED (one-time, done by you in Meta Business dashboard):
// 1. Create a Meta Business Account: business.facebook.com
// 2. Set up WhatsApp Business Platform, verify the business phone number
// 3. Get: WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN
// 4. Add both to .env.local
// 5. IMPORTANT: Meta requires the first message in a 24hr window to use an
//    approved "template" message (not free text). Create a simple template
//    called "new_booking_alert" in Meta's dashboard with variables for
//    name, service, phone — then reference it below.
export async function sendBookingWhatsApp(booking: Booking) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const notifyNumber = process.env.NOTIFY_WHATSAPP_TO || site.whatsappNumber;

  if (!phoneNumberId || !accessToken) {
    console.warn("WhatsApp API credentials not set — skipping WhatsApp notification.");
    return;
  }

  try {
    await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: notifyNumber,
        type: "template",
        template: {
          name: "new_booking_alert", // must match the template name created in Meta dashboard
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: booking.name },
                { type: "text", text: serviceLabels[booking.service] || booking.service },
                { type: "text", text: booking.phone },
              ],
            },
          ],
        },
      }),
    });
  } catch (err) {
    console.error("Failed to send WhatsApp notification:", err);
  }
}

// Sends the client themselves a WhatsApp confirmation with their Google
// Meet link, for online consultations where a link was generated.
//
// SETUP: uses the same WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN as
// above. Requires a second approved template (e.g. "meet_link_confirmation")
// with variables for name, date/time, and the Meet link, since this is also
// an outbound-initiated message subject to Meta's template rule.
export async function sendClientMeetLinkWhatsApp(booking: Booking) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken || !booking.meet_link) {
    return;
  }

  try {
    await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: `91${booking.phone.replace(/\D/g, "").slice(-10)}`, // adjust country code as needed
        type: "template",
        template: {
          name: "meet_link_confirmation", // create this template in Meta's dashboard
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: booking.name },
                { type: "text", text: `${booking.booking_date} at ${booking.booking_time}` },
                { type: "text", text: booking.meet_link },
              ],
            },
          ],
        },
      }),
    });
  } catch (err) {
    console.error("Failed to send client Meet link notification:", err);
  }
}
