-- SL3AT BLADNA - core schema (phase 1)
-- Money is stored as integer Algerian dinars (DZD) in *_dzd columns.

create extension if not exists "pgcrypto";

-- ---------- Reference ----------
create table public.wilayas (
  id smallint primary key check (id between 1 and 58),
  name_ar text not null,
  name_fr text not null,
  region text not null check (region in ('center','east','west','highlands','south'))
);

create table public.communes (
  id serial primary key,
  wilaya_id smallint not null references public.wilayas(id),
  name_ar text not null,
  name_fr text not null
);
create index on public.communes (wilaya_id);

create table public.categories (
  id serial primary key,
  parent_id integer references public.categories(id),
  slug text not null unique,
  name_ar text not null,
  name_fr text not null,
  icon text
);

-- ---------- Users ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'buyer' check (role in ('buyer','seller','support','admin')),
  full_name text,
  phone text check (phone is null or phone ~ '^0[567][0-9]{8}$'),
  wilaya_id smallint references public.wilayas(id),
  language text not null default 'ar' check (language in ('ar','fr')),
  created_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  phone text not null check (phone ~ '^0[567][0-9]{8}$'),
  wilaya_id smallint not null references public.wilayas(id),
  commune_id integer references public.communes(id),
  street text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.addresses (user_id);

-- ---------- Sellers and plans ----------
create table public.plans (
  id serial primary key,
  code text not null unique check (code in ('free','starter','pro','business')),
  name text not null,
  monthly_price_dzd integer not null default 0 check (monthly_price_dzd >= 0),
  max_products integer,
  commission_percent numeric(4,2) not null default 5,
  features jsonb not null default '[]'::jsonb
);

create table public.sellers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  store_name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  banner_url text,
  wilaya_id smallint not null references public.wilayas(id),
  phone text check (phone is null or phone ~ '^0[567][0-9]{8}$'),
  commercial_register text,
  status text not null default 'pending' check (status in ('pending','active','suspended','rejected')),
  plan_code text not null default 'free' references public.plans(code),
  rating_avg numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  created_at timestamptz not null default now()
);
create index on public.sellers (status);

create table public.seller_subscriptions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  plan_code text not null references public.plans(code),
  status text not null default 'trial' check (status in ('trial','active','past_due','cancelled')),
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Catalog ----------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  category_id integer not null references public.categories(id),
  title_ar text not null,
  title_fr text,
  description_ar text,
  description_fr text,
  price_dzd integer not null check (price_dzd > 0),
  compare_at_price_dzd integer check (compare_at_price_dzd is null or compare_at_price_dzd > price_dzd),
  stock integer not null default 0 check (stock >= 0),
  sku text,
  weight_grams integer not null default 500 check (weight_grams > 0),
  status text not null default 'draft' check (status in ('draft','active','hidden','reported')),
  ships_to_all boolean not null default true,
  created_at timestamptz not null default now()
);
create index on public.products (seller_id);
create index on public.products (category_id);
create index on public.products (status);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  position smallint not null default 0
);
create index on public.product_images (product_id);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  value text not null,
  extra_price_dzd integer not null default 0,
  stock integer not null default 0 check (stock >= 0)
);
create index on public.product_variants (product_id);

create table public.product_shipping_wilayas (
  product_id uuid not null references public.products(id) on delete cascade,
  wilaya_id smallint not null references public.wilayas(id),
  primary key (product_id, wilaya_id)
);

-- ---------- Cart (server-side, optional; the MVP UI keeps the cart in the browser) ----------
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  updated_at timestamptz not null default now()
);
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  qty integer not null check (qty > 0 and qty <= 99),
  unique (cart_id, product_id, variant_id)
);

