import type { Locale } from "./i18n";

/** 12500 -> "12 500 دج" (ar) or "12 500 DA" (fr). Uses Western digits on purpose: that's how prices appear in Algerian shops. */
export function formatDA(amount: number, locale: Locale): string {
  const n = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F");
  return locale === "ar" ? `${n} دج` : `${n} DA`;
}
