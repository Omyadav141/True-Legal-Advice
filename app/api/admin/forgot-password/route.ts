import { NextRequest, NextResponse } from "next/server";
import { getStaffByEmail, updatePassword } from "@/lib/staff-store";

// In-memory OTP storage for password recovery
const recoveryCodes = new Map<string, { code: string; expires: number }>();

export async function POST(req: NextRequest) {
  try {
    const { action, email, code, newPassword } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const staff = getStaffByEmail(normalizedEmail);

    if (!staff) {
      // Return ambiguous message for security or helpful hint
      return NextResponse.json(
        { error: "No advocate or staff account found with this email address." },
        { status: 404 }
      );
    }

    // Action 1: Request Password Recovery Code
    if (action === "request") {
      // Generate a 6-digit OTP
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      // Valid for 15 minutes
      recoveryCodes.set(normalizedEmail, {
        code: generatedCode,
        expires: Date.now() + 15 * 60 * 1000,
      });

      console.log(`[PASSWORD RECOVERY] Recovery code for ${normalizedEmail}: ${generatedCode}`);

      return NextResponse.json({
        success: true,
        message: `Recovery code generated for ${staff.name}.`,
        // Also provide the code in development / demo response so Shareen can easily test without SMTP
        demoCode: generatedCode,
      });
    }

    // Action 2: Verify Code and Reset Password
    if (action === "reset") {
      if (!code || !newPassword) {
        return NextResponse.json(
          { error: "Verification code and new password are required." },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      const record = recoveryCodes.get(normalizedEmail);
      if (!record) {
        return NextResponse.json(
          { error: "No active recovery request found. Please request a new code." },
          { status: 400 }
        );
      }

      if (Date.now() > record.expires) {
        recoveryCodes.delete(normalizedEmail);
        return NextResponse.json(
          { error: "Recovery code has expired. Please request a new code." },
          { status: 400 }
        );
      }

      if (record.code !== code.trim()) {
        return NextResponse.json(
          { error: "Invalid verification code. Please check and try again." },
          { status: 400 }
        );
      }

      // Reset password
      const updateResult = updatePassword(normalizedEmail, newPassword.trim());
      if (!updateResult.success) {
        return NextResponse.json(
          { error: updateResult.error || "Failed to update password." },
          { status: 500 }
        );
      }

      recoveryCodes.delete(normalizedEmail);

      return NextResponse.json({
        success: true,
        message: "Password reset successfully! You can now sign in with your new password.",
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    console.error("Forgot password API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process recovery request." },
      { status: 500 }
    );
  }
}
