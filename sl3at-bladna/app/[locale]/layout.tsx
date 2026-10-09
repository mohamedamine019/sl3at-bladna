import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { LOCALES, dir, getDictionary, isLocale } from "@/lib/i18n";
import { getSelectedWilayaId } from "@/lib/wilaya-cookie";
import { CartProvider } from "@/components/CartProvider";
import { AuthProvider } from "@/components/auth-provider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const ar = params.locale === "ar";
  return {
    title: { default: ar ? "سلعة بلادنا | منتجات من كل ولايات الجزائر" : "SL3AT BLADNA | Produits de toutes les wilayas d'Algérie", template: "%s | SL3AT BLADNA" },
    description: ar
      ? "سوق وطني يربط بائعي الجزائر بالمشترين في كل الولايات. دفع عند الاستلام أو بالذهبية."
      : "La place de marché nationale qui relie vendeurs et acheteurs des 58 wilayas. Paiement à la livraison ou par Edahabia.",
    icons: { icon: "/logo.png" },
  };
}

export default function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const t = getDictionary(locale);
  const wilayaId = getSelectedWilayaId();

  return (
    <html lang={locale} dir={dir(locale)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="font-sans">
        <AuthProvider>
          <CartProvider>
            <Header locale={locale} t={t} wilayaId={wilayaId} />
            <main>{children}</main>
            <Footer locale={locale} t={t} />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
