-- QuantaLab Supabase auth + dashboard activity schema
-- Safe to run in the Supabase SQL editor. Uses auth.users(id) as the user source of truth.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'user_activity_type'
      and n.nspname = 'public'
  ) then
    create type public.user_activity_type as enum (
      'login',
      'logout',
      'debugger_run_created',
      'experiment_created',
      'circuit_simulated',
      'research_note_created',
      'profile_updated'
    );
  end if;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  organization text,
  role text default 'researcher',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type public.user_activity_type not null,
  entity_id uuid,
  entity_type text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experiments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  qasm_code text,
  backend text not null default 'qasm_simulator',
  shots integer not null default 1024 check (shots > 0),
  seed integer,
  current_version integer not null default 1,
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.debugger_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  experiment_id uuid references public.experiments(id) on delete set null,
  qasm_code text not null,
  summary text,
  circuit_depth integer,
  num_qubits integer,
  total_gates integer,
  scalability_risk text,
  risk_score numeric,
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.circuit_simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  experiment_id uuid references public.experiments(id) on delete set null,
  qasm_code text,
  backend text not null default 'qasm_simulator',
  shots integer not null default 1024 check (shots > 0),
  fidelity numeric,
  execution_time_ms numeric,
  counts jsonb not null default '{}'::jsonb,
  probabilities jsonb not null default '[]'::jsonb,
  amplitudes jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.research_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  experiment_id uuid references public.experiments(id) on delete set null,
  debugger_run_id uuid references public.debugger_runs(id) on delete set null,
  circuit_simulation_id uuid references public.circuit_simulations(id) on delete set null,
  title text not null,
  body text not null default '',
  tags text[] not null default array[]::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists user_activity_set_updated_at on public.user_activity;
create trigger user_activity_set_updated_at before update on public.user_activity
  for each row execute function public.set_updated_at();

drop trigger if exists experiments_set_updated_at on public.experiments;
create trigger experiments_set_updated_at before update on public.experiments
  for each row execute function public.set_updated_at();

drop trigger if exists debugger_runs_set_updated_at on public.debugger_runs;
create trigger debugger_runs_set_updated_at before update on public.debugger_runs
  for each row execute function public.set_updated_at();

drop trigger if exists circuit_simulations_set_updated_at on public.circuit_simulations;
create trigger circuit_simulations_set_updated_at before update on public.circuit_simulations
  for each row execute function public.set_updated_at();

drop trigger if exists research_notes_set_updated_at on public.research_notes;
create trigger research_notes_set_updated_at before update on public.research_notes
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.user_activity enable row level security;
alter table public.experiments enable row level security;
alter table public.debugger_runs enable row level security;
alter table public.circuit_simulations enable row level security;
alter table public.research_notes enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can read own activity" on public.user_activity;
create policy "Users can read own activity" on public.user_activity
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own activity" on public.user_activity;
create policy "Users can insert own activity" on public.user_activity
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own activity" on public.user_activity;
create policy "Users can update own activity" on public.user_activity
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete own activity" on public.user_activity;
create policy "Users can delete own activity" on public.user_activity
  for delete using (auth.uid() = user_id);

drop policy if exists "Users manage own experiments" on public.experiments;
create policy "Users manage own experiments" on public.experiments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own debugger runs" on public.debugger_runs;
create policy "Users manage own debugger runs" on public.debugger_runs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own circuit simulations" on public.circuit_simulations;
create policy "Users manage own circuit simulations" on public.circuit_simulations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own research notes" on public.research_notes;
create policy "Users manage own research notes" on public.research_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists user_activity_user_created_idx on public.user_activity (user_id, created_at desc);
create index if not exists user_activity_type_idx on public.user_activity (activity_type);
create index if not exists experiments_user_created_idx on public.experiments (user_id, created_at desc);
create index if not exists debugger_runs_user_created_idx on public.debugger_runs (user_id, created_at desc);
create index if not exists debugger_runs_experiment_idx on public.debugger_runs (experiment_id);
create index if not exists circuit_simulations_user_created_idx on public.circuit_simulations (user_id, created_at desc);
create index if not exists circuit_simulations_experiment_idx on public.circuit_simulations (experiment_id);
create index if not exists research_notes_user_created_idx on public.research_notes (user_id, created_at desc);
create index if not exists research_notes_experiment_idx on public.research_notes (experiment_id);
