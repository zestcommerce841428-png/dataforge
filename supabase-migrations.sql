-- ============================================================
-- DataForge — Supabase SQL Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Snippets ─────────────────────────────────────────────────
create table if not exists snippets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  content     text not null default '',
  language    text not null default 'text',
  tags        text[] not null default '{}',
  is_public   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table snippets enable row level security;
create policy "Users manage own snippets" on snippets
  using (auth.uid() = user_id);
create policy "Public snippets are readable" on snippets
  for select using (is_public = true);

-- ── Notes ────────────────────────────────────────────────────
create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null default 'Untitled',
  content     text not null default '',
  tags        text[] not null default '{}',
  pinned      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table notes enable row level security;
create policy "Users manage own notes" on notes
  using (auth.uid() = user_id);

-- ── API Keys ─────────────────────────────────────────────────
create table if not exists api_keys (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  name         text not null,
  key_hash     text not null,
  key_prefix   text not null,
  last_used_at timestamptz,
  expires_at   timestamptz,
  created_at   timestamptz not null default now()
);
alter table api_keys enable row level security;
create policy "Users manage own api_keys" on api_keys
  using (auth.uid() = user_id);

-- ── Webhook Endpoints ─────────────────────────────────────────
create table if not exists webhook_endpoints (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null default 'My Webhook',
  created_at timestamptz not null default now()
);
alter table webhook_endpoints enable row level security;
create policy "Users manage own webhook_endpoints" on webhook_endpoints
  using (auth.uid() = user_id);

create table if not exists webhook_requests (
  id           uuid primary key default gen_random_uuid(),
  endpoint_id  uuid references webhook_endpoints(id) on delete cascade not null,
  method       text not null,
  headers      jsonb,
  body         text,
  query_params jsonb,
  ip           text,
  received_at  timestamptz not null default now()
);
alter table webhook_requests enable row level security;
-- Authenticated users read their own
create policy "Users read own webhook_requests" on webhook_requests
  for select using (
    endpoint_id in (
      select id from webhook_endpoints where user_id = auth.uid()
    )
  );
-- Anyone (including anon) can insert — needed for receiving webhooks
create policy "Anyone can post webhook requests" on webhook_requests
  for insert with check (true);
-- Users can delete their own
create policy "Users delete own webhook_requests" on webhook_requests
  for delete using (
    endpoint_id in (
      select id from webhook_endpoints where user_id = auth.uid()
    )
  );

-- ── Cron Monitors ─────────────────────────────────────────────
create table if not exists cron_monitors (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  name           text not null,
  schedule       text not null,
  last_ping_at   timestamptz,
  last_status    text not null default 'pending',
  alert_email    text,
  grace_minutes  int not null default 5,
  created_at     timestamptz not null default now()
);
alter table cron_monitors enable row level security;
create policy "Users manage own cron_monitors" on cron_monitors
  using (auth.uid() = user_id);
-- Allow anon UPDATE so the ping endpoint (service role) can record pings
create policy "Service role can update cron_monitors" on cron_monitors
  for update using (true) with check (true);

-- ── URL Monitors ──────────────────────────────────────────────
create table if not exists url_monitors (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references auth.users(id) on delete cascade not null,
  url                  text not null,
  name                 text not null,
  last_content_hash    text,
  last_checked_at      timestamptz,
  alert_email          text,
  check_interval_hours int not null default 24,
  created_at           timestamptz not null default now()
);
alter table url_monitors enable row level security;
create policy "Users manage own url_monitors" on url_monitors
  using (auth.uid() = user_id);
