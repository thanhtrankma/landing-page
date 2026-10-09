-- Online wedding invitations (/cong-cu/thiep-cuoi-online → /thiep/<slug>): run once in Supabase → SQL Editor.
-- Same model as schema.sql: RLS on with no policies, only the server (secret key) reaches these tables.

create extension if not exists pgcrypto;

create table if not exists public.invitations (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  edit_token_hash text not null,                 -- sha256 of the token; the token itself is never stored
  slug            text not null unique,          -- public link: /thiep/<slug>
  published       boolean not null default true,
  data            jsonb not null,                -- InviteData; image/music URLs stored as "r2:<key>"
  view_count      integer not null default 0,
  ip              text
);
create index if not exists invitations_updated_idx on public.invitations (updated_at desc);

-- Wishes and RSVPs left by guests on the invitation page.
create table if not exists public.invitation_wishes (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  name          text not null,
  message       text not null default '',
  attend        text,                            -- yes | no | maybe | null
  guests        integer not null default 1,
  hidden        boolean not null default false,  -- the couple can hide a wish from the public page
  ip            text
);
create index if not exists invitation_wishes_inv_idx on public.invitation_wishes (invitation_id, created_at desc);

alter table public.invitations       enable row level security;
alter table public.invitation_wishes enable row level security;
