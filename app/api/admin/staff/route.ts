import { NextRequest, NextResponse } from "next/server";
import { getSessionStaff } from "@/lib/admin-session";
import {
  getAllStaff,
  addStaffMember,
  updateStaffPermissions,
  deleteStaffMember,
} from "@/lib/staff-store";

export async function GET() {
  try {
    const session = await getSessionStaff();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const allStaff = getAllStaff().map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
      title: s.title,
      permissions: s.permissions,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({
      staff: allStaff,
      currentStaff: session,
    });
  } catch (err: any) {
    console.error("Staff fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch staff members." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionStaff();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Only the Master Admin (Adv. Shareen Hussain) can add assistants." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, password, role, title, permissions } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and initial password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const result = addStaffMember({
      name,
      email,
      password,
      role: role || "assistant",
      title: title || "Legal Assistant",
      permissions,
    });

    if (!result.success || !result.staff) {
      return NextResponse.json({ error: result.error || "Failed to add assistant." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      staff: {
        id: result.staff.id,
        name: result.staff.name,
        email: result.staff.email,
        role: result.staff.role,
        title: result.staff.title,
        permissions: result.staff.permissions,
        createdAt: result.staff.createdAt,
      },
    });
  } catch (err: any) {
    console.error("Add staff error:", err);
    return NextResponse.json({ error: "Failed to create staff member." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionStaff();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Only the Master Admin can update permissions." },
        { status: 403 }
      );
    }

    const { id, permissions } = await req.json();
    if (!id || !permissions) {
      return NextResponse.json({ error: "Staff id and permissions are required." }, { status: 400 });
    }

    const result = updateStaffPermissions(id, permissions);
    if (!result.success || !result.staff) {
      return NextResponse.json({ error: result.error || "Failed to update permissions." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      staff: {
        id: result.staff.id,
        name: result.staff.name,
        email: result.staff.email,
        role: result.staff.role,
        title: result.staff.title,
        permissions: result.staff.permissions,
      },
    });
  } catch (err: any) {
    console.error("Update staff permissions error:", err);
    return NextResponse.json({ error: "Failed to update permissions." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionStaff();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Only the Master Admin can remove assistants." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Staff id is required." }, { status: 400 });
    }

    const result = deleteStaffMember(id);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to remove staff." }, { status: 400 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("Delete staff error:", err);
    return NextResponse.json({ error: "Failed to remove staff member." }, { status: 500 });
  }
}
