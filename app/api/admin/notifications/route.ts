import { NextRequest, NextResponse } from "next/server";
import { getSessionRole } from "@/lib/admin-session";
import {
  getDismissedNotificationIds,
  addDismissedNotificationIds,
  resetDismissedNotifications,
} from "@/lib/notifications-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const role = await getSessionRole();
  if (!role) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const dismissedIds = await getDismissedNotificationIds();
  return NextResponse.json({ dismissedIds }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function POST(req: NextRequest) {
  const role = await getSessionRole();
  if (!role) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, ids } = body;

    if (action === "reset") {
      const dismissedIds = await resetDismissedNotifications();
      return NextResponse.json({ success: true, dismissedIds });
    }

    if (Array.isArray(ids) && ids.length > 0) {
      const dismissedIds = await addDismissedNotificationIds(ids);
      return NextResponse.json({ success: true, dismissedIds });
    }

    const dismissedIds = await getDismissedNotificationIds();
    return NextResponse.json({ success: true, dismissedIds });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update notifications." }, { status: 500 });
  }
}
