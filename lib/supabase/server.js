import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client using the service role key.
// Used by Inngest workers and API routes for broadcasting
// and bypassing Row-Level Security when needed.
//
// NEVER import this file from client components.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — Supabase server client will not work."
  );
}

const supabaseServer = createClient(
  supabaseUrl || "",
  supabaseServiceRoleKey || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabaseServer;
