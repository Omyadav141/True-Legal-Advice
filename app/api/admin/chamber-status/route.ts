import { NextRequest, NextResponse } from "next/server";
import { getChamberStatus, saveChamberStatus } from "@/lib/chamber-status";

export async function GET() {
  const status = getChamberStatus();
  return NextResponse.json(status);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = saveChamberStatus({
      isOfficeOpen: body.isOfficeOpen,
      isOnlineOpen: body.isOnlineOpen,
      status: body.status,
      channelsAffected: body.channelsAffected,
      awayReason: body.awayReason,
      returnEstimate: body.returnEstimate,
      returnTime: body.returnTime,
      notice: body.notice,
      onLeave: body.onLeave,
      leaveStartDate: body.leaveStartDate,
      leaveEndDate: body.leaveEndDate,
      leaveReason: body.leaveReason,
      leaveChannelsAffected: body.leaveChannelsAffected,
    });
    return NextResponse.json({ success: true, status: updated });
  } catch (err) {
    console.error("Error updating chamber status:", err);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}
