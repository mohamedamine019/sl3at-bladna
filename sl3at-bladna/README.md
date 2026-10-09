# SL3AT BLADNA (سلعة بلادنا)

National multi-vendor marketplace for Algeria. Sellers anywhere list products, buyers in all 58 wilayas order them.

**Status: Phase 1 (foundation).** Runs today in *demo mode* on built-in data. No Supabase account needed.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000  (redirects to /ar)
npm run build && npm start
```

## What works in Phase 1

- Arabic (RTL, default) and French (LTR), switchable, all strings in `lib/dictionaries/`.
- Wilaya picker (cookie). Every product card and page shows the route **seller wilaya → your wilaya**, with shipping cost and delivery days.
- Home, product search with filters (category, seller wilaya, max price, in stock, sort), product page, seller store page, cart (browser storage).
- Placeholder shipping tariff in `lib/shipping.ts` (mirrors the `shipping_zones` setting). Real carrier rates come in Phase 2.

## What is NOT built yet

Login/registration, real orders, payments (Edahabia/CIB), seller/support/admin dashboards, image upload. Checkout button is disabled on purpose.

## Database (ready, not connected yet)

`supabase/migrations/` holds the full schema and security rules:

1. `0001_schema.sql` tables, constraints, sign-up trigger (only `buyer`/`seller` can be chosen at sign-up)
2. `0002_rls.sql` Row Level Security + guard triggers (sellers cannot approve themselves or change their plan; only admins change roles; support cannot read payout bank details)
3. `0003_seed_reference.sql` 58 wilayas, categories, plans, platform settings

Apply them in order in the Supabase SQL editor (or `supabase db push`).

Design rule: the browser can read what it is allowed to see; **anything involving money (checkout, payments, ledger, payouts) is written only by server code with the service-role key**, after server-side validation.

## Roadmap

| Phase | Scope |
|---|---|
| 2 | Connect Supabase (swap `lib/data/api.ts`), auth + roles + middleware guards, checkout with cash on delivery, orders and tracking timeline |
| 3 | Seller dashboard (products, orders, stats, payouts), image upload |
| 4 | Support dashboard (tickets, disputes, seller verification) and Super Admin (settings, commissions, free-launch toggle, audit log) |
| 5 | Edahabia/CIB through a payment provider, carrier APIs (Yalidine, ZR Express, Maystro), reviews |

## Before launching for real

- Check Algerian e-commerce law (18-05) requirements for your legal entity, hosting and domain with a professional.
- Review RLS policies and the payment webhook with someone technical.
- Replace placeholder shipping prices and the demo catalog.
