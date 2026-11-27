"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { StoreHeader } from "@/components/store-ui";
import { formatPrice } from "@/lib/catalog";
import {
  createDatabaseOrder,
  setCart,
  useCart,
  useOrders,
  useProducts,
} from "@/lib/store";
import { useAuth } from "@/lib/auth";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, profile, loading, configured } = useAuth();
  const [cart] = useCart();
  const [products] = useProducts();
  const [orders, saveOrders] = useOrders();
  const [payment, setPayment] = useState<"COD" | "Online">("COD");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const rows = useMemo(
    () =>
      cart.flatMap((item) => {
        const product = products.find((record) => record.id === item.productId);
        return product ? [{ ...item, product }] : [];
      }),
    [cart, products],
  );
  const total = rows.reduce(
    (sum, row) => sum + row.product.price * row.quantity,
    0,
  );
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      router.push("/account?next=/checkout");
      return;
    }
    if (!rows.length) {
      setError("Your cart is empty.");
      return;
    }
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    if (!name || phone.length < 10) {
      setError("Please enter your name and a valid phone number.");
      return;
    }
    setPlacing(true);
    const id = `FXX-${String(1049 + orders.length).padStart(4, "0")}`;
    const order = {
      id,
      customer: name,
      phone,
      address: `${data.get("address")}, ${data.get("city")} - ${data.get("pincode")}`,
      payment,
      status: "New" as const,
      items: cart,
      total,
      createdAt: new Date().toLocaleString("en-IN"),
      userId: user.id,
    };
    try {
      await createDatabaseOrder(order);
      await saveOrders([order, ...orders]);
      setCart([]);
      localStorage.setItem("uf-last-order", JSON.stringify(order));
      router.push("/order-success");
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Could not place order.",
      );
    } finally {
      setPlacing(false);
    }
  };
  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#f7f3eb]">
      <StoreHeader />
      <section className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-7 flex items-center justify-between gap-4 sm:mb-9">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#e66735]">
              Secure checkout
            </p>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-[-.06em] sm:text-4xl">
              Complete order.
            </h1>
          </div>
          <Link
            href="/cart"
            className="shrink-0 text-[10px] font-black uppercase tracking-[.12em] text-white/55"
          >
            ← Cart
          </Link>
        </div>
        {!configured ? (
          <div className="border border-white/10 p-8 text-center">
            <p className="font-bold">
              Secure checkout will open once FXX connects its database.
            </p>
          </div>
        ) : !loading && !user ? (
          <div className="border border-[#e66735] bg-[#e66735]/10 p-8 text-center">
            <p className="text-lg font-black">Login required to order.</p>
            <p className="mt-2 text-sm text-white/60">
              Create a customer account or log in before completing checkout.
            </p>
            <Link
              href="/account?next=/checkout"
              className="mt-6 inline-block min-h-11 bg-[#e66735] px-5 py-3 text-[10px] font-black uppercase tracking-[.14em]"
            >
              Login / create account
            </Link>
          </div>
        ) : !rows.length ? (
          <div className="border border-white/10 p-10 text-center">
            <p>Your cart is empty.</p>
            <Link
              className="mt-5 inline-block min-h-11 bg-[#e66735] px-5 py-3 text-xs font-black uppercase"
              href="/shop"
            >
              Shop now
            </Link>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8"
          >
            <div className="space-y-5 sm:space-y-7">
              <section className="border border-white/10 p-5 sm:p-7">
                <h2 className="text-lg font-black">Contact details</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Full name"
                    name="name"
                    placeholder="Your name"
                    defaultValue={profile?.full_name || ""}
                  />
                  <Input
                    label="Phone number"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="10-digit mobile number"
                    defaultValue={profile?.phone || ""}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Email (optional)"
                      name="email"
                      type="email"
                      placeholder="you@email.com"
                      defaultValue={profile?.email || user?.email || ""}
                    />
                  </div>
                </div>
              </section>
              <section className="border border-white/10 p-5 sm:p-7">
                <h2 className="text-lg font-black">Delivery address</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Input
                      label="Complete address"
                      name="address"
                      placeholder="House / street / area"
                      defaultValue={profile?.default_address || ""}
                    />
                  </div>
                  <Input label="City" name="city" placeholder="Your city" />
                  <Input
                    label="PIN code"
                    name="pincode"
                    inputMode="numeric"
                    placeholder="6-digit PIN"
                  />
                </div>
              </section>
              <section className="border border-white/10 p-5 sm:p-7">
                <h2 className="text-lg font-black">Payment method</h2>
                <label
                  className={`mt-5 flex min-h-16 cursor-pointer items-start gap-3 border p-4 ${payment === "COD" ? "border-[#e66735]" : "border-white/15"}`}
                >
                  <input
                    checked={payment === "COD"}
                    onChange={() => setPayment("COD")}
                    type="radio"
                    name="payment"
                  />
                  <span>
                    <b className="text-sm">Cash on delivery</b>
                    <small className="mt-1 block text-xs text-white/50">
                      Pay when your order arrives.
                    </small>
                  </span>
                </label>
                <label
                  className={`mt-3 flex min-h-16 cursor-pointer items-start gap-3 border p-4 ${payment === "Online" ? "border-[#e66735]" : "border-white/15"}`}
                >
                  <input
                    checked={payment === "Online"}
                    onChange={() => setPayment("Online")}
                    type="radio"
                    name="payment"
                  />
                  <span>
                    <b className="text-sm">Pay online</b>
                    <small className="mt-1 block text-xs text-white/50">
                      UPI, cards and wallets via Razorpay after keys are
                      connected.
                    </small>
                  </span>
                </label>
              </section>
              {error && (
                <p className="text-sm font-bold text-[#ff9367]">{error}</p>
              )}
              <button
                disabled={placing}
                className="safe-bottom sticky bottom-0 z-20 w-full bg-[#e66735] py-4 text-[11px] font-black uppercase tracking-[.15em] shadow-[0_-12px_24px_rgba(11,11,11,.85)] disabled:opacity-50 lg:static lg:shadow-none"
              >
                {placing
                  ? "Placing order…"
                  : `Place ${payment === "COD" ? "COD" : "online"} order · ${formatPrice(total)}`}
              </button>
            </div>
            <aside className="h-fit bg-[#f2ede3] p-5 text-[#181614] sm:p-6">
              <h2 className="font-black">Your order</h2>
              <div className="mt-5 space-y-4 border-y border-black/10 py-5">
                {rows.map((row) => (
                  <div
                    key={`${row.productId}-${row.size}`}
                    className="flex gap-3"
                  >
                    <img
                      src={row.product.image}
                      alt=""
                      className="h-14 w-12 object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold">{row.product.name}</p>
                      <p className="mt-1 text-[10px] text-black/50">
                        Size {row.size} × {row.quantity}
                      </p>
                    </div>
                    <p className="text-xs font-bold">
                      {formatPrice(row.product.price * row.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-between font-black">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[.1em] text-black/45">
                Free delivery above ₹1,999
              </p>
            </aside>
          </form>
        )}
      </section>
    </main>
  );
}
function Input({
  label,
  name,
  placeholder,
  type = "text",
  defaultValue = "",
  inputMode,
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  defaultValue?: string;
  inputMode?: "numeric";
}) {
  return (
    <label className="block text-[10px] font-black uppercase tracking-[.12em] text-white/55">
      {label}
      <input
        required={name !== "email"}
        type={type}
        inputMode={inputMode}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 min-h-12 w-full border border-white/20 bg-transparent p-3 text-sm font-normal normal-case tracking-normal text-white outline-none placeholder:text-white/25 focus:border-[#e66735]"
      />
    </label>
  );
}
