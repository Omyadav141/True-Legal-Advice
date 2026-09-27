import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client using the service role key.
// This bypasses Row Level Security, so it must ONLY be used in
// server-side code (API routes), never sent to the browser.
export function supabaseServer() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. Add them in .env.local"
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
