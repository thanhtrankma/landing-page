-- Sales & stock book ("Quản lý bán hàng" tool). Run once in Supabase → SQL Editor (after invites-v2.sql,
-- which creates app_users). Same model as schema.sql: RLS on with no policies; only the server (secret key) reads.

-- One document per account: products, suppliers, stock in/out vouchers and notes. `version` is bumped on
-- every save so two devices editing at once cannot silently overwrite each other.
create table if not exists public.shop_books (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id    uuid not null unique references public.app_users(id) on delete cascade,
  data       jsonb not null default '{}',
  version    integer not null default 1
);

alter table public.shop_books enable row level security;
