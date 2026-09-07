create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username is null or username ~ '^[A-Za-z0-9_]{3,32}$')
);

create index if not exists messages_user_id_idx on public.messages(user_id);
create index if not exists profiles_username_idx on public.profiles(username);

alter table public.profiles enable row level security;
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
drop policy if exists "Users delete own profile" on public.profiles;
create policy "Users delete own profile" on public.profiles for delete to authenticated using ((select auth.uid()) = id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at before update on public.conversations for each row execute function public.set_updated_at();
drop trigger if exists memories_set_updated_at on public.memories;
create trigger memories_set_updated_at before update on public.memories for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare base_username text; candidate text; suffix integer := 0;
begin
  base_username := regexp_replace(lower(coalesce(new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'preferred_username', split_part(coalesce(new.email,''),'@',1), 'angel_user')), '[^a-z0-9_]+', '_', 'g');
  base_username := trim(both '_' from left(base_username, 24));
  if length(base_username) < 3 then base_username := 'angel_user'; end if;
  candidate := left(base_username, 32);
  while exists(select 1 from public.profiles where username = candidate) loop
    suffix := suffix + 1;
    candidate := left(base_username, greatest(3, 32 - length(suffix::text) - 1)) || '_' || suffix::text;
  end loop;
  insert into public.profiles(id, username, display_name, avatar_url)
  values (new.id, candidate, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into public.profiles(id, username, display_name, avatar_url)
select u.id,
       left(trim(both '_' from regexp_replace(lower(coalesce(u.raw_user_meta_data->>'user_name', u.raw_user_meta_data->>'preferred_username', split_part(coalesce(u.email,''),'@',1), 'angel_user')), '[^a-z0-9_]+', '_', 'g')), 32),
       coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
       coalesce(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

 drop policy if exists "Users manage own messages" on public.messages;
create policy "Users manage own messages" on public.messages
for all to authenticated
using ((select auth.uid()) = user_id and exists (select 1 from public.conversations c where c.id = messages.conversation_id and c.user_id = (select auth.uid())))
with check ((select auth.uid()) = user_id and exists (select 1 from public.conversations c where c.id = messages.conversation_id and c.user_id = (select auth.uid())));

create or replace function public.create_conversation_with_title(p_title text)
returns uuid language plpgsql security invoker
as $$
declare new_id uuid;
begin
  insert into public.conversations(user_id,title) values ((select auth.uid()), left(coalesce(nullif(trim(p_title),''),'New conversation'),80)) returning id into new_id;
  return new_id;
end;
$$;
