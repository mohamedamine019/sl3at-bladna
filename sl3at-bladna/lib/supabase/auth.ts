import { createClient } from "./server";
import type { UserProfile, UserRole } from "@/lib/types";
import { User } from "@supabase/supabase-js";

/**
 * Get current authenticated user on the server by cryptographically verifying the JWT token.
 * Uses `supabase.auth.getUser()` which re-validates the token with Supabase Auth server.
 */
export async function getAuthUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

/**
 * Get current user profile and role verified against DB profiles table.
 * Does not trust unverified client-side metadata for privilege elevation.
 */
export async function getCurrentProfile(): Promise<{
  user: User;
  profile: UserProfile | null;
  role: UserRole;
} | null> {
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Strict role fallback: DB table profile role > fallback 'buyer'
  const role: UserRole = (profile?.role as UserRole) || "buyer";

  return {
    user,
    profile: profile
      ? {
          id: profile.id,
          role: profile.role as UserRole,
          fullName: profile.full_name,
          phone: profile.phone,
          wilayaId: profile.wilaya_id,
          language: profile.language,
          createdAt: profile.created_at,
        }
      : null,
    role,
  };
}
