-- ============================================================================
-- Aurora / Perform Anywhere — COMPLETE initial database setup
-- ============================================================================
-- Run this ONCE in the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/dgtnkkarlwufxawfaybb/sql/new
--
-- This creates everything the app needs: tables, storage buckets, access
-- policies, and the credit functions. It is idempotent — safe to run again.
-- It only CREATES things; it never drops or deletes your data.
--
-- Identity model: the app has no login. Each browser gets a random `client_id`
-- (a UUID) that scopes its own data. The app talks to Supabase with the public
-- (anon) key from both the browser and the server, so the policies below allow
-- the anon role to operate on these tables/buckets.
-- ============================================================================

-- ── Required extension for gen_random_uuid() (Supabase usually has it) ───────
create extension if not exists pgcrypto;

-- ── Shared helper: auto-update updated_at on row changes ─────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── projects ────────────────────────────────────────────────────────────────
create table if not exists public.projects (
  id              uuid primary key default gen_random_uuid(),
  client_id       text not null,
  title           text,
  status          text not null default 'draft',
  provider        text,
  selected_model  text,
  output_path     text,
  enhanced_prompt text,
  scene_prompt    text,
  style_prompt    text,
  error_message   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists projects_client_id_idx on public.projects (client_id);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ── project_assets (uploaded reference files) ───────────────────────────────
create table if not exists public.project_assets (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  client_id    text,
  kind         text not null,
  storage_path text not null,
  mime_type    text,
  created_at   timestamptz not null default now(),
  unique (project_id, kind)
);
create index if not exists project_assets_project_id_idx on public.project_assets (project_id);

-- ── project_renders (per-attempt render history) ────────────────────────────
create table if not exists public.project_renders (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references public.projects (id) on delete cascade,
  client_id        text,
  provider         text,
  status           text not null default 'queued',
  prompt           text,
  output_path      text,
  provider_task_id text,
  error_message    text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists project_renders_project_id_idx on public.project_renders (project_id);

drop trigger if exists project_renders_set_updated_at on public.project_renders;
create trigger project_renders_set_updated_at
  before update on public.project_renders
  for each row execute function public.set_updated_at();

-- ── generations (text/image generation log) ─────────────────────────────────
create table if not exists public.generations (
  id            uuid primary key default gen_random_uuid(),
  client_id     text not null,
  modality      text,
  model         text,
  provider      text,
  prompt        text,
  options       jsonb not null default '{}'::jsonb,
  credits_used  numeric not null default 0,
  status        text not null default 'running',
  output_text   text,
  output_url    text,
  duration_ms   integer,
  error_message text,
  created_at    timestamptz not null default now()
);
create index if not exists generations_client_id_idx on public.generations (client_id);

-- ── credit_wallets (per-client credit balance) ──────────────────────────────
create table if not exists public.credit_wallets (
  client_id          text primary key,
  balance            numeric not null default 0,
  lifetime_purchased numeric not null default 0,
  lifetime_spent     numeric not null default 0,
  updated_at         timestamptz not null default now()
);

drop trigger if exists credit_wallets_set_updated_at on public.credit_wallets;
create trigger credit_wallets_set_updated_at
  before update on public.credit_wallets
  for each row execute function public.set_updated_at();

-- ── purchases (Paystack top-ups) ────────────────────────────────────────────
create table if not exists public.purchases (
  id                 uuid primary key default gen_random_uuid(),
  client_id          text not null,
  paystack_reference text unique,
  amount_paid_minor  bigint,
  currency           text default 'NGN',
  credits_allocated  numeric,
  raw_event          jsonb,
  created_at         timestamptz not null default now()
);

-- ── credit_ledger (audit trail for credit grants/spends) ────────────────────
create table if not exists public.credit_ledger (
  id            uuid primary key default gen_random_uuid(),
  client_id     text not null,
  amount        numeric not null,
  reason        text,
  description   text,
  generation_id uuid,
  purchase_id   uuid,
  created_at    timestamptz not null default now()
);

-- ── Credit functions (called via supabase.rpc) ──────────────────────────────
create or replace function public.grant_credits(
  _client_id text, _amount numeric, _reason text, _description text, _purchase_id uuid
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.credit_wallets (client_id, balance, lifetime_purchased)
  values (_client_id, _amount, case when _reason = 'purchase' then _amount else 0 end)
  on conflict (client_id) do update
    set balance = public.credit_wallets.balance + _amount,
        lifetime_purchased = public.credit_wallets.lifetime_purchased
          + (case when _reason = 'purchase' then _amount else 0 end),
        updated_at = now();
  insert into public.credit_ledger (client_id, amount, reason, description, purchase_id)
  values (_client_id, _amount, _reason, _description, _purchase_id);
end;
$$;

create or replace function public.spend_credits(
  _client_id text, _amount numeric, _reason text, _description text, _generation_id uuid
) returns void language plpgsql security definer set search_path = public as $$
declare
  cur numeric;
begin
  select balance into cur from public.credit_wallets where client_id = _client_id for update;
  if cur is null or cur < _amount then
    raise exception 'insufficient_credits';
  end if;
  update public.credit_wallets
    set balance = balance - _amount,
        lifetime_spent = lifetime_spent + _amount,
        updated_at = now()
    where client_id = _client_id;
  insert into public.credit_ledger (client_id, amount, reason, description, generation_id)
  values (_client_id, -_amount, _reason, _description, _generation_id);
end;
$$;

-- ── Row Level Security: allow the anon/authenticated roles full access ───────
-- (The app's security model is client_id-based, not auth-based; the anon key is
--  intentionally used from the browser. Permissive policies keep PostgREST happy
--  without the "RLS disabled" warning.)
do $$
declare t text;
begin
  foreach t in array array[
    'projects','project_assets','project_renders',
    'generations','credit_wallets','purchases','credit_ledger'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists anon_all_%I on public.%I;', t, t);
    execute format(
      'create policy anon_all_%I on public.%I for all to anon, authenticated using (true) with check (true);',
      t, t
    );
  end loop;
end;
$$;

-- ── Grants (Supabase usually sets these via default privileges; explicit = safe)
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant execute on function public.grant_credits(text, numeric, text, text, uuid) to anon, authenticated;
grant execute on function public.spend_credits(text, numeric, text, text, uuid) to anon, authenticated;

-- ── Storage buckets (private; the app generates signed URLs) ─────────────────
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('renders', 'renders', false)
  on conflict (id) do nothing;

-- Allow the anon/authenticated roles to read/write objects in these buckets
drop policy if exists anon_storage_uploads_renders on storage.objects;
create policy anon_storage_uploads_renders on storage.objects
  for all to anon, authenticated
  using (bucket_id in ('uploads', 'renders'))
  with check (bucket_id in ('uploads', 'renders'));

-- ── Done. Verify the tables now exist: ──────────────────────────────────────
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'projects','project_assets','project_renders',
    'generations','credit_wallets','purchases','credit_ledger'
  )
order by table_name;
