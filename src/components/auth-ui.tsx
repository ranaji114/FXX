"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  hasAdminAccess,
  hasAdminBrowserSession,
  signOut,
  useAuth,
} from "@/lib/auth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, profile, loading, configured } = useAuth();
  const permitted = hasAdminAccess(user, profile);
  const browserSession = hasAdminBrowserSession();
  useEffect(() => {
    if (!loading && permitted && !browserSession) {
      void signOut().finally(() => router.replace("/admin/login"));
      return;
    }
    if (!loading && !permitted) router.replace("/admin/login");
  }, [loading, permitted, browserSession, router]);
  useEffect(() => {
    if (!permitted || !browserSession) return;
    // Do not leave an admin token behind when the dashboard is closed or refreshed.
    const endAdminSession = () => { void signOut(); };
    window.addEventListener("pagehide", endAdminSession);
    return () => window.removeEventListener("pagehide", endAdminSession);
  }, [permitted, browserSession]);
  if (!configured)
    return (
      <AccessNotice
        title="Database setup required"
        text="Connect Supabase before the admin dashboard can be protected."
      />
    );
  if (loading)
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f2ec] text-sm font-bold">
        Checking admin access…
      </main>
    );
  if (!permitted || !browserSession)
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f2ec] text-sm font-bold">
        Opening secure admin login…
      </main>
    );
  return <>{children}</>;
}

export function AccessNotice({ title, text }: { title: string; text: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0b0b] p-5 text-white">
      <div className="max-w-md border border-white/15 p-7">
        <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#e66735]">
          FXX account
        </p>
        <h1 className="mt-3 text-3xl font-black">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-white/60">{text}</p>
      </div>
    </main>
  );
}
