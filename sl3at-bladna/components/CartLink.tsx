"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";

export function CartLink({ locale, label }: { locale: string; label: string }) {
  const { count, ready } = useCart();
  return (
    <Link href={`/${locale}/cart`} className="relative rounded-lg p-2 hover:bg-brand-mist" aria-label={label}>
      <ShoppingCart className="h-5 w-5" aria-hidden />
      {ready && count > 0 && (
        <span className="absolute -end-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-flag px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
