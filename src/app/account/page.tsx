"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signIn,
  signOut,
  signUp,
  updateProfile,
  useAuth,
  type Profile,
} from "@/lib/auth";
import { StoreFooter, StoreHeader } from "@/components/store-ui";
import { formatPrice } from "@/lib/catalog";
import { useOrders } from "@/lib/store";

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0b0b0b] text-white">
          <StoreHeader />
          <p className="p-10">Loading account…</p>
        </main>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
function AccountContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, profile, loading, configured } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(
    params.get("mode") === "signup" ? "signup" : "login",
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const next = params.get("next") || "/shop";
  useEffect(() => {
    if (!loading && user && profile?.role === "admin") router.replace("/admin");
  }, [loading, user, profile, router]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      if (mode === "login") {
        await signIn(String(data.get("email")), String(data.get("password")));
        router.replace(next);
      } else {
        await signUp(
          String(data.get("name")),
          String(data.get("email")),
          String(data.get("password")),
        );
        setMessage("Account created. You can now log in.");
        setMode("login");
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      <StoreHeader />
      {!configured ? (
        <div className="mx-auto max-w-xl px-5 py-24">
          <h1 className="text-3xl font-black">Account setup is pending.</h1>
          <p className="mt-3 text-white/60">
            FXX needs its Supabase environment variables before customer
            accounts can work.
          </p>
        </div>
      ) : loading ? (
        <p className="p-10">Loading account…</p>
      ) : user && profile?.role === "admin" ? (
        <section className="mx-auto max-w-xl px-5 py-24 text-center">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#e66735]">Admin-only session</p>
          <h1 className="mt-3 text-3xl font-black">Opening admin dashboard…</h1>
          <p className="mt-3 text-sm text-white/60">Admin accounts do not use the customer account area.</p>
        </section>
      ) : user && profile ? (
        <CustomerDashboard profile={profile} />
      ) : (
        <section className="mx-auto grid max-w-5xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:py-24">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#e66735]">
              FXX members
            </p>
            <h1 className="mt-3 text-5xl font-black uppercase leading-[.85] tracking-[-.07em]">
              Your drop
              <br />
              starts here.
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-6 text-white/60">
              Create an account to place orders, save delivery information and
              follow your delivery status.
            </p>
          </div>
          <div className="border border-white/15 bg-white/5 p-6 sm:p-8">
            <div className="flex gap-5 border-b border-white/10">
              <button
                onClick={() => setMode("login")}
                className={`pb-3 text-xs font-black uppercase tracking-[.12em] ${mode === "login" ? "border-b-2 border-[#e66735]" : "text-white/45"}`}
              >
                Login
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`pb-3 text-xs font-black uppercase tracking-[.12em] ${mode === "signup" ? "border-b-2 border-[#e66735]" : "text-white/45"}`}
              >
                Create account
              </button>
            </div>
            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <Input label="Full name" name="name" type="text" />
              )}
              <Input label="Email address" name="email" type="email" />
              <Input label="Password" name="password" type="password" />
              <button
                disabled={busy}
                className="w-full bg-[#e66735] py-4 text-[10px] font-black uppercase tracking-[.14em] disabled:opacity-50"
              >
                {busy
                  ? "Please wait…"
                  : mode === "login"
                    ? "Login to FXX"
                    : "Create FXX account"}
              </button>
            </form>
            {message && (
              <p className="mt-4 text-sm leading-6 text-[#ff9367]">{message}</p>
            )}
          </div>
        </section>
      )}
      <StoreFooter />
    </main>
  );
}
function CustomerDashboard({ profile }: { profile: Profile }) {
  const [orders] = useOrders();
  const [form, setForm] = useState({
    name: profile.full_name || "",
    phone: profile.phone || "",
    address: profile.default_address || "",
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateProfile({
        full_name: form.name,
        phone: form.phone,
        default_address: form.address,
      });
      setMessage("Details saved successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save details.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
      <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#e66735]">
            Customer account
          </p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-[-.06em] sm:text-5xl">
            Hi, {profile.full_name || "FXX member"}.
          </h1>
          <p className="mt-3 text-sm text-white/55">{profile.email}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/shop"
            className="border border-white/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em]"
          >
            Shop
          </Link>
          <button
            onClick={() => void signOut()}
            className="border border-white/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em]"
          >
            Sign out
          </button>
        </div>
      </div>
      <div className="mt-9 grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
        <form
          onSubmit={save}
          className="h-fit border border-white/10 bg-white/5 p-6"
        >
          <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#e66735]">
            Saved customer details
          </p>
          <h2 className="mt-2 text-xl font-black">Delivery profile</h2>
          <p className="mt-2 text-sm leading-6 text-white/55">
            Save this once. At checkout your delivery details can be filled
            quickly.
          </p>
          <label className="mt-6 block text-[10px] font-black uppercase tracking-[.12em] text-white/55">
            Full name
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              className="mt-2 w-full border border-white/20 bg-transparent p-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#e66735]"
            />
          </label>
          <label className="mt-4 block text-[10px] font-black uppercase tracking-[.12em] text-white/55">
            Phone number
            <input
              required
              value={form.phone}
              onChange={(event) =>
                setForm({ ...form, phone: event.target.value })
              }
              className="mt-2 w-full border border-white/20 bg-transparent p-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#e66735]"
            />
          </label>
          <label className="mt-4 block text-[10px] font-black uppercase tracking-[.12em] text-white/55">
            Default delivery address
            <textarea
              required
              value={form.address}
              onChange={(event) =>
                setForm({ ...form, address: event.target.value })
              }
              className="mt-2 h-24 w-full border border-white/20 bg-transparent p-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#e66735]"
            />
          </label>
          <button
            disabled={saving}
            className="mt-5 w-full bg-[#e66735] py-3 text-[10px] font-black uppercase tracking-[.13em] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save details"}
          </button>
          {message && <p className="mt-3 text-sm text-[#ff9367]">{message}</p>}
        </form>
        <div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#e66735]">
                Purchases
              </p>
              <h2 className="mt-2 text-2xl font-black">Your orders</h2>
            </div>
            <span className="text-sm text-white/50">{orders.length} total</span>
          </div>
          {orders.length === 0 ? (
            <div className="mt-5 border border-white/10 p-10 text-center">
              <p className="font-bold">No orders yet.</p>
              <p className="mt-2 text-sm text-white/55">
                Your FXX purchases and delivery status will show here.
              </p>
              <Link
                href="/shop"
                className="mt-5 inline-block bg-[#e66735] px-4 py-3 text-[10px] font-black uppercase tracking-[.12em]"
              >
                Explore products
              </Link>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-black">{order.id}</p>
                      <p className="mt-1 text-xs text-white/50">
                        Placed {order.createdAt}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#e66735]/20 px-3 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[#ff9367]">
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-4 border-y border-white/10 py-3 text-sm text-white/65">
                    {order.items.map((item, index) => (
                      <p key={`${item.productId}-${item.size}`}>
                        Product #{item.productId} · Size {item.size} · Qty{" "}
                        {item.quantity}
                        {index < order.items.length - 1 ? "" : ""}
                      </p>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-white/50">{order.payment}</span>
                    <b>{formatPrice(order.total)}</b>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
function Input({
  label,
  name,
  type,
}: {
  label: string;
  name: string;
  type: string;
}) {
  return (
    <label className="block text-[10px] font-black uppercase tracking-[.12em] text-white/55">
      {label}
      <input
        required
        minLength={type === "password" ? 6 : undefined}
        type={type}
        name={name}
        className="mt-2 w-full border border-white/20 bg-transparent p-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#e66735]"
      />
    </label>
  );
}
