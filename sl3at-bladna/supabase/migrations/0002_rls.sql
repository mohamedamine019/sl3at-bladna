-- SL3AT BLADNA - Row Level Security
-- Model: the browser (anon/authenticated key) can only READ what it is allowed to see and write a few
-- low-risk things. Anything money-related (checkout, payments, ledger, payouts approval) is written by
-- server code using the service role key, after server-side validation.

-- ---------- Helpers ----------
create or replace function public.app_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.app_role() = 'admin', false)
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.app_role() in ('support','admin'), false)
$$;

create or replace function public.owns_seller(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.sellers where id = sid and owner_id = auth.uid())
$$;

create or replace function public.is_active_seller(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.sellers where id = sid and owner_id = auth.uid() and status = 'active')
$$;

-- ---------- Guard triggers (RLS cannot compare old vs new values) ----------
create or replace function public.protect_profile_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null for service-role / SQL editor calls, which are trusted.
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Only an admin can change a role';
  end if;
  return new;
end $$;
create trigger protect_profile_role before update on public.profiles
  for each row execute function public.protect_profile_role();

create or replace function public.protect_seller_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_staff() then
    if new.status is distinct from old.status
       or new.plan_code is distinct from old.plan_code
       or new.rating_avg is distinct from old.rating_avg
       or new.rating_count is distinct from old.rating_count
       or new.owner_id is distinct from old.owner_id then
      raise exception 'Sellers cannot change status, plan, rating or owner';
    end if;
  end if;
  -- Only admins may change plans.
  if new.plan_code is distinct from old.plan_code and auth.uid() is not null and not public.is_admin() then
    raise exception 'Only an admin can change a seller plan';
  end if;
  return new;
end $$;
create trigger protect_seller_fields before update on public.sellers
  for each row execute function public.protect_seller_fields();

-- New sellers always start as pending on the free plan.
create or replace function public.force_seller_defaults() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.status := 'pending';
    new.plan_code := 'free';
    new.rating_avg := 0;
    new.rating_count := 0;
  end if;
  return new;
end $$;
create trigger force_seller_defaults before insert on public.sellers
  for each row execute function public.force_seller_defaults();

-- ---------- Enable RLS everywhere ----------
alter table public.wilayas enable row level security;
alter table public.communes enable row level security;
alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.plans enable row level security;
alter table public.sellers enable row level security;
alter table public.seller_subscriptions enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_shipping_wilayas enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.payments enable row level security;
alter table public.seller_ledger enable row level security;
alter table public.payout_requests enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlist enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.disputes enable row level security;
alter table public.reports enable row level security;
alter table public.platform_settings enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

-- ---------- Public reference data ----------
create policy "ref read" on public.wilayas for select using (true);
create policy "ref read" on public.communes for select using (true);
create policy "ref read" on public.categories for select using (true);
create policy "ref read" on public.plans for select using (true);
create policy "admin manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage plans" on public.plans for all using (public.is_admin()) with check (public.is_admin());

create policy "public settings read" on public.platform_settings for select using (is_public or public.is_admin());
create policy "admin settings write" on public.platform_settings for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Profiles ----------
create policy "own profile read" on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "own profile update" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
-- (insert happens only through the handle_new_user trigger; no insert policy on purpose)

create policy "own addresses" on public.addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "staff read addresses" on public.addresses for select using (public.is_staff());

-- ---------- Sellers ----------
create policy "public sees active sellers" on public.sellers for select
  using (status = 'active' or owner_id = auth.uid() or public.is_staff());
create policy "create own store" on public.sellers for insert
  with check (owner_id = auth.uid() and public.app_role() = 'seller');
create policy "update own store" on public.sellers for update
  using (owner_id = auth.uid() or public.is_staff()) with check (owner_id = auth.uid() or public.is_staff());
create policy "admin delete seller" on public.sellers for delete using (public.is_admin());

create policy "own subscription read" on public.seller_subscriptions for select using (public.owns_seller(seller_id) or public.is_staff());
create policy "admin subscription write" on public.seller_subscriptions for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Catalog ----------
create policy "public sees active products" on public.products for select
  using (
    (status = 'active' and exists (select 1 from public.sellers s where s.id = seller_id and s.status = 'active'))
    or public.owns_seller(seller_id) or public.is_staff()
  );
create policy "active seller inserts products" on public.products for insert with check (public.is_active_seller(seller_id));
create policy "active seller updates products" on public.products for update
  using (public.is_active_seller(seller_id) or public.is_staff())
  with check (public.is_active_seller(seller_id) or public.is_staff());
create policy "seller deletes own products" on public.products for delete using (public.owns_seller(seller_id) or public.is_admin());

