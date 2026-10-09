"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || `/${locale}`;
  const other: Locale = locale === "ar" ? "fr" : "ar";
  const href = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${other}`);
  return (
    <Link
      href={href}
      hrefLang={other}
      onClick={() => { document.cookie = `locale=${other}; path=/; max-age=31536000; samesite=lax`; }}
      className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:bg-brand-mist"
    >
      {other === "ar" ? "العربية" : "Français"}
    </Link>
  );
}
