import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import type { Seller } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries/ar";
import { wilayaName } from "@/lib/data/wilayas";

export function SellerCard({ seller, locale, t }: { seller: Seller; locale: Locale; t: Dictionary }) {
  const name = locale === "ar" ? seller.nameAr : seller.nameFr;
  return (
    <Link href={`/${locale}/sellers/${seller.slug}`} className="flex gap-3 rounded-card border border-line p-4 transition-colors hover:border-brand">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white" aria-hidden>
        {name.charAt(0)}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 font-semibold">
          <span className="truncate">{name}</span>
          {seller.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-brand" aria-label={t.product.verified} />}
        </span>
        <span className="block text-sm text-muted">{wilayaName(seller.wilayaId, locale)}</span>
        <span className="mt-1 flex items-center gap-1 text-xs text-muted">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
          {seller.ratingAvg.toFixed(1)} ({seller.ratingCount})
        </span>
      </span>
    </Link>
  );
}
