-- Online wedding card tool (/cong-cu/thiep-cuoi-online): run once in Supabase → SQL Editor.
-- Same model as schema.sql: RLS on with no policies, only the server (secret key) reaches these tables.
-- Image URLs inside canvas_json are stored as "r2:<key>" and expanded with R2_PUBLIC_URL when read.

create extension if not exists pgcrypto;

-- Card templates (managed in /admin/mau-thiep)
create table if not exists public.card_templates (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  slug        text not null unique,
  name        text not null,
  tags        text[] not null default '{}',
  width       integer not null,
  height      integer not null,
  canvas_json jsonb not null,
  thumb_key   text not null default '',
  sort_order  integer not null default 0,
  published   boolean not null default false
);
create index if not exists card_templates_pub_idx on public.card_templates (published, sort_order);

-- Designs made by visitors. No accounts: whoever holds the edit token can change the design.
create table if not exists public.card_designs (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  edit_token_hash text not null,                 -- sha256 of the token; the token itself is never stored
  title           text not null default 'Thiệp cưới',
  template_slug   text,
  width           integer not null,
  height          integer not null,
  canvas_json     jsonb not null,
  share_slug      text unique,                   -- null = not shared
  preview_key     text not null default '',      -- JPEG shown on the share page / Open Graph
  meta            jsonb not null default '{}',   -- {groom, bride, date, venue} for titles and previews
  view_count      integer not null default 0,
  ip              text
);
create index if not exists card_designs_updated_idx on public.card_designs (updated_at desc);

alter table public.card_templates enable row level security;
alter table public.card_designs  enable row level security;
