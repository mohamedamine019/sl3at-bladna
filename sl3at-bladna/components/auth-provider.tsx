"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile, UserRole } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  role: UserRole;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  role: "buyer",
  signOut: async () => {},
  refreshProfile: async () => {},
  setDemoRole: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoRole, setDemoRoleState] = useState<UserRole>("buyer");

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile({
          id: data.id,
          role: data.role as UserRole,
          fullName: data.full_name,
          phone: data.phone,
          wilayaId: data.wilaya_id,
          language: data.language,
          createdAt: data.created_at,
        });
      }
    } catch {
      // Fallback if profiles table is empty or error
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          await fetchProfile(data.session.user.id);
        }
      } catch {
        // Ignored
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const setDemoRole = (r: UserRole) => {
    setDemoRoleState(r);
  };

  // SECURITY: Verified database profile role takes strict precedence when user is logged in
  const effectiveRole: UserRole = user
    ? profile?.role || "buyer"
    : demoRole;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        role: effectiveRole,
        signOut,
        refreshProfile,
        setDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
