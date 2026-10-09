"use client";

import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { WILAYAS } from "@/lib/data/wilayas";
import type { Locale } from "@/lib/i18n";

export function WilayaSelect({
  locale, value, label, placeholder, className = "",
}: { locale: Locale; value: number | null; label: string; placeholder: string; className?: string }) {
  const router = useRouter();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    if (v) document.cookie = `wilaya=${v}; path=/; max-age=31536000; samesite=lax`;
    else document.cookie = "wilaya=; path=/; max-age=0";
    router.refresh();
  }

  return (
    <label className={`relative flex items-center ${className}`}>
      <span className="sr-only">{label}</span>
      <MapPin className="pointer-events-none absolute start-3 h-4 w-4 text-brand" aria-hidden />
      <select
        value={value ?? ""}
        onChange={onChange}
        className="field w-full appearance-none ps-9 pe-3"
      >
        <option value="">{placeholder}</option>
        {WILAYAS.map((w) => (
          <option key={w.id} value={w.id}>
            {String(w.id).padStart(2, "0")} - {locale === "ar" ? w.ar : w.fr}
          </option>
        ))}
      </select>
    </label>
  );
}
