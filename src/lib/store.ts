"use client";

import { useEffect, useState } from "react";
import { products, type Product } from "@/lib/catalog";
import { supabase } from "@/lib/supabase";

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
  userId?: string;
};
export type StoreSettings = { brandName: string; logoUrl: string; accent: string };

const productKey = "uf-products-v1";
const cartKey = "uf-cart-v1";
const orderKey = "uf-orders-v1";
const settingsKey = "uf-settings-v1";
const defaultSettings: StoreSettings = { brandName: "FXX", logoUrl: "", accent: "#e66735" };
const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(window.localStorage.getItem(key) || "") as T; } catch { return fallback; }
};
const write = <T,>(key: string, value: T) => { window.localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new Event("uf-change")); };

export function useProducts() {
  const [value, setValue] = useState<Product[]>(products);
  useEffect(() => { const load = async () => { const local = read(productKey, products); setValue(local); if (!supabase) return; const { data } = await supabase.from("products").select("*").eq("is_active", true).order("id"); if (data?.length) { const next = data.map(toProduct); write(productKey, next); setValue(next); } }; void load(); window.addEventListener("uf-change", load); return () => window.removeEventListener("uf-change", load); }, []);
  const save = async (next: Product[]) => { write(productKey, next); setValue(next); const client = supabase; if (!client) return; await Promise.all(next.map((product) => client.from("products").upsert(toRow(product)))); };
  return [value, save] as const;
}
export function useCart() {
  const [value, setValue] = useState<CartItem[]>([]);
  useEffect(() => { const load = () => setValue(read(cartKey, [])); load(); window.addEventListener("uf-change", load); return () => window.removeEventListener("uf-change", load); }, []);
  return [value, (next: CartItem[]) => write(cartKey, next)] as const;
}
export function useOrders() {
  const [value, setValue] = useState<CustomerOrder[]>([]);
  useEffect(() => { const load = async () => { if (!supabase) { setValue(read(orderKey, [])); return; } const { data } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }); if (data) { const next = data.map(toOrder); write(orderKey, next); setValue(next); } }; void load(); window.addEventListener("uf-change", load); return () => window.removeEventListener("uf-change", load); }, []);
  const save = async (next: CustomerOrder[]) => { write(orderKey, next); setValue(next); };
  return [value, save] as const;
}
export function useStoreSettings() {
  const [value, setValue] = useState<StoreSettings>(defaultSettings);
  useEffect(() => { const load = async () => { const local = read(settingsKey, defaultSettings); setValue(local); if (!supabase) return; const { data } = await supabase.from("store_settings").select("*").eq("id", 1).single(); if (data) { const next = { brandName: String(data.brand_name), logoUrl: String(data.logo_url || ""), accent: String(data.accent || "#e66735") }; write(settingsKey, next); setValue(next); } }; void load(); window.addEventListener("uf-change", load); return () => window.removeEventListener("uf-change", load); }, []);
  const save = async (next: StoreSettings) => { write(settingsKey, next); setValue(next); if (supabase) await supabase.from("store_settings").upsert({ id: 1, brand_name: next.brandName, logo_url: next.logoUrl, accent: next.accent }); };
  return [value, save] as const;
}
export const getProducts = () => read(productKey, products);
export const getCart = () => read<CartItem[]>(cartKey, []);
export const setCart = (items: CartItem[]) => write(cartKey, items);
export const setProducts = (items: Product[]) => write(productKey, items);
export const setOrders = (items: CustomerOrder[]) => write(orderKey, items);

export async function createDatabaseOrder(order: CustomerOrder) {
  if (!supabase) return;
  const { data: created, error } = await supabase.from("orders").insert({ order_number: order.id, customer_id: order.userId, total: order.total, payment_method: order.payment === "COD" ? "cod" : "razorpay", payment_status: order.payment === "COD" ? "pending" : "pending", fulfilment_status: "new", shipping_address: { customer: order.customer, phone: order.phone, address: order.address } }).select("id").single();
  if (error || !created) throw error || new Error("Could not create order.");
  const rows = order.items.map((item) => { const product = products.find((record) => record.id === item.productId); return { order_id: created.id, product_id: item.productId, product_name: product?.name || "Product", size: item.size, quantity: item.quantity, unit_price: product?.price || 0 }; });
  const { error: itemError } = await supabase.from("order_items").insert(rows); if (itemError) throw itemError;
}
export async function deleteDatabaseProduct(id: number) { if (supabase) await supabase.from("products").update({ is_active: false }).eq("id", id); }
export async function updateDatabaseOrderStatus(id: string, status: CustomerOrder["status"]) { if (supabase) await supabase.from("orders").update({ fulfilment_status: status.toLowerCase() }).eq("order_number", id); }

function toProduct(row: Record<string, unknown>): Product { return { id: Number(row.id), name: String(row.name), category: row.category as Product["category"], price: Number(row.price), oldPrice: row.compare_at_price ? Number(row.compare_at_price) : undefined, image: String(row.image_url), badge: row.badge ? String(row.badge) : undefined, colors: (row.colours as string[]) || [], sizes: (row.sizes as string[]) || [], description: String(row.description || ""), stock: Number(row.stock) }; }
function toRow(product: Product) { return { id: product.id, name: product.name, category: product.category, price: product.price, compare_at_price: product.oldPrice || null, image_url: product.image, badge: product.badge || null, colours: product.colors, sizes: product.sizes, description: product.description, stock: product.stock, is_active: true }; }
function toOrder(row: Record<string, unknown>): CustomerOrder { const address = row.shipping_address as { customer?: string; phone?: string; address?: string }; const items = (row.order_items as { product_id: number; size: string; quantity: number }[] || []).map((item) => ({ productId: Number(item.product_id), size: item.size, quantity: Number(item.quantity) })); const current = String(row.fulfilment_status || "new"); const status = current === "new" ? "New" : current.charAt(0).toUpperCase() + current.slice(1) as CustomerOrder["status"]; return { id: String(row.order_number), customer: address.customer || "Customer", phone: address.phone || "", address: address.address || "", payment: row.payment_method === "cod" ? "COD" : "Online", status, items, total: Number(row.total), createdAt: new Date(String(row.created_at)).toLocaleString("en-IN"), userId: String(row.customer_id || "") }; }
