-- SuperLanding admin: run this once in Supabase → SQL Editor.
-- Row Level Security is ON with no policies: the public (anon) key can read/write nothing.
-- Only the server, using SUPABASE_SERVICE_ROLE_KEY, reaches these tables.

create extension if not exists pgcrypto;

-- Contact requests from /lien-he
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  phone       text not null,
  message     text not null,
  status      text not null default 'new',      -- new | contacted | done | spam
  note        text not null default '',
  page        text,
  user_agent  text
);
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

-- News articles
create table if not exists public.posts (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  slug              text not null unique,
  title             text not null,
  category          text not null,               -- thiet-ke-website | toi-uu-hoa-seo | kinh-doanh-online
  img               text not null default '',
  summary           text not null default '',
  content           text not null default '',    -- HTML
  meta_title        text,
  meta_description  text,
  meta_keywords     text,
  service           text not null default 'thiet-ke-website',
  published         boolean not null default true
);
create index if not exists posts_created_idx on public.posts (created_at desc);

-- Portfolio projects and demo templates
create table if not exists public.projects (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  slug              text not null unique,
  title             text not null,
  category          text not null,
  category_label    text not null default '',
  code              text not null default '',
  img               text not null default '',
  demo_url          text,
  description       text not null default '',
  content           text not null default '',
  meta_title        text,
  meta_description  text,
  meta_keywords     text,
  home_order        integer not null default 0,
  hub_order         integer not null default 0,
  sample            boolean not null default false,
  published         boolean not null default true
);

-- Site-wide settings (contact details, social links, pricing plans, FAQ) as JSON per key
create table if not exists public.settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- Anonymous interaction events (page views and clicks). No IP address is stored.
create table if not exists public.events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  type        text not null,                     -- view | click
  path        text not null,
  kind        text,                              -- click kind: tel | mailto | zalo | external | internal | button
  label       text,
  href        text,
  visitor     text,
  referrer    text,
  device      text
);
create index if not exists events_created_idx on public.events (created_at desc);
create index if not exists events_type_idx on public.events (type, created_at desc);

-- Editable legal pages (privacy policy, terms of service)
create table if not exists public.pages (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  description  text,
  content      text not null default '',
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.pages enable row level security;

alter table public.leads    enable row level security;
alter table public.posts    enable row level security;
alter table public.projects enable row level security;
alter table public.settings enable row level security;
alter table public.events   enable row level security;

-- Public bucket for images uploaded from the admin (posts, projects)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;
