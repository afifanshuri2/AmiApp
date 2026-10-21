do $$ begin
 if to_regprocedure('public.rls_auto_enable()') is not null then
  revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
 end if;
end $$;
create policy couples_no_direct_access on private.couples for all to anon, authenticated using (false) with check (false);
create policy invitations_no_direct_access on private.invitations for all to anon, authenticated using (false) with check (false);
create policy limits_no_direct_access on private.pair_limits for all to anon, authenticated using (false) with check (false);
