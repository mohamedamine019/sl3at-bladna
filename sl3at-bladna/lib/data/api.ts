/**
 * Data access layer.
 * Phase 1 runs on in-memory demo data so the app works with zero setup.
 * Phase 2 swaps the bodies of these functions for Supabase queries; pages and components do not change.
 */
import type { Product, Seller } from "../types";
import { PRODUCTS, SELLERS } from "./mock";
import { categoryBySlug } from "./categories";

export interface ProductFilters {
  q?: string;
  category?: string;
  sellerWilaya?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: "new" | "price_asc" | "price_desc" | "rating";
}

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u064B-\u0652\u0300-\u036f]/g, "").replace(/[أإآ]/g, "ا");

export async function listSellers(): Promise<Seller[]> {
  return SELLERS;
}

export async function getSeller(id: string): Promise<Seller | undefined> {
  return SELLERS.find((s) => s.id === id);
}

export async function getSellerBySlug(slug: string): Promise<Seller | undefined> {
  return SELLERS.find((s) => s.slug === slug);
}

export async function listProducts(f: ProductFilters = {}): Promise<Product[]> {
  const sellerWilaya = new Map(SELLERS.map((s) => [s.id, s.wilayaId]));
  const cat = categoryBySlug(f.category);

  let out = PRODUCTS.filter((p) => {
    if (cat && p.categoryId !== cat.id) return false;
    if (f.sellerWilaya && sellerWilaya.get(p.sellerId) !== f.sellerWilaya) return false;
    if (f.maxPrice && p.priceDzd > f.maxPrice) return false;
    if (f.inStock && p.stock <= 0) return false;
    if (f.q) {
      const hay = norm(`${p.titleAr} ${p.titleFr} ${p.descAr} ${p.descFr}`);
      if (!norm(f.q).split(/\s+/).filter(Boolean).every((w) => hay.includes(w))) return false;
    }
    return true;
  });

  switch (f.sort) {
    case "price_asc": out = [...out].sort((a, b) => a.priceDzd - b.priceDzd); break;
    case "price_desc": out = [...out].sort((a, b) => b.priceDzd - a.priceDzd); break;
    case "rating": out = [...out].sort((a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount); break;
    default: out = [...out].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return out;
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return PRODUCTS.find((p) => p.id === id);
}

/** Products whose seller is in the given wilaya. */
export async function listProductsFromWilaya(wilayaId: number, limit = 4): Promise<Product[]> {
  const ids = new Set(SELLERS.filter((s) => s.wilayaId === wilayaId).map((s) => s.id));
  return PRODUCTS.filter((p) => ids.has(p.sellerId)).slice(0, limit);
}
