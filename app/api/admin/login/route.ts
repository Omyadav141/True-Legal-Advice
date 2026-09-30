import { NextRequest, NextResponse } from "next/server";
import { verifyStaffCredentials, setStaffSessionCookie } from "@/lib/admin-session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const staff = verifyStaffCredentials(email, password);

    if (!staff) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await setStaffSessionCookie(staff);
    return NextResponse.json({
      success: true,
      role: staff.role,
      name: staff.name,
      title: staff.title,
      permissions: staff.permissions,
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
