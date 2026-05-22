import { createClient } from "@supabase/supabase-js";

// Browser-side Supabase client using the anon key.
// Used by dashboard components for Realtime subscriptions.
// Respects Row-Level Security policies.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase client will not work."
  );
}

const supabaseClient = createClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
);

export default supabaseClient;
