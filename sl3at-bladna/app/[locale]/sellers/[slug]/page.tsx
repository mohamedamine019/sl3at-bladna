import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getSelectedWilayaId } from "@/lib/wilaya-cookie";
import { getSellerBySlug, listProducts } from "@/lib/data/api";
import { wilayaName } from "@/lib/data/wilayas";
import { ProductCard } from "@/components/ProductCard";

export default async function SellerPage({ params }: { params: { locale: string; slug: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const t = getDictionary(locale);
  const seller = await getSellerBySlug(params.slug);
  if (!seller) notFound();
  const wilayaId = getSelectedWilayaId();
  const products = (await listProducts({ sort: "new" })).filter((p) => p.sellerId === seller.id);

  return (
    <div className="container-page py-8">
      <header className="rounded-card bg-brand-mist p-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          {locale === "ar" ? seller.nameAr : seller.nameFr}
          {seller.verified && <BadgeCheck className="h-6 w-6 text-brand" aria-label={t.product.verified} />}
        </h1>
        <p className="mt-1 text-sm text-muted">{wilayaName(seller.wilayaId, locale)} · {seller.ratingAvg.toFixed(1)} ★ ({seller.ratingCount})</p>
        <p className="mt-3 max-w-prose text-muted">{locale === "ar" ? seller.descAr : seller.descFr}</p>
      </header>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {products.map((p) => <ProductCard key={p.id} product={p} seller={seller} locale={locale} t={t} toWilaya={wilayaId} />)}
      </div>
    </div>
  );
}
