"use client";

import Link from "next/link";
import { StoreFooter, StoreHeader } from "@/components/store-ui";
import { formatPrice } from "@/lib/catalog";
import { useCart, useProducts } from "@/lib/store";

export default function CartPage() {
  const [cart, saveCart] = useCart();
  const [products] = useProducts();
  const rows = cart.flatMap((item) => {
    const product = products.find((record) => record.id === item.productId);
    return product ? [{ ...item, product }] : [];
  });
  const total = rows.reduce(
    (sum, row) => sum + row.product.price * row.quantity,
    0,
  );
  const change = (id: number, size: string, amount: number) =>
    saveCart(
      cart.flatMap((item) =>
        item.productId === id && item.size === size
          ? item.quantity + amount > 0
            ? [{ ...item, quantity: item.quantity + amount }]
            : []
          : [item],
      ),
    );
  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#f7f3eb]">
      <StoreHeader />
      <section className="mx-auto max-w-[1050px] px-5 py-14 sm:px-8">
        <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#e66735]">
          Your selection
        </p>
        <h1 className="mt-3 text-5xl font-black uppercase tracking-[-.07em]">
          Your cart.
        </h1>
        {rows.length === 0 ? (
          <div className="mt-12 border border-white/10 py-16 text-center">
            <p className="text-lg font-bold">Your cart is empty.</p>
            <Link
              href="/shop"
              className="mt-6 inline-block bg-[#e66735] px-5 py-3 text-[10px] font-black uppercase tracking-[.14em]"
            >
              Shop the drop
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-9 lg:grid-cols-[1fr_340px]">
            <div className="divide-y divide-white/10 border-y border-white/10">
              {rows.map((row) => (
                <article
                  key={`${row.productId}-${row.size}`}
                  className="flex gap-4 py-5 sm:gap-6"
                >
                  <Link href={`/products/${row.productId}`}>
                    <img
                      src={row.product.image}
                      alt=""
                      className="h-28 w-24 object-cover sm:h-36 sm:w-28"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-3">
                      <div>
                        <Link
                          href={`/products/${row.productId}`}
                          className="font-bold hover:text-[#e66735]"
                        >
                          {row.product.name}
                        </Link>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[.12em] text-white/45">
                          Size {row.size}
                        </p>
                      </div>
                      <p className="font-bold">
                        {formatPrice(row.product.price * row.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-white/20">
                        <button
                          className="h-8 w-8"
                          onClick={() => change(row.productId, row.size, -1)}
                        >
                          −
                        </button>
                        <span className="grid h-8 w-8 place-items-center text-xs font-bold">
                          {row.quantity}
                        </span>
                        <button
                          className="h-8 w-8"
                          onClick={() => change(row.productId, row.size, 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="text-[10px] font-black uppercase tracking-[.12em] text-white/45 underline"
                        onClick={() =>
                          change(row.productId, row.size, -row.quantity)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <aside className="h-fit bg-[#f2ede3] p-6 text-[#181614]">
              <h2 className="text-xl font-black uppercase tracking-[-.04em]">
                Order summary
              </h2>
              <div className="mt-6 flex justify-between border-b border-black/10 pb-4 text-sm">
                <span>Subtotal</span>
                <span className="font-black">{formatPrice(total)}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-black/50">
                Shipping is free above ₹1,999. Final delivery choices appear at
                checkout.
              </p>
              <Link
                href="/checkout"
                className="mt-6 block bg-[#e66735] py-4 text-center text-[10px] font-black uppercase tracking-[.14em] text-white"
              >
                Proceed to checkout
              </Link>
              <Link
                href="/shop"
                className="mt-5 block text-center text-[10px] font-black uppercase tracking-[.12em] underline underline-offset-4"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </section>
      <StoreFooter />
    </main>
  );
}
