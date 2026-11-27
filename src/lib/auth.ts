"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { isSupabaseEnabled, supabase } from "@/lib/supabase";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  default_address: string | null;
  role: "customer" | "admin";
};
const adminEmail = "forfunuse654@gmail.com";
export const hasAdminAccess = (user: User | null, profile: Profile | null) =>
  Boolean(
    user &&
    user.email?.toLowerCase() === adminEmail &&
    profile?.role === "admin",
  );

const adminSessionKey = "fxx-admin-session";
export const startAdminBrowserSession = () => {
  if (typeof window !== "undefined")
    window.sessionStorage.setItem(adminSessionKey, "active");
};
export const hasAdminBrowserSession = () =>
  typeof window !== "undefined" &&
  window.sessionStorage.getItem(adminSessionKey) === "active";
export const clearAdminBrowserSession = () => {
  if (typeof window !== "undefined")
    window.sessionStorage.removeItem(adminSessionKey);
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(() => Boolean(supabase));
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let request = 0;
    const loadProfile = async (nextUser: User | null) => {
      const requestId = ++request;
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const profileRequest = (async () => {
        try {
          const { data } = await client
            .from("profiles")
            .select("*")
            .eq("id", nextUser.id)
            .single();
          return data as Profile | null;
        } catch {
          return null;
        }
      })();
      const timeout = new Promise<null>((resolve) =>
        window.setTimeout(() => resolve(null), 8000),
      );
      const data = await Promise.race([profileRequest, timeout]);
      if (requestId !== request) return;
      setProfile(data);
      setLoading(false);
    };
    client.auth
      .getUser()
      .then(({ data }) => void loadProfile(data.user))
      .catch(() => {
        setLoading(false);
      });
    const { data: listener } = client.auth.onAuthStateChange(
      (_event, session) => {
        void loadProfile(session?.user ?? null);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);
  return { user, profile, loading, configured: isSupabaseEnabled };
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error("Supabase is not configured yet.");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(
  fullName: string,
  email: string,
  password: string,
) {
  if (!supabase) throw new Error("Supabase is not configured yet.");
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
}

export async function signOut() {
  // Local sign-out clears this device immediately; a network delay must not keep the customer logged in.
  clearAdminBrowserSession();
  if (supabase) await supabase.auth.signOut({ scope: "local" });
}

export async function updateProfile(
  profile: Pick<Profile, "full_name" | "phone" | "default_address">,
) {
  if (!supabase) throw new Error("Supabase is not configured yet.");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Please login first.");
  const { error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", auth.user.id);
  if (error) {
    if (error.code === "42703")
      throw new Error(
        "Customer profile fields are not installed in Supabase yet. Run the required database update once.",
      );
    throw error;
  }
}
