"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { isSupabaseEnabled, supabase } from "@/lib/supabase";

export type Profile = { id: string; full_name: string | null; email: string | null; phone: string | null; default_address: string | null; role: "customer" | "admin" };
export const hasAdminAccess = (user: User | null, profile: Profile | null) => Boolean(user && profile?.role === "admin");

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(() => Boolean(supabase));
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const loadProfile = async (nextUser: User | null) => {
      setUser(nextUser);
      if (!nextUser) { setProfile(null); setLoading(false); return; }
      // Select all fields so the customer account still loads safely while a database migration is being applied.
      const { data } = await client.from("profiles").select("*").eq("id", nextUser.id).single();
      setProfile(data as Profile | null); setLoading(false);
    };
    client.auth.getUser().then(({ data }) => loadProfile(data.user));
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => { void loadProfile(session?.user ?? null); });
    return () => listener.subscription.unsubscribe();
  }, []);
  return { user, profile, loading, configured: isSupabaseEnabled };
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error("Supabase is not configured yet.");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(fullName: string, email: string, password: string) {
  if (!supabase) throw new Error("Supabase is not configured yet.");
  const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
  if (error) throw error;
}

export async function signOut() { if (supabase) await supabase.auth.signOut(); }

export async function updateProfile(profile: Pick<Profile, "full_name" | "phone" | "default_address">) {
  if (!supabase) throw new Error("Supabase is not configured yet.");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Please login first.");
  const { error } = await supabase.from("profiles").update(profile).eq("id", auth.user.id);
  if (error) throw error;
}
