"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const { user, profile, loading, configured } = useAuth();
  useEffect(() => { if (!loading && (!user || profile?.role !== "admin")) router.replace("/account?next=/admin"); }, [loading, user, profile, router]);
  if (!configured) return <AccessNotice title="Database setup required" text="Connect Supabase before the admin dashboard can be protected."/>;
  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f5f2ec] text-sm font-bold">Checking admin access…</main>;
  if (!user || profile?.role !== "admin") return <main className="grid min-h-screen place-items-center bg-[#f5f2ec] text-sm font-bold">Redirecting to login…</main>;
  return <>{children}</>;
}

export function AccessNotice({ title, text }: { title: string; text: string }) { return <main className="grid min-h-screen place-items-center bg-[#0b0b0b] p-5 text-white"><div className="max-w-md border border-white/15 p-7"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#e66735]">FXX account</p><h1 className="mt-3 text-3xl font-black">{title}</h1><p className="mt-4 text-sm leading-6 text-white/60">{text}</p></div></main>; }
