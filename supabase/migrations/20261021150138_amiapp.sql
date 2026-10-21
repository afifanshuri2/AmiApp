-- No passwords in application tables. Supabase Auth owns credentials.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table private.couples (
 id uuid primary key default gen_random_uuid(),
 first_user uuid not null references auth.users(id) on delete cascade,
 second_user uuid not null references auth.users(id) on delete cascade,
 check (first_user <> second_user)
);
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
 role text not null check (role in ('husband','wife')),
 couple_id uuid references private.couples(id) on delete set null
);
create index profiles_couple on public.profiles(couple_id);
create table private.invitations (
 owner_id uuid primary key references public.profiles(id) on delete cascade,
 key_hash bytea not null unique,
 expires_at timestamptz not null
);
create table private.pair_limits (
 user_id uuid primary key references auth.users(id) on delete cascade,
 window_start timestamptz not null default now(),
 attempts integer not null default 0
);
create table public.entries (
 id uuid primary key default gen_random_uuid(),
 couple_id uuid not null references private.couples(id) on delete cascade,
 kind text not null check (kind in ('ShortNotes','Goals','Ambitions','Todos','Groceries','Places','Countdowns')),
 title text not null check (length(trim(title)) between 1 and 160),
 detail text not null default '' check (length(detail) <= 4000),
 done boolean not null default false,
 progress integer not null default 0 check (progress between 0 and 100),
 due_date date,
 created_by uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 check (kind not in ('Countdowns','Ambitions') or due_date is not null)
);
create index entries_couple_created on public.entries(couple_id, created_at desc);
alter table public.profiles enable row level security;
alter table public.entries enable row level security;
alter table private.couples enable row level security;
alter table private.invitations enable row level security;
alter table private.pair_limits enable row level security;
revoke all on all tables in schema private from public, anon, authenticated;
revoke all on public.profiles, public.entries from public, anon, authenticated;

-- Privileged operations are narrow, private, fixed-search-path functions.
-- The Data API exposes only public wrappers. Each private entry point checks identity.
create function private.my_couple() returns uuid language sql stable security definer set search_path = '' as $$
 select p.couple_id from public.profiles p
 join private.couples c on c.id = p.couple_id
 where p.id = (select auth.uid()) and (c.first_user = auth.uid() or c.second_user = auth.uid());
$$;
create function private.create_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if new.email <> lower(new.raw_user_meta_data->>'username') || '@users.amiapp.invalid' then
  raise exception 'Invalid username identity';
 end if;
 insert into public.profiles(id, username, role) values(new.id, lower(new.raw_user_meta_data->>'username'), new.raw_user_meta_data->>'role');
 return new;
end;
$$;
create trigger on_ami_signup after insert on auth.users for each row execute function private.create_profile();

create function private.pair_attempt() returns boolean language plpgsql security definer set search_path = '' as $$
declare current_attempts integer;
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 insert into private.pair_limits(user_id, attempts) values(auth.uid(), 1)
 on conflict(user_id) do update set
 attempts = case when private.pair_limits.window_start < now() - interval '15 minutes' then 1 else private.pair_limits.attempts + 1 end,
 window_start = case when private.pair_limits.window_start < now() - interval '15 minutes' then now() else private.pair_limits.window_start end
 returning attempts into current_attempts;
 return current_attempts <= 10;
end;
$$;
create function private.generate_pair_key() returns text language plpgsql security definer set search_path = '' as $$
declare invitation text; me public.profiles;
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 select * into me from public.profiles where id = auth.uid() for update;
 if me.id is null or me.couple_id is not null then raise exception 'Already paired or profile missing'; end if;
 if not private.pair_attempt() then return null; end if;
 delete from private.invitations where expires_at <= now() or owner_id = auth.uid();
 loop
  -- gen_random_uuid is cryptographically random. No browser-generated invitation secrets.
  invitation := lpad(((('x' || substr(replace(gen_random_uuid()::text,'-',''),1,6))::bit(24)::int) % 1000000)::text,6,'0');
  begin
   insert into private.invitations(owner_id,key_hash,expires_at) values(auth.uid(),sha256(convert_to(invitation,'UTF8')),now()+interval '15 minutes');
   exit;
  exception when unique_violation then null;
  end;
 end loop;
 return invitation;
end;
$$;
create function private.join_pair(pair_key text) returns boolean language plpgsql security definer set search_path = '' as $$
declare me public.profiles; owner_profile public.profiles; invitation private.invitations; new_couple uuid;
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 select * into me from public.profiles where id = auth.uid() for update;
 if me.id is null or me.couple_id is not null then return false; end if;
 if not private.pair_attempt() then return false; end if;
 if pair_key !~ '^[0-9]{6}$' then return false; end if;
 select * into invitation from private.invitations where key_hash = sha256(convert_to(pair_key,'UTF8')) and expires_at > now() for update;
 if invitation.owner_id is null or invitation.owner_id = me.id then return false; end if;
 select * into owner_profile from public.profiles where id = invitation.owner_id for update;
 if owner_profile.couple_id is not null or owner_profile.role = me.role then return false; end if;
 insert into private.couples(first_user,second_user) values(owner_profile.id,me.id) returning id into new_couple;
 update public.profiles set couple_id = new_couple where id in (owner_profile.id,me.id);
 delete from private.invitations where owner_id in (owner_profile.id,me.id);
 return true;
end;
$$;
create function public.generate_pair_key() returns text language sql security invoker set search_path = '' as $$ select private.generate_pair_key(); $$;
create function public.join_pair(pair_key text) returns boolean language sql security invoker set search_path = '' as $$ select private.join_pair(pair_key); $$;

revoke all on all functions in schema private from public, anon, authenticated;
revoke all on function public.generate_pair_key(), public.join_pair(text) from public, anon, authenticated;
grant execute on function private.my_couple(), private.generate_pair_key(), private.join_pair(text) to authenticated;
grant execute on function public.generate_pair_key(), public.join_pair(text) to authenticated;
grant select on public.profiles to authenticated;
grant select, delete on public.entries to authenticated;
grant insert(couple_id,kind,title,detail,progress,due_date,created_by) on public.entries to authenticated;
grant update(title,detail,done,progress,due_date) on public.entries to authenticated;

create policy profiles_read on public.profiles for select to authenticated
 using (id = (select auth.uid()) or couple_id = (select private.my_couple()));
create policy entries_read on public.entries for select to authenticated
 using (couple_id = (select private.my_couple()));
create policy entries_insert on public.entries for insert to authenticated
 with check (couple_id = (select private.my_couple()) and created_by = (select auth.uid()));
create policy entries_update on public.entries for update to authenticated
 using (couple_id = (select private.my_couple())) with check (couple_id = (select private.my_couple()));
create policy entries_delete on public.entries for delete to authenticated
 using (couple_id = (select private.my_couple()));
