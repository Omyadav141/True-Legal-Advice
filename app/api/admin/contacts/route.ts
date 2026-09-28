import { NextRequest, NextResponse } from "next/server";
import { getSessionRole } from "@/lib/admin-session";
import { getLocalContacts, updateLocalContactStatus, ContactInquiry } from "@/lib/contacts-store";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const role = await getSessionRole();
  if (!role) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const localContacts = getLocalContacts();
  let supabaseContacts: ContactInquiry[] = [];

  try {
    const hasSupabase =
      Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      Boolean(
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

    if (hasSupabase) {
      const supabase = supabaseServer();
      const { data, error } = await supabase
        .from("contact_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        supabaseContacts = data as ContactInquiry[];
      }
    }
  } catch (err) {
    console.warn("Supabase contacts fetch notice:", err);
  }

  const map = new Map<string, ContactInquiry>();
  for (const c of [...supabaseContacts, ...localContacts]) {
    if (!map.has(c.id)) {
      map.set(c.id, c);
    }
  }

  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json({ contacts: merged, role });
}

export async function PATCH(req: NextRequest) {
  const role = await getSessionRole();
  if (!role) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required." }, { status: 400 });
    }

    updateLocalContactStatus(id, status);

    try {
      const supabase = supabaseServer();
      await supabase.from("contact_inquiries").update({ status }).eq("id", id);
    } catch {}

    return NextResponse.json({ success: true, id, status });
  } catch (err) {
    console.error("Error updating contact status:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
