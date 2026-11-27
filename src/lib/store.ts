"use client";

import { useEffect, useState } from "react";
import { products, type Product } from "@/lib/catalog";

export type CartItem = { productId: number; size: string; quantity: number };
export type CustomerOrder = {
  id: string;
  customer: string;
  phone: string;
  address: string;
  payment: "COD" | "Online";
  status: "New" | "Processing" | "Shipped" | "Delivered";
  items: CartItem[];
  total: number;
  createdAt: string;
};
export type StoreSettings = { brandName: string; logoUrl: string; accent: string };

const productKey = "uf-products-v1";
const cartKey = "uf-cart-v1";
const orderKey = "uf-orders-v1";
const settingsKey = "uf-settings-v1";
const defaultSettings: StoreSettings = { brandName: "Union Fire", logoUrl: "", accent: "#e66735" };
const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(window.localStorage.getItem(key) || "") as T; } catch { return fallback; }
};
const write = <T,>(key: string, value: T) => { window.localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new Event("uf-change")); };

export function useProducts() {
  const [value, setValue] = useState<Product[]>(products);
  useEffect(() => { const load = () => setValue(read(productKey, products)); load(); window.addEventListener("uf-change", load); return () => window.removeEventListener("uf-change", load); }, []);
  return [value, (next: Product[]) => write(productKey, next)] as const;
}
export function useCart() {
  const [value, setValue] = useState<CartItem[]>([]);
  useEffect(() => { const load = () => setValue(read(cartKey, [])); load(); window.addEventListener("uf-change", load); return () => window.removeEventListener("uf-change", load); }, []);
  return [value, (next: CartItem[]) => write(cartKey, next)] as const;
}
export function useOrders() {
  const [value, setValue] = useState<CustomerOrder[]>([]);
  useEffect(() => { const load = () => setValue(read(orderKey, [])); load(); window.addEventListener("uf-change", load); return () => window.removeEventListener("uf-change", load); }, []);
  return [value, (next: CustomerOrder[]) => write(orderKey, next)] as const;
}
export function useStoreSettings() {
  const [value, setValue] = useState<StoreSettings>(defaultSettings);
  useEffect(() => { const load = () => setValue(read(settingsKey, defaultSettings)); load(); window.addEventListener("uf-change", load); return () => window.removeEventListener("uf-change", load); }, []);
  return [value, (next: StoreSettings) => write(settingsKey, next)] as const;
}
export const getProducts = () => read(productKey, products);
export const getCart = () => read<CartItem[]>(cartKey, []);
export const setCart = (items: CartItem[]) => write(cartKey, items);
export const setProducts = (items: Product[]) => write(productKey, items);
export const setOrders = (items: CustomerOrder[]) => write(orderKey, items);
