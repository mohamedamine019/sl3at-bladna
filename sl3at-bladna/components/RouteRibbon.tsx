import { ArrowRight } from "lucide-react";
import { wilayaName } from "@/lib/data/wilayas";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries/ar";
import { quoteShipping } from "@/lib/shipping";

/**
 * The signature element of the site: every product shows where it travels from and to.
 * With no destination chosen it shows only the origin.
 */
export function RouteRibbon({
  from, to, weightGrams, locale, t, compact = false,
}: { from: number; to: number | null; weightGrams: number; locale: Locale; t: Dictionary; compact?: boolean }) {
  const q = to ? quoteShipping(from, to, weightGrams) : null;
  const days = q ? `${q.days} ${q.days === 1 ? t.hero.day : t.hero.days}` : null;
  return (
    <div className={`flex items-center gap-1.5 text-muted ${compact ? "text-xs" : "text-sm"}`}>
      <span className="h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden />
      <span className="font-medium text-ink">{wilayaName(from, locale)}</span>
      {to && (
        <>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-flag rtl:rotate-180" aria-hidden />
          <span className="font-medium text-ink">{wilayaName(to, locale)}</span>
          {days && <span className="ms-1 whitespace-nowrap rounded-full bg-brand-soft px-2 py-0.5 text-brand-dark">{days}</span>}
        </>
      )}
    </div>
  );
}
