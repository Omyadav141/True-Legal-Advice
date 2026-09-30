import { NextRequest, NextResponse } from "next/server";
import { getSessionStaff, setStaffSessionCookie } from "@/lib/admin-session";
import { authenticateStaff, updatePassword, getStaffByEmail } from "@/lib/staff-store";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionStaff();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation do not match." },
        { status: 400 }
      );
    }

    // Verify current password
    const authCheck = authenticateStaff(session.email, currentPassword);
    if (!authCheck.success) {
      return NextResponse.json(
        { error: "Current password entered is incorrect." },
        { status: 400 }
      );
    }

    // Update password
    const updateResult = updatePassword(session.email, newPassword);
    if (!updateResult.success) {
      return NextResponse.json(
        { error: updateResult.error || "Failed to update password." },
        { status: 500 }
      );
    }

    // Refresh session cookie
    const updatedStaff = getStaffByEmail(session.email);
    if (updatedStaff) {
      await setStaffSessionCookie(updatedStaff);
    }

    return NextResponse.json({
      success: true,
      message: "Password changed successfully! Your new password is now active.",
    });
  } catch (err: any) {
    console.error("Change password error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to change password." },
      { status: 500 }
    );
  }
}
