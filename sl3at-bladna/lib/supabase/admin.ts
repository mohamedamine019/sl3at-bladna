import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-Only Admin Supabase Client using SUPABASE_SERVICE_ROLE_KEY.
 * WARNING: NEVER import or use this client in browser components or public APIs.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase admin service role key in environment variables");
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
