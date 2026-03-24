-- ============================================================================
-- Migration 001 – Core commerce tables
-- Boutiki V1 – Roles: admin, merchant – Prices: FCFA integer
-- ============================================================================

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ============================================================================
-- Helper: auto-update updated_at
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- 1. profiles  (extends auth.users)
-- ============================================================================
create type public.app_role as enum ('admin', 'merchant');

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        public.app_role not null default 'merchant',
  full_name   text,
  avatar_url  text,
  phone       text,
  locale      text not null default 'fr',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Admins full access on profiles"
  on public.profiles for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Users read/update own profile"
  on public.profiles for all
  using ( auth.uid() = id )
  with check ( auth.uid() = id );

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 2. merchants
-- ============================================================================
create type public.merchant_verification_status as enum ('pending', 'verified', 'rejected');

create table public.merchants (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid not null unique references public.profiles(id) on delete cascade,
  business_name       text not null,
  business_email      text,
  whatsapp_phone      text,
  city                text,
  neighborhood        text,
  description         text,
  verification_status public.merchant_verification_status not null default 'pending',
  verified_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.merchants enable row level security;

create policy "Admins full access on merchants"
  on public.merchants for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Merchant reads own record"
  on public.merchants for select
  using ( profile_id = auth.uid() );

create policy "Merchant updates own record"
  on public.merchants for update
  using ( profile_id = auth.uid() )
  with check ( profile_id = auth.uid() );

create trigger merchants_updated_at
  before update on public.merchants
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 3. shops
-- ============================================================================
create type public.shop_status as enum ('active', 'pending', 'suspended');

create table public.shops (
  id              uuid primary key default gen_random_uuid(),
  merchant_id     uuid not null references public.merchants(id) on delete cascade,
  name            text not null,
  slug            text not null unique,
  description     text,
  city            text,
  neighborhood    text,
  opening_hours   text,
  logo_url        text,
  cover_image_url text,
  whatsapp_phone  text,
  status          public.shop_status not null default 'pending',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_shops_merchant on public.shops(merchant_id);
create index idx_shops_status   on public.shops(status);

alter table public.shops enable row level security;

create policy "Admins full access on shops"
  on public.shops for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Merchant manages own shops"
  on public.shops for all
  using ( merchant_id in (select id from public.merchants where profile_id = auth.uid()) )
  with check ( merchant_id in (select id from public.merchants where profile_id = auth.uid()) );

create policy "Public reads active shops"
  on public.shops for select
  using ( status = 'active' );

create trigger shops_updated_at
  before update on public.shops
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. categories
-- ============================================================================
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  shop_id    uuid not null references public.shops(id) on delete cascade,
  name       text not null,
  slug       text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, slug)
);

create index idx_categories_shop on public.categories(shop_id);

alter table public.categories enable row level security;

create policy "Admins full access on categories"
  on public.categories for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Merchant manages own categories"
  on public.categories for all
  using ( shop_id in (select id from public.shops where merchant_id in (select id from public.merchants where profile_id = auth.uid())) )
  with check ( shop_id in (select id from public.shops where merchant_id in (select id from public.merchants where profile_id = auth.uid())) );

create policy "Public reads categories"
  on public.categories for select
  using ( true );