-- ---------- Orders ----------
create sequence public.order_number_seq start 1000;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('SB-' || lpad(nextval('public.order_number_seq')::text, 7, '0')),
  buyer_id uuid not null references public.profiles(id),
  ship_full_name text not null,
  ship_phone text not null,
  ship_wilaya_id smallint not null references public.wilayas(id),
  ship_commune text,
  ship_street text not null,
  subtotal_dzd integer not null check (subtotal_dzd >= 0),
  shipping_dzd integer not null check (shipping_dzd >= 0),
  total_dzd integer not null check (total_dzd >= 0),
  payment_method text not null check (payment_method in ('cod','edahabia','cib')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  status text not null default 'placed' check (status in ('placed','confirmed','shipped','out_for_delivery','delivered','cancelled','returned')),
  created_at timestamptz not null default now()
);
create index on public.orders (buyer_id);
create index on public.orders (status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  seller_id uuid not null references public.sellers(id),
  variant_id uuid references public.product_variants(id),
  title_snapshot text not null,
  qty integer not null check (qty > 0),
  unit_price_dzd integer not null check (unit_price_dzd > 0),
  commission_dzd integer not null default 0 check (commission_dzd >= 0),
  status text not null default 'placed' check (status in ('placed','confirmed','shipped','out_for_delivery','delivered','cancelled','returned')),
  carrier text,
  tracking_number text,
  delivered_at timestamptz
);
create index on public.order_items (order_id);
create index on public.order_items (seller_id);

create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);
create index on public.order_events (order_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  provider text not null,
  provider_ref text unique,
  amount_dzd integer not null check (amount_dzd >= 0),
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

-- ---------- Money: escrow-like ledger ----------
create table public.seller_ledger (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id),
  order_item_id uuid references public.order_items(id),
  type text not null check (type in ('sale','commission','payout','refund','adjustment')),
  amount_dzd integer not null, -- signed: sales positive, commission/payout/refund negative
  status text not null default 'pending' check (status in ('pending','available','paid')),
  available_at timestamptz,    -- set after delivery + return window
  created_at timestamptz not null default now()
);
create index on public.seller_ledger (seller_id, status);

create table public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id),
  amount_dzd integer not null check (amount_dzd > 0),
  method text not null check (method in ('rib','ccp')),
  account_details text not null, -- treat as sensitive; only the owner and admins can read it
  status text not null default 'requested' check (status in ('requested','approved','paid','rejected')),
  created_at timestamptz not null default now()
);

-- ---------- Trust and support ----------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  seller_id uuid not null references public.sellers(id),
  buyer_id uuid not null references public.profiles(id),
  order_item_id uuid not null unique references public.order_items(id),
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table public.wishlist (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  primary key (user_id, product_id)
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id),
  type text not null check (type in ('order','return','payment','seller_complaint','other')),
  order_id uuid references public.orders(id),
  subject text not null,
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status text not null default 'open' check (status in ('open','pending','resolved','closed')),
  assigned_to uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index on public.tickets (status, priority);

create table public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.ticket_messages (ticket_id);

create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id),
  opened_by uuid not null references public.profiles(id),
  reason text not null,
  evidence_urls jsonb not null default '[]'::jsonb,
  status text not null default 'open' check (status in ('open','escalated','refunded','rejected')),
  resolution text,
  resolved_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id),
  reason text not null,
  status text not null default 'open' check (status in ('open','actioned','dismissed')),
  created_at timestamptz not null default now()
);

-- ---------- Platform ----------
create table public.platform_settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default false
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on public.audit_logs (created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.notifications (user_id, read);

-- ---------- New auth user -> profile ----------
-- SECURITY: the role is never taken blindly from client metadata.
-- Only 'buyer' and 'seller' can be chosen at sign-up. support/admin are assigned by an admin.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  meta_phone text := meta->>'phone';
begin
  insert into public.profiles (id, role, full_name, phone, language)
  values (
    new.id,
    case when meta->>'role' = 'seller' then 'seller' else 'buyer' end,
    nullif(meta->>'full_name', ''),
    case when meta_phone ~ '^0[567][0-9]{8}$' then meta_phone else null end,
    case when meta->>'language' = 'fr' then 'fr' else 'ar' end
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
