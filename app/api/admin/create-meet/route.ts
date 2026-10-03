import { NextRequest, NextResponse } from "next/server";
import { getSessionRole } from "@/lib/admin-session";
import { createGoogleMeetLink, getFallbackMeetLink } from "@/lib/google-meet";
import { site } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const role = await getSessionRole();
  if (!role) {
    return NextResponse.json({ error: "Not authenticated as admin." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, service, sub_service, date, time, email, phone } = body;

    const bookingDate = date ? String(date).slice(0, 10) : "";
    const bookingTime = time ? String(time).trim() : "10:00";

    const [hh, mm] = bookingTime.split(":").map(Number);
    const startHour = isNaN(hh) ? 10 : hh;
    const startMin = isNaN(mm) ? 0 : mm;

    const [y, m, d] = bookingDate ? bookingDate.split("-").map(Number) : [2026, 10, 4];
    const start = new Date(y, (m || 10) - 1, d || 4, startHour, startMin, 0, 0);
    const end = new Date(start.getTime() + 45 * 60 * 1000);

    const matterLabel = sub_service || service || "Legal Consultation";

    const result = await createGoogleMeetLink({
      summary: `Legal Consultation: ${name || "Client"} (${matterLabel})`,
      description: `True Legal Advice Online Consultation with ${site.lawyerName}\nClient: ${name || "N/A"}\nPhone: ${phone || "N/A"}\nEmail: ${email || "N/A"}\nMatter: ${matterLabel}`,
      startISO: start.toISOString(),
      endISO: end.toISOString(),
      attendeeEmail: email || null,
    });

    if (result.meetLink) {
      return NextResponse.json({
        success: true,
        meetLink: result.meetLink,
        source: result.source,
        eventId: result.eventId,
      });
    }

    // If neither Google Calendar API nor permanent room is set
    return NextResponse.json({
      success: false,
      error: "Google Calendar API credentials are not configured in .env.local yet.",
      newMeetingUrl: "https://meet.google.com/new",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to generate meeting link";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
