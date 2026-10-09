import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getSelectedWilayaId } from "@/lib/wilaya-cookie";
import { listProducts, listSellers, type ProductFilters } from "@/lib/data/api";
import { CATEGORIES } from "@/lib/data/categories";
import { WILAYAS } from "@/lib/data/wilayas";
import { ProductCard } from "@/components/ProductCard";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return { title: params.locale === "ar" ? "كل المنتجات" : "Tous les produits" };
}

function parseFilters(sp: SP): ProductFilters & { sort: NonNullable<ProductFilters["sort"]> } {
  const sorts = ["new", "price_asc", "price_desc", "rating"] as const;
  const sort = sorts.find((s) => s === one(sp.sort)) ?? "new";
  const w = parseInt(one(sp.sellerWilaya) ?? "", 10);
  const max = parseInt(one(sp.maxPrice) ?? "", 10);
  return {
    q: one(sp.q)?.trim().slice(0, 80) || undefined,
    category: one(sp.category) || undefined,
    sellerWilaya: w >= 1 && w <= 58 ? w : undefined,
    maxPrice: max > 0 ? max : undefined,
    inStock: one(sp.inStock) === "1",
    sort,
  };
}

export default async function ProductsPage({ params, searchParams }: { params: { locale: string }; searchParams: SP }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const t = getDictionary(locale);
  const wilayaId = getSelectedWilayaId();
  const f = parseFilters(searchParams);

  const [products, sellers] = await Promise.all([listProducts(f), listSellers()]);
  const sellerOf = (id: string) => sellers.find((s) => s.id === id)!;

  const filters = (
    <form method="get" className="flex flex-col gap-4 text-sm">
      {f.q && <input type="hidden" name="q" value={f.q} />}
      <label className="flex flex-col gap-1.5">
        <span className="font-semibold">{t.products.category}</span>
        <select name="category" defaultValue={f.category ?? ""} className="field">
          <option value="">{t.products.allCategories}</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.slug}>{locale === "ar" ? c.ar : c.fr}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-semibold">{t.products.sellerWilaya}</span>
        <select name="sellerWilaya" defaultValue={f.sellerWilaya ?? ""} className="field">
          <option value="">{t.wilaya.all}</option>
          {WILAYAS.map((w) => <option key={w.id} value={w.id}>{String(w.id).padStart(2, "0")} - {locale === "ar" ? w.ar : w.fr}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-semibold">{t.products.priceMax}</span>
        <input name="maxPrice" type="number" min={1} step={100} inputMode="numeric" defaultValue={f.maxPrice ?? ""} className="field" />
      </label>
      <label className="flex items-center gap-2">
        <input name="inStock" type="checkbox" value="1" defaultChecked={f.inStock} className="h-4 w-4 accent-brand" />
        <span>{t.products.inStock}</span>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-semibold">{t.products.sort}</span>
        <select name="sort" defaultValue={f.sort} className="field">
          <option value="new">{t.products.sortNew}</option>
          <option value="price_asc">{t.products.sortPriceAsc}</option>
          <option value="price_desc">{t.products.sortPriceDesc}</option>
          <option value="rating">{t.products.sortRating}</option>
        </select>
      </label>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">{t.products.apply}</button>
        <Link href={`/${locale}/products${f.q ? `?q=${encodeURIComponent(f.q)}` : ""}`} className="btn-outline">{t.products.reset}</Link>
      </div>
    </form>
  );

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">{f.q ? `“${f.q}”` : t.products.title}</h1>
      <p className="mt-1 text-sm text-muted">{products.length} {t.products.results}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Mobile: collapsible. Desktop: always open. */}
        <details className="rounded-card border border-line p-4 lg:hidden">
          <summary className="flex cursor-pointer items-center gap-2 font-semibold"><SlidersHorizontal className="h-4 w-4" aria-hidden />{t.products.filters}</summary>
          <div className="mt-4">{filters}</div>
        </details>
        <aside className="hidden self-start rounded-card border border-line p-4 lg:block">{filters}</aside>

        <section aria-live="polite">
          {products.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
              {products.map((p) => <ProductCard key={p.id} product={p} seller={sellerOf(p.sellerId)} locale={locale} t={t} toWilaya={wilayaId} />)}
            </div>
          ) : (
            <p className="rounded-card border border-dashed border-line p-8 text-center text-muted">{t.products.empty}</p>
          )}
        </section>
      </div>
    </div>
  );
}
