create table if not exists public.agent_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 300),
  description text,
  due_at timestamptz,
  status text not null default 'open' check (status in ('open','in_progress','done','cancelled')),
  source text not null default 'angel',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists agent_tasks_user_status_idx on public.agent_tasks(user_id,status,due_at);

create table if not exists public.agent_approvals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_name text not null check (char_length(action_name) between 1 and 120),
  action_input jsonb not null default '{}'::jsonb,
  risk_level text not null default 'high' check (risk_level in ('low','medium','high','critical')),
  status text not null default 'pending' check (status in ('pending','approved','rejected','expired')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
create index if not exists agent_approvals_user_status_idx on public.agent_approvals(user_id,status,created_at desc);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task text not null,
  status text not null default 'running' check (status in ('running','completed','failed','needs_approval')),
  provider text,
  model text,
  steps jsonb not null default '[]'::jsonb,
  result jsonb,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists agent_runs_user_created_idx on public.agent_runs(user_id,created_at desc);

create table if not exists public.assistant_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,79}$'),
  description text not null default '',
  system_prompt text not null default '',
  tools text[] not null default '{}',
  visibility text not null default 'private' check (visibility in ('private','unlisted','public')),
  published_at timestamptz,
  installs_count integer not null default 0 check (installs_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists assistant_profiles_public_idx on public.assistant_profiles(visibility,published_at desc);
create index if not exists assistant_profiles_owner_idx on public.assistant_profiles(owner_id,updated_at desc);

create table if not exists public.assistant_installs (
  assistant_id uuid not null references public.assistant_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (assistant_id,user_id)
);

alter table public.agent_tasks enable row level security;
alter table public.agent_approvals enable row level security;
alter table public.agent_runs enable row level security;
alter table public.assistant_profiles enable row level security;
alter table public.assistant_installs enable row level security;

drop policy if exists "agent_tasks_owner" on public.agent_tasks;
create policy "agent_tasks_owner" on public.agent_tasks for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "agent_approvals_owner" on public.agent_approvals;
create policy "agent_approvals_owner" on public.agent_approvals for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "agent_runs_owner" on public.agent_runs;
create policy "agent_runs_owner" on public.agent_runs for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "assistant_profiles_public_read" on public.assistant_profiles;
create policy "assistant_profiles_public_read" on public.assistant_profiles for select to anon, authenticated using (visibility = 'public' or owner_id = (select auth.uid()));
drop policy if exists "assistant_profiles_owner_write" on public.assistant_profiles;
create policy "assistant_profiles_owner_write" on public.assistant_profiles for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists "assistant_profiles_owner_update" on public.assistant_profiles;
create policy "assistant_profiles_owner_update" on public.assistant_profiles for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists "assistant_profiles_owner_delete" on public.assistant_profiles;
create policy "assistant_profiles_owner_delete" on public.assistant_profiles for delete to authenticated using (owner_id = (select auth.uid()));
drop policy if exists "assistant_installs_owner" on public.assistant_installs;
create policy "assistant_installs_owner" on public.assistant_installs for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.agent_tasks from anon;
revoke all on public.agent_approvals from anon;
revoke all on public.agent_runs from anon;
revoke all on public.assistant_installs from anon;
grant select on public.assistant_profiles to anon;
grant all on public.agent_tasks,public.agent_approvals,public.agent_runs,public.assistant_profiles,public.assistant_installs to authenticated;

create or replace function public.set_agent_task_updated_at() returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists set_agent_tasks_updated_at on public.agent_tasks;
create trigger set_agent_tasks_updated_at before update on public.agent_tasks for each row execute function public.set_agent_task_updated_at();
