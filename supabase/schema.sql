-- ============================================================
-- Cadence Creative Media Platform — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── Profiles (extends auth.users) ───────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null default '',
  email        text not null default '',
  role         text not null default 'Member',
  job_title    text not null default '',
  department   text not null default '',
  permissions  jsonb not null default '[]',
  avatar_color text not null default 'bg-blue-500',
  created_at   timestamptz default now()
);

-- ── Briefs ───────────────────────────────────────────────────
create table if not exists public.briefs (
  id                 uuid primary key default gen_random_uuid(),
  product            text not null default '',
  marketing_angle    text not null default '',
  buyer_persona      text not null default '',
  format             text not null default 'Video 30s',
  hook               text not null default '',
  cta                text not null default '',
  landing_page_url   text not null default '',
  assigned_to        text not null default '',
  due_date           text not null default '',
  media_buyer_owner  text not null default '',
  status             text not null default 'Draft',
  created_at         timestamptz default now()
);

-- ── Launches ─────────────────────────────────────────────────
create table if not exists public.launches (
  id                 uuid primary key default gen_random_uuid(),
  brief_id           uuid references public.briefs(id) on delete set null,
  creative_files     text not null default '',
  product            text not null default '',
  marketing_angle    text not null default '',
  media_buyer        text not null default '',
  ad_account         text not null default '',
  campaign_name      text not null default '',
  ad_set_name        text not null default '',
  facebook_page      text not null default '',
  ad_copy_version    text not null default '',
  landing_page_url   text not null default '',
  daily_budget       numeric not null default 0,
  test_duration      int not null default 3,
  launch_date        text not null default '',
  kill_date          text not null default '',
  audience_targeting text not null default '',
  placement          text not null default '',
  status             text not null default 'Pending'
);

-- ── Reworks ──────────────────────────────────────────────────
create table if not exists public.reworks (
  id                 uuid primary key default gen_random_uuid(),
  brief_id           text not null default '',
  creative_file_name text not null default '',
  rework_reason      text not null default '',
  whats_missing      text not null default '',
  reference          text not null default '',
  priority           text not null default 'Normal',
  new_version_due    text not null default '',
  media_buyer        text not null default '',
  status             text not null default 'Open',
  created_at         timestamptz default now()
);

-- ── KPI Reports ──────────────────────────────────────────────
create table if not exists public.kpi_reports (
  id               uuid primary key default gen_random_uuid(),
  launch_card_id   text not null default '',
  creative_file    text not null default '',
  product          text not null default '',
  media_buyer      text not null default '',
  angle            text not null default '',
  spend            numeric not null default 0,
  impressions      int not null default 0,
  cpm              numeric not null default 0,
  hook_rate        numeric not null default 0,
  outbound_ctr     numeric not null default 0,
  lp_ctr           numeric not null default 0,
  add_to_cart_rate numeric not null default 0,
  roas             numeric not null default 0,
  frequency        numeric not null default 0,
  scenario         text,
  reported_at      timestamptz default now()
);

-- ── Weekly Reports ───────────────────────────────────────────
create table if not exists public.weekly_reports (
  id                         uuid primary key default gen_random_uuid(),
  media_buyer                text not null default '',
  product                    text not null default '',
  week_ending                text not null default '',
  total_creatives_tested     int not null default 0,
  total_spend                numeric not null default 0,
  angle_summary              text not null default '',
  winners                    text not null default '',
  underperformers            text not null default '',
  rework_requests            text not null default '',
  new_angle_recommendations  text not null default '',
  created_at                 timestamptz default now()
);

-- ── Row Level Security ───────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.briefs        enable row level security;
alter table public.launches      enable row level security;
alter table public.reworks       enable row level security;
alter table public.kpi_reports   enable row level security;
alter table public.weekly_reports enable row level security;

-- Authenticated users can do everything (internal tool)
create policy "auth_all" on public.profiles      for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.briefs        for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.launches      for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.reworks       for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.kpi_reports   for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.weekly_reports for all using (auth.role() = 'authenticated');

-- ── Auto-create profile on signup ────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role, job_title, department, permissions, avatar_color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'Member',
    '',
    '',
    '[
      {"page":"dashboard","actions":["view"]},
      {"page":"briefs","actions":["view","create"]},
      {"page":"launches","actions":["view"]},
      {"page":"kpi","actions":["view"]},
      {"page":"reworks","actions":["view","create"]},
      {"page":"reports","actions":["view"]},
      {"page":"team","actions":[]}
    ]'::jsonb,
    'bg-blue-500'
  );
  return new;
end;
$$;

-- Drop trigger if exists, then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
