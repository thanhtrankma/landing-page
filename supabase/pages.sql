-- Run this once in the Supabase SQL Editor if you set the project up before the legal pages existed.
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

