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
export type StoreCategory = { id: number; name: string; slug: string; sortOrder: number };

const productKey = "uf-products-v1";
const cartKey = "uf-cart-v1";
const orderKey = "uf-orders-v1";
const settingsKey = "uf-settings-v1";
const categoryKey = "uf-categories-v1";
const defaultSettings: StoreSettings = { brandName: "FXX", logoUrl: "", accent: "#e66735" };
const defaultCategories: StoreCategory[] = ["Acid Wash", "Hoodies", "Sweatshirts", "Bottoms"].map((name, index) => ({ id: index + 1, name, slug: name.toLowerCase().replace(/\s+/g, "-"), sortOrder: index + 1 }));
const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(window.localStorage.getItem(key) || "") as T; } catch { return fallback; }
};
const write = <T,>(key: string, value: T) => { window.localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new Event("uf-change")); };

export function useProducts() {
  const [value, setValue] = useState<Product[]>(products);
  useEffect(() => {
    const load = async () => { const local = read(productKey, products); setValue(local); if (!supabase) return; const { data, error } = await supabase.from("products").select("*").eq("is_active", true).order("id"); if (!error && data) { const next = data.map(toProduct); write(productKey, next); setValue(next); } };
    void load(); window.addEventListener("uf-change", load);
    const channel = supabase?.channel(`fxx-products-live-${crypto.randomUUID()}`).on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => void load()).subscribe();
    return () => { window.removeEventListener("uf-change", load); if (channel) void supabase?.removeChannel(channel); };
  }, []);
  const save = async (next: Product[]) => { const client = supabase; if (client) { const results = await Promise.all(next.map((product) => client.from("products").upsert(toRow(product)))); const failure = results.find((result) => result.error)?.error; if (failure) throw failure; } write(productKey, next); setValue(next); };
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
  useEffect(() => {
    const load = async () => { const local = read(settingsKey, defaultSettings); setValue(local); if (!supabase) return; const { data } = await supabase.from("store_settings").select("*").eq("id", 1).single(); if (data) { const next = { brandName: String(data.brand_name), logoUrl: String(data.logo_url || ""), accent: String(data.accent || "#e66735") }; write(settingsKey, next); setValue(next); } };
    void load(); window.addEventListener("uf-change", load);
    const channel = supabase?.channel(`fxx-settings-live-${crypto.randomUUID()}`).on("postgres_changes", { event: "*", schema: "public", table: "store_settings" }, () => void load()).subscribe();
    return () => { window.removeEventListener("uf-change", load); if (channel) void supabase?.removeChannel(channel); };
  }, []);
  const save = async (next: StoreSettings) => { if (supabase) { const { error } = await supabase.from("store_settings").upsert({ id: 1, brand_name: next.brandName, logo_url: next.logoUrl, accent: next.accent }); if (error) throw error; } write(settingsKey, next); setValue(next); };
  return [value, save] as const;
}
export function useCategories() {
  const [value, setValue] = useState<StoreCategory[]>(defaultCategories);
  useEffect(() => {
    const load = async () => { const local = read(categoryKey, defaultCategories); setValue(local); if (!supabase) return; const { data, error } = await supabase.from("categories").select("*").order("sort_order"); if (!error && data) { const next = data.map(toCategory); write(categoryKey, next); setValue(next); } };
    void load(); window.addEventListener("uf-change", load);
    const channel = supabase?.channel(`fxx-categories-live-${crypto.randomUUID()}`).on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () => void load()).subscribe();
    return () => { window.removeEventListener("uf-change", load); if (channel) void supabase?.removeChannel(channel); };
  }, []);
  const add = async (name: string) => { const clean = name.trim(); if (!clean) throw new Error("Enter a category name."); const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); const next = { id: Date.now(), name: clean, slug, sortOrder: value.length + 1 }; if (supabase) { const { error } = await supabase.from("categories").insert({ name: clean, slug, sort_order: next.sortOrder }); if (error) throw error; } write(categoryKey, [...value, next]); setValue([...value, next]); };
  const rename = async (category: StoreCategory, name: string) => { const clean = name.trim(); if (!clean) throw new Error("Category name cannot be empty."); if (supabase) { const { error } = await supabase.from("categories").update({ name: clean }).eq("id", category.id); if (error) throw error; const { error: productError } = await supabase.from("products").update({ category: clean }).eq("category", category.name); if (productError) throw productError; } const next = value.map((item) => item.id === category.id ? { ...item, name: clean } : item); write(categoryKey, next); setValue(next); };
  const remove = async (category: StoreCategory) => { if (supabase) { const { error: productError } = await supabase.from("products").update({ category: "Uncategorised" }).eq("category", category.name); if (productError) throw productError; const { error } = await supabase.from("categories").delete().eq("id", category.id); if (error) throw error; } const next = value.filter((item) => item.id !== category.id); write(categoryKey, next); setValue(next); };
  return [value, add, rename, remove] as const;
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
export async function uploadProductImage(file: File) {
  const client = supabase;
  if (!client) throw new Error("Supabase is not configured.");
  if (!file.type.startsWith("image/")) throw new Error("Please upload an image file.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be smaller than 5 MB.");
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `products/${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return client.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}
export async function deleteDatabaseProduct(product: Product) {
  const client = supabase;
  if (!client) return;
  const marker = "/storage/v1/object/public/product-images/";
  const imagePath = product.image.includes(marker) ? product.image.split(marker)[1] : null;
  const { error } = await client.from("products").delete().eq("id", product.id);
  if (error) throw error;
  if (imagePath) { const { error: imageError } = await client.storage.from("product-images").remove([imagePath]); if (imageError) console.warn("Product was removed but its unused image could not be removed."); }
}
export async function updateDatabaseOrderStatus(id: string, status: CustomerOrder["status"]) { if (supabase) { const { error } = await supabase.from("orders").update({ fulfilment_status: status.toLowerCase() }).eq("order_number", id); if (error) throw error; } }

function toProduct(row: Record<string, unknown>): Product { return { id: Number(row.id), name: String(row.name), category: row.category as Product["category"], price: Number(row.price), oldPrice: row.compare_at_price ? Number(row.compare_at_price) : undefined, image: String(row.image_url), badge: row.badge ? String(row.badge) : undefined, colors: (row.colours as string[]) || [], sizes: (row.sizes as string[]) || [], description: String(row.description || ""), details: (row.custom_details as { label: string; value: string }[]) || [], stock: Number(row.stock) }; }
function toRow(product: Product) { return { id: product.id, name: product.name, category: product.category, price: product.price, compare_at_price: product.oldPrice || null, image_url: product.image, badge: product.badge || null, colours: product.colors, sizes: product.sizes, description: product.description, custom_details: product.details || [], stock: product.stock, is_active: true }; }
function toCategory(row: Record<string, unknown>): StoreCategory { return { id: Number(row.id), name: String(row.name), slug: String(row.slug), sortOrder: Number(row.sort_order) }; }
function toOrder(row: Record<string, unknown>): CustomerOrder { const address = row.shipping_address as { customer?: string; phone?: string; address?: string }; const items = (row.order_items as { product_id: number; size: string; quantity: number }[] || []).map((item) => ({ productId: Number(item.product_id), size: item.size, quantity: Number(item.quantity) })); const current = String(row.fulfilment_status || "new"); const status = current === "new" ? "New" : current.charAt(0).toUpperCase() + current.slice(1) as CustomerOrder["status"]; return { id: String(row.order_number), customer: address.customer || "Customer", phone: address.phone || "", address: address.address || "", payment: row.payment_method === "cod" ? "COD" : "Online", status, items, total: Number(row.total), createdAt: new Date(String(row.created_at)).toLocaleString("en-IN"), userId: String(row.customer_id || "") }; }
