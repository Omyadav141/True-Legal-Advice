// ============================================================
// Auto-generates a Google Meet link for online consultations by
// creating a Google Calendar event via the Calendar API.
//
// SETUP NEEDED (one-time, done by you in Google Cloud Console):
// 1. Create a project at console.cloud.google.com
// 2. Enable the "Google Calendar API" for that project
// 3. Create OAuth 2.0 credentials (OAuth client ID, type "Web application")
// 4. Add these to .env.local:
//      GOOGLE_CLIENT_ID=...
//      GOOGLE_CLIENT_SECRET=...
//      GOOGLE_REFRESH_TOKEN=...      (see below to obtain this)
//      GOOGLE_CALENDAR_ID=primary    (or a specific calendar's ID)
// 5. To get a refresh token: use Google's OAuth Playground
//    (developers.google.com/oauthplayground) — set your own client ID/secret
//    in its settings gear, authorize scope
//    "https://www.googleapis.com/auth/calendar.events", then exchange the
//    authorization code for tokens. Copy the refresh token shown there.
//
// Until these are set, bookings still work fine — the meet link is
// simply left blank and marked "pending" so the lawyer can add it
// manually from the admin dashboard if preferred.
// ============================================================

type MeetLinkResult = { meetLink: string | null; eventId: string | null };

export async function createGoogleMeetLink(params: {
  summary: string;
  description: string;
  startISO: string; // e.g. "2026-07-10T14:00:00+05:30"
  endISO: string;
  attendeeEmail?: string | null;
}): Promise<MeetLinkResult> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn("Google Calendar credentials not set — skipping Meet link generation.");
    return { meetLink: null, eventId: null };
  }

  try {
    // Step 1: exchange the refresh token for a short-lived access token
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
      console.error("Google token refresh failed:", await tokenRes.text());
      return { meetLink: null, eventId: null };
    }

    const { access_token: accessToken } = await tokenRes.json();

    // Step 2: create a calendar event with a Meet conference attached
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
          start: { dateTime: params.startISO },
          end: { dateTime: params.endISO },
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
      console.error("Google Calendar event creation failed:", await eventRes.text());
      return { meetLink: null, eventId: null };
    }

    const event = await eventRes.json();
    const meetLink: string | null = event?.hangoutLink || event?.conferenceData?.entryPoints?.[0]?.uri || null;

    return { meetLink, eventId: event?.id || null };
  } catch (err) {
    console.error("Failed to generate Google Meet link:", err);
    return { meetLink: null, eventId: null };
  }
}
