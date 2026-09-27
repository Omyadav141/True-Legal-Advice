import { NextRequest, NextResponse } from "next/server";
import { verifyStaffCredentials, setStaffSessionCookie } from "@/lib/admin-session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const role = verifyStaffCredentials(email, password);

    if (!role) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await setStaffSessionCookie(role);
    return NextResponse.json({ success: true, role });
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
