create table public.couple_settings (
 couple_id uuid primary key references private.couples(id) on delete cascade,
 together_since date check (together_since <= current_date)
);
alter table public.couple_settings enable row level security;
revoke all on public.couple_settings from public, anon, authenticated;
grant select on public.couple_settings to authenticated;
grant insert(couple_id, together_since), update(together_since) on public.couple_settings to authenticated;
create policy settings_read on public.couple_settings for select to authenticated
 using (couple_id = (select private.my_couple()));
create policy settings_insert on public.couple_settings for insert to authenticated
 with check (couple_id = (select private.my_couple()));
create policy settings_update on public.couple_settings for update to authenticated
 using (couple_id = (select private.my_couple())) with check (couple_id = (select private.my_couple()));
create function public.save_relationship_date(start_date date) returns void language sql security invoker set search_path = '' as $$
 insert into public.couple_settings(couple_id,together_since)
 values(private.my_couple(),start_date)
 on conflict(couple_id) do update set together_since = excluded.together_since;
$$;
revoke all on function public.save_relationship_date(date) from public, anon, authenticated;
grant execute on function public.save_relationship_date(date) to authenticated;
