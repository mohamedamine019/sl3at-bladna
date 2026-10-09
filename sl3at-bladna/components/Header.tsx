"use client";

import Link from "next/link";
import { Store, User } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries/ar";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { WilayaSelect } from "./WilayaSelect";
import { CartLink } from "./CartLink";
import { useAuth } from "./auth-provider";

export function Header({ locale, t, wilayaId }: { locale: Locale; t: Dictionary; wilayaId: number | null }) {
  const { user, role } = useAuth();

  const getDashboardPath = () => {
    if (role === "seller") return `/${locale}/dashboard/vendor`;
    if (role === "support" || role === "admin") return `/${locale}/dashboard/support`;
    return `/${locale}/dashboard/client`;
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-page flex items-center gap-3 py-2.5">
        <Link href={`/${locale}`} className="shrink-0" aria-label={t.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt={t.brand} width={130} height={51} className="h-10 w-auto sm:h-11" />
        </Link>

        <form action={`/${locale}/products`} className="mx-2 hidden flex-1 md:block" role="search">
          <input name="q" type="search" className="field" placeholder={t.nav.search} aria-label={t.nav.search} />
        </form>

        <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
          <WilayaSelect locale={locale} value={wilayaId} label={t.wilaya.label} placeholder={t.wilaya.choose} className="hidden w-44 sm:flex" />
          <Link href={`/${locale}/products`} className="hidden rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-mist lg:block">{t.nav.products}</Link>
          <Link href={`/${locale}/sell`} className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-mist lg:flex">
            <Store className="h-4 w-4" aria-hidden />{t.nav.sell}
          </Link>

          <LanguageSwitcher locale={locale} />
          
          <Link
            href={user ? getDashboardPath() : `/${locale}/login`}
            className="rounded-lg p-2 hover:bg-brand-mist flex items-center gap-1 text-slate-700 hover:text-emerald-700 transition"
            aria-label={t.nav.login}
            title={user ? (locale === "ar" ? "لوحة التحكم" : "Tableau de bord") : t.nav.login}
          >
            <User className="h-5 w-5" aria-hidden />
          </Link>

          <CartLink locale={locale} label={t.nav.cart} />
        </div>
      </div>

      {/* Mobile: wilaya + search on their own row */}
      <div className="container-page flex gap-2 pb-2.5 md:hidden">
        <WilayaSelect locale={locale} value={wilayaId} label={t.wilaya.label} placeholder={t.wilaya.choose} className="w-40 shrink-0 sm:hidden" />
        <form action={`/${locale}/products`} className="flex-1" role="search">
          <input name="q" type="search" className="field" placeholder={t.nav.search} aria-label={t.nav.search} />
        </form>
      </div>
    </header>
  );
}
