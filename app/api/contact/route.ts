import { NextRequest, NextResponse } from "next/server";
import { saveLocalContact, ContactInquiry } from "@/lib/contacts-store";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, service, mode, message } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and Phone number are required." },
        { status: 400 }
      );
    }

    const record: ContactInquiry = {
      id: "cnt_" + Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : null,
      service: service || "General Legal Inquiry",
      mode: mode || "Office Visit (Trisharan Square, Nagpur)",
      message: message ? message.trim() : null,
      status: "new",
      created_at: new Date().toISOString(),
    };

    // Save locally
    saveLocalContact(record);

    // Optional Supabase insertion if table exists
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
        const { error: sbErr } = await supabase.from("contact_inquiries").insert({
          id: record.id,
          name: record.name,
          phone: record.phone,
          email: record.email,
          service: record.service,
          mode: record.mode,
          message: record.message,
          status: record.status,
          created_at: record.created_at,
        });
        if (sbErr) {
          console.warn("Supabase contact inquiry insert notice:", sbErr.message);
        }
      }
    } catch (err) {
      console.warn("Supabase connection issue for contact inquiry:", err);
    }

    return NextResponse.json({ success: true, contact: record });
  } catch (err) {
    console.error("Error submitting contact inquiry:", err);
    return NextResponse.json(
      { error: "Failed to process inquiry." },
      { status: 500 }
    );
  }
}
