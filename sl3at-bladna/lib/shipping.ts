import { wilayaById } from "./data/wilayas";

export interface ShippingQuote { dzd: number; days: number; tier: "same_wilaya" | "same_region" | "north" | "highlands" | "south" }

/**
 * Placeholder tariff, mirrors the `shipping_zones` row in platform_settings.
 * Phase 2 replaces this with real carrier rates (Yalidine / ZR Express / Maystro).
 */
export function quoteShipping(fromWilayaId: number, toWilayaId: number, weightGrams: number): ShippingQuote | null {
  const from = wilayaById(fromWilayaId);
  const to = wilayaById(toWilayaId);
  if (!from || !to) return null;

  let base: Omit<ShippingQuote, "dzd"> & { dzd: number };
  if (from.id === to.id) base = { dzd: 400, days: 1, tier: "same_wilaya" };
  else if (from.region === to.region) base = { dzd: 600, days: 2, tier: "same_region" };
  else if (from.region === "south" || to.region === "south") base = { dzd: 1300, days: 5, tier: "south" };
  else if (from.region === "highlands" || to.region === "highlands") base = { dzd: 900, days: 4, tier: "highlands" };
  else base = { dzd: 800, days: 3, tier: "north" };

  const extraKg = Math.max(0, Math.ceil(weightGrams / 1000) - 1);
  return { ...base, dzd: base.dzd + extraKg * 100 };
}
