"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCart } from "./CartProvider";
import { ProductImage } from "./ProductImage";
import { formatDA } from "@/lib/format";
import { quoteShipping } from "@/lib/shipping";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries/ar";

export interface CartProduct {
  id: string; title: string; priceDzd: number; weightGrams: number; stock: number;
  categoryId: number; sellerId: string; sellerName: string; sellerWilayaId: number;
}

export function CartView({
  products, wilayaId, locale, t,
}: { products: CartProduct[]; wilayaId: number | null; locale: Locale; t: Dictionary }) {
  const { lines, setQty, remove, ready } = useCart();
  const byId = new Map(products.map((p) => [p.id, p]));
  // Ignore stale ids (e.g. a product that no longer exists) and cap quantity at stock.
  const items = lines.flatMap((l) => {
    const p = byId.get(l.productId);
    return p ? [{ p, qty: Math.min(l.qty, Math.max(p.stock, 1)) }] : [];
  });

  if (!ready) return <p className="text-muted">{t.common.loading}</p>;
  if (!items.length) {
    return (
      <div className="rounded-card border border-dashed border-line p-10 text-center">
        <p className="text-muted">{t.cart.empty}</p>
        <Link href={`/${locale}/products`} className="btn-primary mt-4">{t.cart.browse}</Link>
      </div>
    );
  }

  const subtotal = items.reduce((n, i) => n + i.p.priceDzd * i.qty, 0);

  // One shipment per seller: each seller ships from their own wilaya.
  const bySeller = new Map<string, typeof items>();
  items.forEach((i) => bySeller.set(i.p.sellerId, [...(bySeller.get(i.p.sellerId) ?? []), i]));
  let shipping: number | null = wilayaId ? 0 : null;
  if (wilayaId) {
    bySeller.forEach((group) => {
      const w = group.reduce((n, i) => n + i.p.weightGrams * i.qty, 0);
      const q = quoteShipping(group[0].p.sellerWilayaId, wilayaId, w);
      shipping = (shipping ?? 0) + (q?.dzd ?? 0);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-5">
        {[...bySeller.values()].map((group) => (
          <section key={group[0].p.sellerId} className="rounded-card border border-line">
            <h2 className="border-b border-line bg-brand-mist px-4 py-2.5 text-sm font-semibold">{t.cart.fromSeller} {group[0].p.sellerName}</h2>
            <ul className="divide-y divide-line">
              {group.map(({ p, qty }) => (
                <li key={p.id} className="flex gap-3 p-4">
                  <ProductImage categoryId={p.categoryId} className="h-20 w-20 shrink-0 rounded-lg" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Link href={`/${locale}/products/${p.id}`} className="line-clamp-2 font-semibold hover:text-brand">{p.title}</Link>
                    <p className="text-sm font-bold text-brand-dark">{formatDA(p.priceDzd, locale)}</p>
                    <div className="mt-auto flex items-center gap-3">
                      <select
                        value={qty}
                        onChange={(e) => setQty(p.id, parseInt(e.target.value, 10))}
                        className="field w-20 py-1.5"
                        aria-label={t.product.qty}
                      >
                        {Array.from({ length: Math.min(Math.max(p.stock, 1), 10) }, (_, k) => k + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <button type="button" onClick={() => remove(p.id)} className="flex items-center gap-1 text-sm text-flag hover:underline">
                        <Trash2 className="h-4 w-4" aria-hidden />{t.cart.remove}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <aside className="h-fit rounded-card border border-line p-5">
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between"><dt className="text-muted">{t.cart.subtotal}</dt><dd className="font-semibold">{formatDA(subtotal, locale)}</dd></div>
          <div className="flex justify-between">
            <dt className="text-muted">{t.cart.shipping}</dt>
            <dd className="font-semibold">{shipping === null ? "—" : formatDA(shipping, locale)}</dd>
          </div>
          {shipping === null && <p className="text-xs text-muted">{t.product.chooseWilaya}</p>}
          <div className="flex justify-between border-t border-line pt-3 text-base">
            <dt className="font-bold">{t.cart.total}</dt>
            <dd className="font-bold text-brand-dark">{formatDA(subtotal + (shipping ?? 0), locale)}</dd>
          </div>
        </dl>
        <button className="btn-primary mt-5 w-full" disabled>{t.cart.checkout}</button>
        <p className="mt-2 text-center text-xs text-muted">{t.cart.checkoutSoon}</p>
      </aside>
    </div>
  );
}
