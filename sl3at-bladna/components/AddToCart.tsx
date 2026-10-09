"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";

export function AddToCart({
  productId, maxQty, labels,
}: { productId: string; maxQty: number; labels: { add: string; added: string; qty: string; out: string } }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);

  if (maxQty <= 0) return <button className="btn-outline w-full" disabled>{labels.out}</button>;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-lg border border-line" role="group" aria-label={labels.qty}>
        <button type="button" className="p-2.5 hover:bg-brand-mist" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="-"><Minus className="h-4 w-4" /></button>
        <span className="w-8 text-center text-sm font-semibold" aria-live="polite">{qty}</span>
        <button type="button" className="p-2.5 hover:bg-brand-mist" onClick={() => setQty((q) => Math.min(maxQty, 99, q + 1))} aria-label="+"><Plus className="h-4 w-4" /></button>
      </div>
      <button
        type="button"
        className="btn-primary flex-1"
        onClick={() => { add(productId, qty); setDone(true); setTimeout(() => setDone(false), 1800); }}
      >
        {done ? <Check className="h-4 w-4" aria-hidden /> : <ShoppingCart className="h-4 w-4" aria-hidden />}
        {done ? labels.added : labels.add}
      </button>
    </div>
  );
}