-- Child tables inherit visibility from the parent product.
create policy "images visible with product" on public.product_images for select
  using (exists (select 1 from public.products p where p.id = product_id));
create policy "seller manages images" on public.product_images for all
  using (exists (select 1 from public.products p where p.id = product_id and public.owns_seller(p.seller_id)))
  with check (exists (select 1 from public.products p where p.id = product_id and public.owns_seller(p.seller_id)));

create policy "variants visible with product" on public.product_variants for select
  using (exists (select 1 from public.products p where p.id = product_id));
create policy "seller manages variants" on public.product_variants for all
  using (exists (select 1 from public.products p where p.id = product_id and public.owns_seller(p.seller_id)))
  with check (exists (select 1 from public.products p where p.id = product_id and public.owns_seller(p.seller_id)));

create policy "shipping wilayas visible with product" on public.product_shipping_wilayas for select
  using (exists (select 1 from public.products p where p.id = product_id));
create policy "seller manages shipping wilayas" on public.product_shipping_wilayas for all
  using (exists (select 1 from public.products p where p.id = product_id and public.owns_seller(p.seller_id)))
  with check (exists (select 1 from public.products p where p.id = product_id and public.owns_seller(p.seller_id)));

-- ---------- Cart / wishlist ----------
create policy "own cart" on public.carts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own cart items" on public.cart_items for all
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));
create policy "own wishlist" on public.wishlist for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Orders (READ ONLY from the client; written by server code with the service role) ----------
create policy "buyer reads own orders" on public.orders for select using (buyer_id = auth.uid() or public.is_staff());
create policy "seller reads orders containing their items" on public.orders for select
  using (exists (select 1 from public.order_items oi where oi.order_id = id and public.owns_seller(oi.seller_id)));

create policy "buyer/seller/staff read items" on public.order_items for select
  using (
    public.owns_seller(seller_id) or public.is_staff()
    or exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
  );

create policy "read events of visible orders" on public.order_events for select
  using (
    public.is_staff()
    or exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
    or exists (select 1 from public.order_items oi where oi.order_id = order_events.order_id and public.owns_seller(oi.seller_id))
  );

create policy "buyer reads own payments" on public.payments for select
  using (public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid()));

-- ---------- Money ----------
create policy "seller reads own ledger" on public.seller_ledger for select using (public.owns_seller(seller_id) or public.is_admin());
-- Support deliberately cannot read payout bank details.
create policy "seller reads own payouts" on public.payout_requests for select using (public.owns_seller(seller_id) or public.is_admin());
create policy "seller requests payout" on public.payout_requests for insert
  with check (public.is_active_seller(seller_id) and status = 'requested');
create policy "admin updates payouts" on public.payout_requests for update using (public.is_admin()) with check (public.is_admin());

-- ---------- Reviews ----------
create policy "reviews are public" on public.reviews for select using (true);
-- Inserts go through the server so we can verify the item was actually delivered to this buyer.

-- ---------- Support ----------
create policy "ticket visible to owner and staff" on public.tickets for select using (requester_id = auth.uid() or public.is_staff());
create policy "create own ticket" on public.tickets for insert with check (requester_id = auth.uid());
create policy "staff updates tickets" on public.tickets for update using (public.is_staff()) with check (public.is_staff());

create policy "messages visible (internal notes hidden from requester)" on public.ticket_messages for select
  using (
    public.is_staff()
    or (not is_internal and exists (select 1 from public.tickets t where t.id = ticket_id and t.requester_id = auth.uid()))
  );
create policy "post message" on public.ticket_messages for insert
  with check (
    author_id = auth.uid()
    and (public.is_staff() or (not is_internal and exists (select 1 from public.tickets t where t.id = ticket_id and t.requester_id = auth.uid())))
  );

create policy "dispute visible" on public.disputes for select
  using (public.is_staff() or opened_by = auth.uid()
         or exists (select 1 from public.order_items oi where oi.id = order_item_id and public.owns_seller(oi.seller_id)));
create policy "open dispute" on public.disputes for insert with check (opened_by = auth.uid());
create policy "staff resolves dispute" on public.disputes for update using (public.is_staff()) with check (public.is_staff());

create policy "report a product" on public.reports for insert with check (reporter_id = auth.uid());
create policy "staff reads reports" on public.reports for select using (public.is_staff() or reporter_id = auth.uid());
create policy "staff updates reports" on public.reports for update using (public.is_staff()) with check (public.is_staff());

-- ---------- Audit + notifications ----------
create policy "admin reads audit" on public.audit_logs for select using (public.is_admin());
-- Audit rows are written by server code (service role) only.

create policy "own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "mark own notifications read" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
