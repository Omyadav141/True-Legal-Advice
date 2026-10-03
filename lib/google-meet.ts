import { site } from "./site-config";

// ============================================================
// Genuine Google Meet link generation for online consultations.
//
// HOW GOOGLE MEET WORKS:
// Google Meet ONLY allows joining meetings that were officially created
// through Google servers (either via Google Calendar API or meet.google.com).
// Randomly invented URLs (e.g. meet.google.com/tla-xxx-yyy) are rejected by Google
// with "Check your meeting code. Make sure that you've entered the correct meeting code".
//
// TWO SUPPORTED WAYS TO PROVIDE WORKING MEET LINKS:
//
// 1. FASTEST (Zero code, 30-second setup):
//    - Go to meet.google.com -> Click "New meeting" -> "Create a meeting for later"
//    - Copy the permanent URL (e.g. https://meet.google.com/xyz-abcd-efg)
//    - Put it in .env.local: PERMANENT_GOOGLE_MEET_URL=https://meet.google.com/xyz-abcd-efg
//    - Every online client gets this exact real, always-working Google Meet room.
//
// 2. AUTOMATED DYNAMIC ROOMS (Google Calendar API):
//    - Enable "Google Calendar API" in Google Cloud Console
//    - Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN to .env.local
//    - The backend will create a unique Google Calendar event with a unique Meet room
//      for every single online booking automatically.
// ============================================================

export type MeetLinkResult = {
  meetLink: string | null;
  eventId: string | null;
  source: "google_calendar_api" | "permanent_chamber_room" | "none";
};

/**
 * Validates that a string is a genuine Google Meet URL (pattern: https://meet.google.com/xxx-yyyy-zzz)
 * and not a synthetic placeholder like abc-defg-hij or tla-xxx-yyy.
 */
export function isValidGoogleMeetUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  // Filter out dummy/broken synthetic prefixes
  if (trimmed.includes("abc-defg-hij") || trimmed.includes("/tla-")) {
    return false;
  }
  // Google Meet standard meeting URL format: 3-4-3 lowercase letters
  return /^https:\/\/meet\.google\.com\/[a-z0-9]{3,4}-[a-z0-9]{3,4}-[a-z0-9]{3,4}(\?.*)?$/i.test(
    trimmed
  );
}

/**
 * Returns the configured permanent chamber Google Meet room if valid.
 */
export function getFallbackMeetLink(): string | null {
  const perm =
    process.env.PERMANENT_GOOGLE_MEET_URL?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MEET_URL?.trim();

  if (perm && isValidGoogleMeetUrl(perm)) {
    return perm;
  }

  if (site?.googleMeetRoom && isValidGoogleMeetUrl(site.googleMeetRoom)) {
    return site.googleMeetRoom;
  }

  return null;
}

/**
 * Creates a genuine Google Meet room by scheduling an event on Adv. Shareen's Google Calendar.
 * Falls back to the permanent chamber room if API credentials are not yet configured.
 */
export async function createGoogleMeetLink(params: {
  summary: string;
  description: string;
  startISO: string; // e.g. "2026-10-04T14:00:00+05:30" or UTC ISO string
  endISO: string;
  attendeeEmail?: string | null;
}): Promise<MeetLinkResult> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim() || "primary";

  // If OAuth credentials are not configured, fall back gracefully to permanent room
  if (!clientId || !clientSecret || !refreshToken) {
    const fallback = getFallbackMeetLink();
    return {
      meetLink: fallback,
      eventId: null,
      source: fallback ? "permanent_chamber_room" : "none",
    };
  }

  try {
    // Step 1: Exchange the refresh token for a short-lived Google access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error("[Google Meet] Token refresh failed:", errBody);
      const fallback = getFallbackMeetLink();
      return {
        meetLink: fallback,
        eventId: null,
        source: fallback ? "permanent_chamber_room" : "none",
      };
    }

    const { access_token: accessToken } = await tokenRes.json();

    // Step 2: Create Google Calendar event with genuine Google Meet conference attached
    const requestId = `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const eventRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: params.summary,
          description: params.description,
          start: { dateTime: params.startISO, timeZone: "Asia/Kolkata" },
          end: { dateTime: params.endISO, timeZone: "Asia/Kolkata" },
          attendees: params.attendeeEmail ? [{ email: params.attendeeEmail }] : undefined,
          conferenceData: {
            createRequest: {
              requestId,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        }),
      }
    );

    if (!eventRes.ok) {
      const errBody = await eventRes.text();
      console.error("[Google Meet] Event creation failed:", errBody);
      const fallback = getFallbackMeetLink();
      return {
        meetLink: fallback,
        eventId: null,
        source: fallback ? "permanent_chamber_room" : "none",
      };
    }

    const event = await eventRes.json();
    const meetLink: string | null =
      event?.hangoutLink ||
      event?.conferenceData?.entryPoints?.find((ep: { entryPointType: string; uri: string }) => ep.entryPointType === "video")?.uri ||
      event?.conferenceData?.entryPoints?.[0]?.uri ||
      null;

    return {
      meetLink: meetLink || getFallbackMeetLink(),
      eventId: event?.id || null,
      source: meetLink ? "google_calendar_api" : getFallbackMeetLink() ? "permanent_chamber_room" : "none",
    };
  } catch (err) {
    console.error("[Google Meet] Unexpected error:", err);
    const fallback = getFallbackMeetLink();
    return {
      meetLink: fallback,
      eventId: null,
      source: fallback ? "permanent_chamber_room" : "none",
    };
  }
}
