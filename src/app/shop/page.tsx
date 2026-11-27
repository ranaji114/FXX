"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { StoreFooter, StoreHeader, ProductCard } from "@/components/store-ui";
import { useProducts } from "@/lib/store";

const categories = ["All", "Acid Wash", "Hoodies", "Sweatshirts", "Bottoms"] as const;
export default function ShopPage() { return <Suspense fallback={<main className="min-h-screen bg-[#0b0b0b] text-white"><StoreHeader/><p className="p-10">Loading the catalogue…</p></main>}><ShopContent/></Suspense>; }
function ShopContent() { const params = useSearchParams(); const selected = params.get("category") || "All"; const [products] = useProducts(); const visible = selected === "All" ? products : products.filter((item) => item.category === selected); return <main className="min-h-screen bg-[#0b0b0b] text-[#f7f3eb]"><StoreHeader/><section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12"><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#e66735]">Union Fire catalogue</p><h1 className="mt-3 text-5xl font-black uppercase tracking-[-.07em] sm:text-7xl">All drops.</h1><div className="hide-scrollbar mt-10 flex gap-2 overflow-x-auto pb-2">{categories.map((category) => <a key={category} href={category === "All" ? "/shop" : `/shop?category=${encodeURIComponent(category)}`} className={`shrink-0 border px-4 py-2 text-[10px] font-black uppercase tracking-[.13em] ${selected === category ? "border-[#e66735] bg-[#e66735]" : "border-white/15 text-white/60"}`}>{category}</a>)}</div><p className="mt-9 text-sm text-white/50">{visible.length} pieces available</p><div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-y-14">{visible.map((product) => <ProductCard key={product.id} product={product}/>)}</div></section><StoreFooter/></main>; }
