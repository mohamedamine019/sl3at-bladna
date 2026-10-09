"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface CartLine { productId: string; qty: number }
interface CartCtx {
  lines: CartLine[];
  count: number;
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  ready: boolean;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "slb-cart-v1";

// The MVP cart lives in the browser. Phase 2 syncs it to the `carts` table for signed-in users.
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setLines(parsed.filter((l) => typeof l?.productId === "string" && Number.isInteger(l?.qty) && l.qty > 0 && l.qty <= 99));
        }
      }
    } catch { /* storage blocked or corrupted: start with an empty cart */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* ignore */ }
  }, [lines, ready]);

  const add = useCallback((productId: string, qty = 1) => {
    setLines((cur) => {
      const found = cur.find((l) => l.productId === productId);
      if (found) return cur.map((l) => (l.productId === productId ? { ...l, qty: Math.min(99, l.qty + qty) } : l));
      return [...cur, { productId, qty: Math.min(99, qty) }];
    });
  }, []);
  const setQty = useCallback((productId: string, qty: number) => {
    setLines((cur) => (qty <= 0 ? cur.filter((l) => l.productId !== productId) : cur.map((l) => (l.productId === productId ? { ...l, qty: Math.min(99, qty) } : l))));
  }, []);
  const remove = useCallback((productId: string) => setLines((cur) => cur.filter((l) => l.productId !== productId)), []);

  const value = useMemo<CartCtx>(
    () => ({ lines, count: lines.reduce((n, l) => n + l.qty, 0), add, setQty, remove, ready }),
    [lines, add, setQty, remove, ready],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside <CartProvider>");
  return c;
}
