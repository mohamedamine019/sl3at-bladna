import Link from "next/link";
import { Star } from "lucide-react";
import type { Product, Seller } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries/ar";
import { formatDA } from "@/lib/format";
import { ProductImage } from "./ProductImage";
import { RouteRibbon } from "./RouteRibbon";

export function ProductCard({
  product, seller, locale, t, toWilaya,
}: { product: Product; seller: Seller; locale: Locale; t: Dictionary; toWilaya: number | null }) {
  const title = locale === "ar" ? product.titleAr : product.titleFr;
  const sellerName = locale === "ar" ? seller.nameAr : seller.nameFr;
  const out = product.stock <= 0;
  return (
    <Link
      href={`/${locale}/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-white transition-colors hover:border-brand"
    >
      <div className="relative">
        <ProductImage categoryId={product.categoryId} className="aspect-[4/3] w-full" />
        {out && <span className="absolute start-2 top-2 rounded bg-ink px-2 py-0.5 text-xs font-medium text-white">{t.product.outOfStock}</span>}
        {!out && product.compareAtPriceDzd && (
          <span className="absolute start-2 top-2 rounded bg-flag px-2 py-0.5 text-xs font-semibold text-white">
            -{Math.round((1 - product.priceDzd / product.compareAtPriceDzd) * 100)}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <RouteRibbon from={seller.wilayaId} to={toWilaya} weightGrams={product.weightGrams} locale={locale} t={t} compact />
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-brand">{title}</h3>
        <p className="text-xs text-muted">{sellerName}</p>
        <div className="mt-auto flex items-end justify-between pt-1">
          <div>
            <p className="text-base font-bold text-brand-dark">{formatDA(product.priceDzd, locale)}</p>
            {product.compareAtPriceDzd && <p className="text-xs text-muted line-through">{formatDA(product.compareAtPriceDzd, locale)}</p>}
          </div>
          <span className="flex items-center gap-1 text-xs text-muted">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
            {product.ratingAvg.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
