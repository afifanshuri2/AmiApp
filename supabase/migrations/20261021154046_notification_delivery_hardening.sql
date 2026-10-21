-- pg_net creates its own net schema, but its extension registration belongs in extensions.
-- It cannot be relocated. Reinstall only while there are no subscriptions or queued requests.
do $$ begin
 if exists(select 1 from pg_extension e join pg_namespace n on n.oid=e.extnamespace where e.extname='pg_net' and n.nspname='public') then
  if exists(select 1 from public.push_subscriptions) or exists(select 1 from net.http_request_queue) then raise exception 'Cannot relocate active push infrastructure'; end if;
  drop extension pg_net;
  create extension pg_net with schema extensions;
 end if;
end $$;
revoke all on net.http_request_queue from public,anon,authenticated;

-- A late onboarding skip must not erase a date the partner already supplied.
drop function public.save_relationship_date(date);
create function public.save_relationship_date(start_date date,only_if_missing boolean default false) returns date language plpgsql security invoker set search_path='' as $$
declare saved date;
begin
 insert into public.couple_settings(couple_id,together_since) values(private.my_couple(),start_date)
 on conflict(couple_id) do update set together_since=excluded.together_since where not only_if_missing;
 select together_since into saved from public.couple_settings where couple_id=private.my_couple();
 return saved;
end;
$$;
revoke all on function public.save_relationship_date(date,boolean) from public,anon,authenticated;
grant execute on function public.save_relationship_date(date,boolean) to authenticated;
