import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries/ar";

export function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <footer className="mt-16 border-t border-line bg-brand-mist">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-3">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt={t.brand} width={130} height={51} className="h-10 w-auto" />
          <p className="mt-3 max-w-xs text-sm text-muted">{t.footer.tagline}</p>
        </div>
        <nav className="flex flex-col gap-2 text-sm" aria-label={t.footer.about}>
          <Link href={`/${locale}/products`} className="hover:text-brand">{t.nav.products}</Link>
          <Link href={`/${locale}/sell`} className="hover:text-brand">{t.nav.sell}</Link>
          <Link href={`/${locale}/cart`} className="hover:text-brand">{t.nav.cart}</Link>
        </nav>
        <nav className="flex flex-col gap-2 text-sm" aria-label={t.footer.help}>
          <span className="font-semibold">{t.footer.help}</span>
          <span className="text-muted">{t.footer.returns}</span>
          <span className="text-muted">{t.footer.terms}</span>
          <span className="text-muted">{t.footer.contact}</span>
        </nav>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {t.brand}. {t.footer.rights}.
      </div>
    </footer>
  );
}
