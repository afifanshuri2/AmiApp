alter table public.entries add column due_at timestamptz;
alter table public.entries add column emoji text not null default '📍' check (length(emoji) between 1 and 32);
grant insert(due_at,emoji), update(due_at,emoji) on public.entries to authenticated;

-- History belongs to the goal's couple and remains append-only.
create table public.goal_updates (
 id uuid primary key default gen_random_uuid(),
 entry_id uuid not null references public.entries(id) on delete cascade,
 description text not null check (length(trim(description)) between 1 and 4000),
 progress integer not null check (progress between 0 and 100),
 created_by uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
create index goal_updates_entry_created on public.goal_updates(entry_id, created_at desc);
create index goal_updates_author on public.goal_updates(created_by);
alter table public.goal_updates enable row level security;
revoke all on public.goal_updates from public, anon, authenticated;
grant select on public.goal_updates to authenticated;
grant insert(entry_id,description,progress,created_by) on public.goal_updates to authenticated;
create policy goal_updates_read on public.goal_updates for select to authenticated using (
 exists(select 1 from public.entries e where e.id=entry_id and e.kind in ('Goals','Ambitions') and e.couple_id=(select private.my_couple()))
);
create policy goal_updates_insert on public.goal_updates for insert to authenticated with check (
 created_by=(select auth.uid()) and exists(select 1 from public.entries e where e.id=entry_id and e.kind in ('Goals','Ambitions') and e.couple_id=(select private.my_couple()))
);
create function public.add_goal_update(goal_id uuid, update_description text, new_progress integer) returns void
 language plpgsql security invoker set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 perform 1 from public.entries where id=goal_id and kind in ('Goals','Ambitions') for update;
 if not found then raise exception 'Goal not found'; end if;
 insert into public.goal_updates(entry_id,description,progress,created_by) values(goal_id,trim(update_description),new_progress,auth.uid());
 update public.entries set progress=new_progress,done=(new_progress=100) where id=goal_id;
end;
$$;
revoke all on function public.add_goal_update(uuid,text,integer) from public,anon,authenticated;
grant execute on function public.add_goal_update(uuid,text,integer) to authenticated;