create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 5. products
-- ============================================================================
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references public.shops(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name        text not null,
  description text,
  price       integer not null check (price >= 0),
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_products_shop     on public.products(shop_id);
create index idx_products_category on public.products(category_id);
create index idx_products_active   on public.products(shop_id, is_active);

alter table public.products enable row level security;

create policy "Admins full access on products"
  on public.products for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Merchant manages own products"
  on public.products for all
  using ( shop_id in (select id from public.shops where merchant_id in (select id from public.merchants where profile_id = auth.uid())) )
  with check ( shop_id in (select id from public.shops where merchant_id in (select id from public.merchants where profile_id = auth.uid())) );

create policy "Public reads active products"
  on public.products for select
  using ( is_active = true );

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 6. product_media
-- ============================================================================
create table public.product_media (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url        text not null,
  type       text not null default 'image' check (type in ('image', 'video')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_product_media_product on public.product_media(product_id);

alter table public.product_media enable row level security;

create policy "Admins full access on product_media"
  on public.product_media for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Merchant manages own product media"
  on public.product_media for all
  using ( product_id in (select id from public.products where shop_id in (select id from public.shops where merchant_id in (select id from public.merchants where profile_id = auth.uid()))) )
  with check ( product_id in (select id from public.products where shop_id in (select id from public.shops where merchant_id in (select id from public.merchants where profile_id = auth.uid()))) );

create policy "Public reads product media"
  on public.product_media for select
  using ( true );

-- ============================================================================
-- 7. customers  (per shop, identified by phone)
-- ============================================================================
create table public.customers (
  id         uuid primary key default gen_random_uuid(),
  shop_id    uuid not null references public.shops(id) on delete cascade,
  name       text not null,
  phone      text not null,
  notes      text,
  tags       text[] not null default '{}',
  is_vip     boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, phone)
);

create index idx_customers_shop  on public.customers(shop_id);
create index idx_customers_phone on public.customers(phone);

alter table public.customers enable row level security;

create policy "Admins full access on customers"
  on public.customers for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Merchant manages own customers"
  on public.customers for all
  using ( shop_id in (select id from public.shops where merchant_id in (select id from public.merchants where profile_id = auth.uid())) )
  with check ( shop_id in (select id from public.shops where merchant_id in (select id from public.merchants where profile_id = auth.uid())) );

create trigger customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 8. customer_addresses
-- ============================================================================
create table public.customer_addresses (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label       text not null default 'Domicile',
  city        text,
  neighborhood text,
  street      text,
  details     text,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_customer_addresses_customer on public.customer_addresses(customer_id);

alter table public.customer_addresses enable row level security;

create policy "Admins full access on customer_addresses"
  on public.customer_addresses for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Merchant manages own customer addresses"
  on public.customer_addresses for all
  using ( customer_id in (select id from public.customers where shop_id in (select id from public.shops where merchant_id in (select id from public.merchants where profile_id = auth.uid()))) )
  with check ( customer_id in (select id from public.customers where shop_id in (select id from public.shops where merchant_id in (select id from public.merchants where profile_id = auth.uid()))) );

-- ============================================================================
-- 9. orders
-- ============================================================================
create type public.order_status as enum (
  'new', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'
);
create type public.delivery_type as enum ('delivery', 'pickup');
create type public.order_channel as enum ('whatsapp', 'store_link');

create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  shop_id         uuid not null references public.shops(id) on delete cascade,
  customer_id     uuid references public.customers(id) on delete set null,
  public_ref      text not null unique,
  tracking_token  text not null unique default encode(gen_random_bytes(12), 'hex'),
  status          public.order_status not null default 'new',
  delivery_type   public.delivery_type not null default 'delivery',
  channel         public.order_channel not null default 'whatsapp',
  customer_name   text not null,
  customer_phone  text not null,
  address         text,
  note            text,
  total           integer not null default 0 check (total >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_orders_shop       on public.orders(shop_id);
create index idx_orders_customer   on public.orders(customer_id);
create index idx_orders_status     on public.orders(status);
create index idx_orders_created_at on public.orders(created_at desc);
create index idx_orders_public_ref on public.orders(public_ref);

alter table public.orders enable row level security;

create policy "Admins full access on orders"
  on public.orders for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Merchant manages own orders"
  on public.orders for all
  using ( shop_id in (select id from public.shops where merchant_id in (select id from public.merchants where profile_id = auth.uid())) )
  with check ( shop_id in (select id from public.shops where merchant_id in (select id from public.merchants where profile_id = auth.uid())) );

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 10. order_items  (snapshot of product at order time)
-- ============================================================================
create table public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price   integer not null check (unit_price >= 0),
  quantity     integer not null default 1 check (quantity > 0),
  subtotal     integer not null check (subtotal >= 0),
  created_at   timestamptz not null default now()
);

create index idx_order_items_order on public.order_items(order_id);

alter table public.order_items enable row level security;

create policy "Admins full access on order_items"
  on public.order_items for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Merchant reads own order items"
  on public.order_items for select
  using ( order_id in (select id from public.orders where shop_id in (select id from public.shops where merchant_id in (select id from public.merchants where profile_id = auth.uid()))) );

-- ============================================================================
-- 11. order_status_history
-- ============================================================================
create table public.order_status_history (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  old_status public.order_status,
  new_status public.order_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  note       text,
  created_at timestamptz not null default now()
);

create index idx_order_status_history_order on public.order_status_history(order_id);

alter table public.order_status_history enable row level security;

create policy "Admins full access on order_status_history"
  on public.order_status_history for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Merchant reads own order history"
  on public.order_status_history for select
  using ( order_id in (select id from public.orders where shop_id in (select id from public.shops where merchant_id in (select id from public.merchants where profile_id = auth.uid()))) );

-- ============================================================================
-- 12. payments
-- ============================================================================
create type public.payment_method as enum ('stripe', 'mobile_money', 'cash');
create type public.payment_status as enum ('pending', 'completed', 'failed', 'refunded');

create table public.payments (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders(id) on delete cascade,
  method         public.payment_method not null,
  status         public.payment_status not null default 'pending',
  amount         integer not null check (amount >= 0),
  provider_ref   text,
  provider_meta  jsonb,
  paid_at        timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_payments_order  on public.payments(order_id);
create index idx_payments_status on public.payments(status);

alter table public.payments enable row level security;

create policy "Admins full access on payments"
  on public.payments for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Merchant reads own payments"
  on public.payments for select
  using ( order_id in (select id from public.orders where shop_id in (select id from public.shops where merchant_id in (select id from public.merchants where profile_id = auth.uid()))) );

create trigger payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 13. subscription_plans
-- ============================================================================
create table public.subscription_plans (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  description     text,
  price_monthly   integer not null default 0 check (price_monthly >= 0),
  price_yearly    integer,
  features        jsonb not null default '[]',
  is_active       boolean not null default true,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.subscription_plans enable row level security;

create policy "Admins manage subscription plans"
  on public.subscription_plans for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Anyone reads active plans"
  on public.subscription_plans for select
  using ( is_active = true );

create trigger subscription_plans_updated_at
  before update on public.subscription_plans
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 14. merchant_subscriptions
-- ============================================================================
create type public.subscription_status as enum ('active', 'past_due', 'cancelled', 'trialing');

create table public.merchant_subscriptions (
  id              uuid primary key default gen_random_uuid(),
  merchant_id     uuid not null references public.merchants(id) on delete cascade,
  plan_id         uuid not null references public.subscription_plans(id) on delete restrict,
  status          public.subscription_status not null default 'trialing',
  current_period_start timestamptz not null default now(),
  current_period_end   timestamptz not null,
  cancel_at       timestamptz,
  stripe_sub_id   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_merchant_subs_merchant on public.merchant_subscriptions(merchant_id);
create index idx_merchant_subs_status   on public.merchant_subscriptions(status);

alter table public.merchant_subscriptions enable row level security;

create policy "Admins full access on merchant_subscriptions"
  on public.merchant_subscriptions for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Merchant reads own subscriptions"
  on public.merchant_subscriptions for select
  using ( merchant_id in (select id from public.merchants where profile_id = auth.uid()) );

create trigger merchant_subscriptions_updated_at
  before update on public.merchant_subscriptions
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 15. analytics_events
-- ============================================================================
create table public.analytics_events (
  id         uuid primary key default gen_random_uuid(),
  shop_id    uuid references public.shops(id) on delete cascade,
  event_type text not null,
  payload    jsonb not null default '{}',
  actor_id   uuid references public.profiles(id) on delete set null,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index idx_analytics_events_shop       on public.analytics_events(shop_id);
create index idx_analytics_events_type       on public.analytics_events(event_type);
create index idx_analytics_events_created_at on public.analytics_events(created_at desc);

alter table public.analytics_events enable row level security;

create policy "Admins full access on analytics_events"
  on public.analytics_events for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Merchant reads own analytics"
  on public.analytics_events for select
  using ( shop_id in (select id from public.shops where merchant_id in (select id from public.merchants where profile_id = auth.uid())) );

-- ============================================================================
-- Auto-create profile on auth.users insert
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'merchant')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
