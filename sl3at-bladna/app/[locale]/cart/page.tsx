import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getSelectedWilayaId } from "@/lib/wilaya-cookie";
import { listProducts, listSellers } from "@/lib/data/api";
import { CartView, type CartProduct } from "@/components/CartView";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return { title: params.locale === "ar" ? "سلة المشتريات" : "Mon panier", robots: { index: false } };
}

export default async function CartPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const t = getDictionary(locale);
  const [products, sellers] = await Promise.all([listProducts(), listSellers()]);

  // Only the fields the cart needs are sent to the browser.
  const slim: CartProduct[] = products.map((p) => {
    const s = sellers.find((x) => x.id === p.sellerId)!;
    return {
      id: p.id, title: locale === "ar" ? p.titleAr : p.titleFr, priceDzd: p.priceDzd, weightGrams: p.weightGrams,
      stock: p.stock, categoryId: p.categoryId, sellerId: s.id, sellerName: locale === "ar" ? s.nameAr : s.nameFr, sellerWilayaId: s.wilayaId,
    };
  });

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold">{t.cart.title}</h1>
      <CartView products={slim} wilayaId={getSelectedWilayaId()} locale={locale} t={t} />
    </div>
  );
}
