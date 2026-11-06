-- Shared sales books: people the owner invited to manage a book with them. Run once in Supabase → SQL Editor
-- (after shop.sql). Same model as schema.sql: RLS on with no policies; only the server (secret key) reads.

-- invited_email lets the owner add someone before they have an account; they get access as soon as they
-- sign in with that email (login codes and Google both prove the address).
create table if not exists public.shop_members (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  book_id       uuid not null references public.shop_books(id) on delete cascade,
  user_id       uuid references public.app_users(id) on delete set null,   -- filled on first visit
  invited_email text not null,                                            -- lower-cased
  role          text not null default 'editor',                           -- editor | viewer
  invited_by    uuid references public.app_users(id) on delete set null
);
create unique index if not exists shop_members_uniq on public.shop_members (book_id, invited_email);
create index if not exists shop_members_email_idx on public.shop_members (invited_email);

alter table public.shop_members enable row level security;
