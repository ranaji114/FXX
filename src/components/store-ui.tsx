"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice, type Product } from "@/lib/catalog";
import { Bag, Menu, Plus, X } from "@/components/icons";
import { useCart, useStoreSettings } from "@/lib/store";
import { useAuth } from "@/lib/auth";

function BrandWord({
  brand,
  accent,
  logoUrl,
  className = "",
}: {
  brand: string;
  accent: string;
  logoUrl: string;
  className?: string;
}) {
  return logoUrl ? (
    <img
      src={logoUrl}
      alt={brand}
      className={`max-h-9 max-w-28 object-contain ${className}`}
    />
  ) : (
    <span className={`font-black uppercase tracking-[-.09em] ${className}`}>
      <b style={{ color: accent }}>{brand.slice(0, 1)}</b>
      {brand.slice(1)}
    </span>
  );
}

export function StoreHeader() {
  const [cart] = useCart();
  const [settings] = useStoreSettings();
  const { user } = useAuth();
  const [menu, setMenu] = useState(false);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const brand = settings.brandName || "FXX";
  return (
    <>
      <div className="announcement">
        Free delivery above ₹1,999 <span>•</span> Cash on delivery available
      </div>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0b0b]/95 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button onClick={() => setMenu(true)} className="lg:hidden">
            <Menu />
          </button>
          <Link href="/" className="text-2xl">
            <BrandWord
              brand={brand}
              accent={settings.accent}
              logoUrl={settings.logoUrl}
            />
          </Link>
          <div className="ml-auto flex items-center gap-2 lg:hidden">
            {user ? (
              <Link
                href="/account"
                className="min-h-10 border border-white/25 px-2.5 py-3 text-[9px] font-black uppercase tracking-[.1em] text-white"
              >
                Account
              </Link>
            ) : (
              <>
                <Link
                  href="/account?mode=login"
                  className="min-h-10 px-1.5 py-3 text-[9px] font-black uppercase tracking-[.1em] text-white"
                >
                  Login
                </Link>
                <Link
                  href="/account?mode=signup"
                  className="min-h-10 border border-white/35 px-2.5 py-3 text-[9px] font-black uppercase tracking-[.1em] text-white"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
          <nav className="hidden items-center gap-5 text-[10px] font-black uppercase tracking-[.13em] text-white/65 lg:flex">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop all</Link>
            <Link href="/shop?category=Acid%20Wash">Acid wash</Link>
            <Link href="/shop?category=Hoodies">Hoodies</Link>
            {user ? (
              <Link href="/account" className="text-white">
                My account
              </Link>
            ) : (
              <>
                <Link href="/account?mode=login">Login</Link>
                <Link
                  href="/account?mode=signup"
                  className="border border-white/30 px-3 py-2 text-white"
                >
                  Sign up
                </Link>
              </>
            )}
            <Link href="/admin/login" className="text-[#ff9367]">
              Admin panel
            </Link>
          </nav>
          <Link
            href="/cart"
            className="flex items-center gap-2 text-sm font-bold"
          >
            <Bag size={20} />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span
                className="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] text-white"
                style={{ background: settings.accent }}
              >
                {count}
              </span>
            )}
          </Link>
        </div>
      </header>
      {menu && (
        <div className="fixed inset-0 z-50 bg-[#0b0b0b] p-6 text-white">
          <div className="flex items-center justify-between">
            <p className="text-3xl">
              <BrandWord
                brand={brand}
                accent={settings.accent}
                logoUrl={settings.logoUrl}
              />
            </p>
            <button onClick={() => setMenu(false)}>
              <X size={26} />
            </button>
          </div>
          <nav className="mt-20 flex flex-col gap-7 text-4xl font-black uppercase tracking-[-.06em]">
            <Link onClick={() => setMenu(false)} href="/">
              Home
            </Link>
            <Link onClick={() => setMenu(false)} href="/shop">
              Shop all
            </Link>
            {user ? (
              <Link onClick={() => setMenu(false)} href="/account">
                My account
              </Link>
            ) : (
              <>
                <Link onClick={() => setMenu(false)} href="/account?mode=login">
                  Login
                </Link>
                <Link
                  onClick={() => setMenu(false)}
                  href="/account?mode=signup"
                >
                  Sign up
                </Link>
              </>
            )}
            <Link
              onClick={() => setMenu(false)}
              href="/admin/login"
              className="text-[#ff9367]"
            >
              Admin panel
            </Link>
            <Link onClick={() => setMenu(false)} href="/cart">
              Cart ({count})
            </Link>
          </nav>
        </div>
      )}
      <a
        href="https://wa.me/919372383568"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-40 rounded-full bg-[#25D366] px-4 py-3 text-xs font-black text-white shadow-xl"
      >
        WhatsApp us
      </a>
    </>
  );
}
export function StoreFooter() {
  const [settings] = useStoreSettings();
  const brand = settings.brandName || "FXX";
  return (
    <footer className="border-t border-white/10 bg-[#121212] px-5 py-12 text-white sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 sm:flex-row">
        <div>
          <p className="text-4xl">
            <BrandWord
              brand={brand}
              accent={settings.accent}
              logoUrl={settings.logoUrl}
            />
          </p>
          <p className="mt-3 max-w-sm text-sm text-white/50">
            Unapologetic Indian streetwear for every side of the city.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm text-white/65">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[.16em] text-white/40">
              Shop
            </p>
            <Link className="block py-1" href="/shop">
              All products
            </Link>
            <Link className="block py-1" href="/cart">
              Your cart
            </Link>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[.16em] text-white/40">
              Contact
            </p>
            <a
              className="block py-1 hover:text-[#e66735]"
              href="mailto:forfunuse654@gmail.com"
            >
              forfunuse654@gmail.com
            </a>
            <a
              className="block py-1 hover:text-[#e66735]"
              href="https://wa.me/919372383568"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp: 9372383568
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
export function ProductCard({ product }: { product: Product }) {
  const [, saveCart] = useCart();
  const add = () => {
    const cart = JSON.parse(localStorage.getItem("uf-cart-v1") || "[]") as {
      productId: number;
      size: string;
      quantity: number;
    }[];
    const found = cart.find(
      (item) => item.productId === product.id && item.size === product.sizes[0],
    );
    saveCart(
      found
        ? cart.map((item) =>
            item === found ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [
            ...cart,
            { productId: product.id, size: product.sizes[0], quantity: 1 },
          ],
    );
  };
  return (
    <article className="group">
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-[.82] overflow-hidden bg-[#1c1c1c]"
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 bg-[#e66735] px-2 py-1 text-[9px] font-black tracking-[.1em] text-white">
            {product.badge}
          </span>
        )}
      </Link>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <Link
            href={`/products/${product.id}`}
            className="text-sm font-bold leading-5 hover:text-[#e66735] sm:text-base"
          >
            {product.name}
          </Link>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[.13em] text-white/45">
            {product.category}
          </p>
          <p className="mt-2 text-sm font-semibold">
            {formatPrice(product.price)}
          </p>
        </div>
        <button
          onClick={add}
          disabled={product.stock === 0}
          className="grid h-8 w-8 place-items-center border border-white/20 transition hover:bg-[#e66735] disabled:opacity-30"
          aria-label="Quick add"
        >
          <Plus size={15} />
        </button>
      </div>
    </article>
  );
}
