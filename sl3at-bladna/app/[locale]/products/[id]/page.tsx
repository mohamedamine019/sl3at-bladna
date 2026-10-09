import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, Star } from "lucide-react";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getSelectedWilayaId } from "@/lib/wilaya-cookie";
import { getProduct, getSeller } from "@/lib/data/api";
import { categoryById } from "@/lib/data/categories";
import { wilayaName } from "@/lib/data/wilayas";
import { quoteShipping } from "@/lib/shipping";
import { formatDA } from "@/lib/format";
import { ProductImage } from "@/components/ProductImage";
import { RouteRibbon } from "@/components/RouteRibbon";
import { AddToCart } from "@/components/AddToCart";
import { WilayaSelect } from "@/components/WilayaSelect";

export async function generateMetadata({ params }: { params: { locale: string; id: string } }): Promise<Metadata> {
  const p = await getProduct(params.id);
  if (!p) return {};
  return { title: params.locale === "ar" ? p.titleAr : p.titleFr, description: params.locale === "ar" ? p.descAr : p.descFr };
}

export default async function ProductPage({ params }: { params: { locale: string; id: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const t = getDictionary(locale);
  const product = await getProduct(params.id);
  if (!product) notFound();
  const seller = await getSeller(product.sellerId);
  if (!seller) notFound();

  const wilayaId = getSelectedWilayaId();
  const quote = wilayaId ? quoteShipping(seller.wilayaId, wilayaId, product.weightGrams) : null;
  const cat = categoryById(product.categoryId);
  const stockLabel = product.stock <= 0 ? t.product.outOfStock : product.stock <= 5 ? t.product.lowStock : t.product.inStock;
  const stockColor = product.stock <= 0 ? "text-flag" : product.stock <= 5 ? "text-amber-700" : "text-brand";

  return (
    <div className="container-page py-6">
      <Link href={`/${locale}/products`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand">
        <ArrowRight className="h-4 w-4 ltr:rotate-180" aria-hidden />{t.product.back}
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <ProductImage categoryId={product.categoryId} className="aspect-[4/3] w-full rounded-card sm:aspect-square" />

        <div className="flex flex-col gap-5">
          <div>
            {cat && <Link href={`/${locale}/products?category=${cat.slug}`} className="text-sm text-brand hover:underline">{locale === "ar" ? cat.ar : cat.fr}</Link>}
            <h1 className="mt-1 text-2xl font-bold leading-snug sm:text-3xl">{locale === "ar" ? product.titleAr : product.titleFr}</h1>
            <p className="mt-2 flex items-center gap-1 text-sm text-muted">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
              {product.ratingAvg.toFixed(1)} ({product.ratingCount} {t.product.reviews})
            </p>
          </div>

          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold text-brand-dark">{formatDA(product.priceDzd, locale)}</p>
            {product.compareAtPriceDzd && <p className="text-muted line-through">{formatDA(product.compareAtPriceDzd, locale)}</p>}
          </div>
          <p className={`text-sm font-semibold ${stockColor}`}>{stockLabel}</p>

          {/* Delivery: the core promise of the site */}
          <section className="rounded-card border border-line bg-brand-mist p-4" aria-label={t.product.delivery}>
            <p className="mb-2 text-sm font-semibold">{t.product.from} {wilayaName(seller.wilayaId, locale)}</p>
            {wilayaId && quote ? (
              <>
                <RouteRibbon from={seller.wilayaId} to={wilayaId} weightGrams={product.weightGrams} locale={locale} t={t} />
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-muted">{t.product.shipping}</dt><dd className="font-bold">{formatDA(quote.dzd, locale)}</dd></div>
                  <div><dt className="text-muted">{t.product.delivery}</dt><dd className="font-bold">{quote.days} {quote.days === 1 ? t.hero.day : t.hero.days}</dd></div>
                </dl>
                {quote.tier === "same_wilaya" && <p className="mt-2 text-xs text-brand-dark">{t.product.sameWilaya}</p>}
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted">{t.product.chooseWilaya}</p>
                <WilayaSelect locale={locale} value={null} label={t.wilaya.label} placeholder={t.wilaya.choose} className="max-w-xs" />
              </div>
            )}
          </section>

          <AddToCart
            productId={product.id}
            maxQty={product.stock}
            labels={{ add: t.product.addToCart, added: t.product.added, qty: t.product.qty, out: t.product.outOfStock }}
          />

          <section aria-label={t.product.payOptions}>
            <p className="mb-2 text-sm font-semibold">{t.product.payOptions}</p>
            <ul className="flex flex-wrap gap-2 text-sm">
              <li className="rounded-full border border-brand bg-brand-soft px-3 py-1 text-brand-dark">{t.product.cod}</li>
              <li className="rounded-full border border-line px-3 py-1 text-muted">{t.product.edahabia} · {t.product.soon}</li>
              <li className="rounded-full border border-line px-3 py-1 text-muted">{t.product.cib} · {t.product.soon}</li>
            </ul>
          </section>

          <Link href={`/${locale}/sellers/${seller.slug}`} className="flex items-center gap-3 rounded-card border border-line p-3 hover:border-brand">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand font-bold text-white" aria-hidden>{(locale === "ar" ? seller.nameAr : seller.nameFr).charAt(0)}</span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 font-semibold">
                {locale === "ar" ? seller.nameAr : seller.nameFr}
                {seller.verified && <BadgeCheck className="h-4 w-4 text-brand" aria-label={t.product.verified} />}
              </span>
              <span className="block text-sm text-muted">{wilayaName(seller.wilayaId, locale)} · {seller.ratingAvg.toFixed(1)} ★</span>
            </span>
            <span className="text-sm font-semibold text-brand">{t.product.visitStore}</span>
          </Link>

          <section>
            <h2 className="mb-1 font-semibold">{t.product.description}</h2>
            <p className="max-w-prose leading-relaxed text-muted">{locale === "ar" ? product.descAr : product.descFr}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
