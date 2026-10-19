-- Online invitations v2: accounts, dashboard, members, guests & RSVP. Run once in Supabase → SQL Editor
-- (after invites.sql). Same model as schema.sql: RLS on with no policies; only the server (secret key) reads.

create extension if not exists pgcrypto;

-- ───────────── accounts ─────────────
create table if not exists public.app_users (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  email         text not null unique,                 -- lower-cased
  name          text not null default '',
  avatar_url    text not null default '',
  google_sub    text unique,
  last_login_at timestamptz
);

-- One-time login codes sent by email (only the hash is stored).
create table if not exists public.login_codes (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email      text not null,
  code_hash  text not null,
  expires_at timestamptz not null,
  attempts   integer not null default 0,
  used       boolean not null default false
);
create index if not exists login_codes_email_idx on public.login_codes (email, created_at desc);

-- ───────────── invitations ─────────────
alter table public.invitations add column if not exists owner_id uuid references public.app_users(id) on delete set null;
alter table public.invitations add column if not exists status text not null default 'published';  -- draft | published
alter table public.invitations add column if not exists published_at timestamptz;
create index if not exists invitations_owner_idx on public.invitations (owner_id, updated_at desc);

-- People allowed to edit an invitation besides its owner. invited_email lets you add someone before they sign up.
create table if not exists public.invitation_members (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  user_id       uuid references public.app_users(id) on delete cascade,
  invited_email text not null,
  role          text not null default 'editor'
);
create unique index if not exists invitation_members_uniq on public.invitation_members (invitation_id, invited_email);

-- ───────────── guests & RSVP ─────────────
create table if not exists public.guest_groups (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  name          text not null,
  sort_order    integer not null default 0
);
create index if not exists guest_groups_inv_idx on public.guest_groups (invitation_id, sort_order);

create table if not exists public.guests (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  group_id      uuid references public.guest_groups(id) on delete set null,
  code          text not null unique,                 -- short code in the personal link: /thiep/<slug>?k=<code>
  name          text not null,                        -- "Anh Tuấn & Chị Hà"
  greeting      text not null default '',             -- overrides the invitation's default invite line
  max_people    integer,                              -- null = guest decides
  note          text not null default '',
  rsvp_status   text,                                 -- yes | no | maybe | null (not answered)
  rsvp_people   integer,
  rsvp_answers  jsonb not null default '{}',
  rsvp_at       timestamptz,
  opened_at     timestamptz
);
create index if not exists guests_inv_idx on public.guests (invitation_id, created_at);

-- Every RSVP submitted (from a personal link or the general link).
create table if not exists public.rsvps (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  guest_id      uuid references public.guests(id) on delete set null,
  name          text not null,
  status        text not null,                        -- yes | no | maybe
  people        integer not null default 1,
  answers       jsonb not null default '{}',
  ip            text
);
create index if not exists rsvps_inv_idx on public.rsvps (invitation_id, created_at desc);

alter table public.app_users          enable row level security;
alter table public.login_codes        enable row level security;
alter table public.invitation_members enable row level security;
alter table public.guest_groups       enable row level security;
alter table public.guests             enable row level security;
alter table public.rsvps              enable row level security;
