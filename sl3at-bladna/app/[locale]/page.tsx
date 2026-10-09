import Link from "next/link";
import { ArrowRight, Banknote, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { getSelectedWilayaId } from "@/lib/wilaya-cookie";
import { listProducts, listProductsFromWilaya, listSellers } from "@/lib/data/api";
import { CATEGORIES } from "@/lib/data/categories";
import { wilayaName } from "@/lib/data/wilayas";
import { quoteShipping } from "@/lib/shipping";
import { formatDA } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { SellerCard } from "@/components/SellerCard";
import { CategoryIcon } from "@/components/Icon";
import { WilayaSelect } from "@/components/WilayaSelect";

const TRUST_ICONS = [Banknote, Truck, ShieldCheck, PackageCheck];
// Used by the hero board when the visitor hasn't picked a wilaya yet.
const SAMPLE_DESTINATIONS = [16, 25, 31, 11];

export default async function Home({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const t = getDictionary(locale);
  const wilayaId = getSelectedWilayaId();

  const [all, sellers] = await Promise.all([listProducts({ sort: "new" }), listSellers()]);
  const sellerOf = (id: string) => sellers.find((s) => s.id === id)!;
  const local = wilayaId ? await listProductsFromWilaya(wilayaId, 4) : [];

  // Hero board: four products from four different sellers, each heading to a wilaya.
  const seen = new Set<string>();
  const boardProducts = all.filter((p) => (seen.has(p.sellerId) ? false : (seen.add(p.sellerId), true))).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-brand-mist">
        <div className="container-page grid gap-8 py-10 lg:grid-cols-2 lg:items-center lg:py-14">
          <div>
            <h1 className="text-balance text-3xl font-bold leading-tight text-brand-dark sm:text-4xl lg:text-5xl lg:leading-[1.15]">{t.hero.title}</h1>
            <p className="mt-4 max-w-lg text-base text-muted sm:text-lg">{t.hero.subtitle}</p>
            <form action={`/${locale}/products`} className="mt-6 flex max-w-lg flex-col gap-2 sm:flex-row" role="search">
              <input name="q" type="search" className="field flex-1" placeholder={t.hero.search} aria-label={t.hero.search} />
              <button type="submit" className="btn-primary">{t.hero.searchBtn}</button>
            </form>
            <div className="mt-3 max-w-xs">
              <WilayaSelect locale={locale} value={wilayaId} label={t.wilaya.label} placeholder={t.wilaya.choose} />
            </div>
          </div>

          <aside className="rounded-card bg-brand-dark p-5 text-white" aria-label={t.hero.boardTitle}>
            <h2 className="mb-1 text-sm font-semibold text-white/80">{t.hero.boardTitle}</h2>
            <ul>
              {boardProducts.map((p, i) => {
                const s = sellerOf(p.sellerId);
                const to = wilayaId ?? SAMPLE_DESTINATIONS[i % SAMPLE_DESTINATIONS.length];
                const q = quoteShipping(s.wilayaId, to, p.weightGrams);
                return (
                  <li key={p.id} className="border-t border-white/15 first:border-t-0">
                    <Link href={`/${locale}/products/${p.id}`} className="flex items-center justify-between gap-3 py-3.5 hover:text-white/90">
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{locale === "ar" ? p.titleAr : p.titleFr}</span>
                        <span className="mt-1 flex items-center gap-1.5 text-sm text-white/75">
                          {wilayaName(s.wilayaId, locale)}
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-red-300 rtl:rotate-180" aria-hidden />
                          {wilayaName(to, locale)}
                        </span>
                      </span>
                      <span className="shrink-0 text-end">
                        <span className="block font-bold">{formatDA(p.priceDzd, locale)}</span>
                        {q && <span className="text-xs text-white/70">{q.days} {q.days === 1 ? t.hero.day : t.hero.days}</span>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page mt-10">
        <h2 className="text-xl font-bold">{t.sections.categories}</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <Link href={`/${locale}/products?category=${c.slug}`} className="flex items-center gap-3 rounded-card border border-line p-3.5 transition-colors hover:border-brand hover:bg-brand-mist">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand"><CategoryIcon name={c.icon} className="h-5 w-5" /></span>
                <span className="text-sm font-semibold leading-snug">{locale === "ar" ? c.ar : c.fr}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* From your wilaya (only when one is chosen) */}
      {wilayaId && (
        <section className="container-page mt-12">
          <h2 className="text-xl font-bold">{t.sections.local}: {wilayaName(wilayaId, locale)}</h2>
          {local.length ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {local.map((p) => <ProductCard key={p.id} product={p} seller={sellerOf(p.sellerId)} locale={locale} t={t} toWilaya={wilayaId} />)}
            </div>
          ) : (
            <p className="mt-4 rounded-card border border-dashed border-line p-6 text-muted">{t.sections.localEmpty}</p>
          )}
        </section>
      )}

      {/* Everywhere */}
      <section className="container-page mt-12">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold">{t.sections.everywhere}</h2>
          <Link href={`/${locale}/products`} className="text-sm font-semibold text-brand hover:underline">{t.sections.seeAll}</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {all.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} seller={sellerOf(p.sellerId)} locale={locale} t={t} toWilaya={wilayaId} />)}
        </div>
      </section>

      {/* Sellers */}
      <section className="container-page mt-12">
        <h2 className="text-xl font-bold">{t.sections.sellers}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sellers.slice(0, 4).map((s) => <SellerCard key={s.id} seller={s} locale={locale} t={t} />)}
        </div>
      </section>

      {/* Trust */}
      <section className="container-page mt-12">
        <ul className="grid gap-4 rounded-card border border-line p-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.trust.map((item, i) => {
            const I = TRUST_ICONS[i];
            return (
              <li key={item.t} className="flex gap-3">
                <I className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
                <div>
                  <p className="font-semibold">{item.t}</p>
                  <p className="text-sm text-muted">{item.d}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
