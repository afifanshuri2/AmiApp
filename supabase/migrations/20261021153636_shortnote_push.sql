create extension if not exists pg_net;
create table public.note_notifications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 entry_id uuid not null references public.entries(id) on delete cascade,
 created_at timestamptz not null default now(),
 read_at timestamptz,
 dispatched_at timestamptz,
 unique(user_id,entry_id)
);
create index note_notifications_unread on public.note_notifications(user_id) where read_at is null;
create table public.push_subscriptions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 endpoint text not null unique check (length(endpoint) < 2048 and endpoint ~ '^https://(web\.push\.apple\.com|fcm\.googleapis\.com|[a-z0-9.-]+\.push\.services\.mozilla\.com)/'),
 p256dh text not null check (length(p256dh) between 40 and 200),
 auth text not null check (length(auth) between 16 and 100)
);
create index push_subscriptions_user on public.push_subscriptions(user_id);
create table private.push_config (
 id boolean primary key default true check(id),
 public_key text not null,
 private_key_id uuid not null,
 webhook_secret_id uuid not null
);
alter table public.note_notifications enable row level security;
alter table public.push_subscriptions enable row level security;
alter table private.push_config enable row level security;
create policy push_config_no_direct_access on private.push_config for all to anon,authenticated using(false) with check(false);
revoke all on public.note_notifications, public.push_subscriptions, private.push_config from public,anon,authenticated;
grant select on public.note_notifications to authenticated;
grant update(read_at) on public.note_notifications to authenticated;
grant select,delete on public.push_subscriptions to authenticated;
grant insert(user_id,endpoint,p256dh,auth) on public.push_subscriptions to authenticated;
create policy notes_notifications_read on public.note_notifications for select to authenticated using(user_id=(select auth.uid()));
create policy notes_notifications_update on public.note_notifications for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy subscriptions_read on public.push_subscriptions for select to authenticated using(user_id=(select auth.uid()));
create policy subscriptions_insert on public.push_subscriptions for insert to authenticated with check(user_id=(select auth.uid()) and (select private.my_couple()) is not null);
create policy subscriptions_delete on public.push_subscriptions for delete to authenticated using(user_id=(select auth.uid()));
grant all on public.note_notifications,public.push_subscriptions to service_role;

-- Only the server role can initialize/retrieve credentials; private keys stay in Vault.
create function private.push_credentials(new_public text default null,new_private text default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare config private.push_config; private_id uuid; hook_id uuid;
begin
 if (auth.jwt()->>'role') is distinct from 'service_role' then raise exception 'Server only'; end if;
 perform pg_advisory_xact_lock(98762102);
 select * into config from private.push_config where id=true;
 if config.id is null then
  if new_public is null or new_private is null then raise exception 'Push not initialized'; end if;
  select vault.create_secret(new_private,'amiapp_vapid_private') into private_id;
  select vault.create_secret(replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-',''),'amiapp_push_webhook') into hook_id;
  insert into private.push_config(public_key,private_key_id,webhook_secret_id) values(new_public,private_id,hook_id) returning * into config;
 end if;
 return jsonb_build_object('publicKey',config.public_key,'privateKey',(select decrypted_secret from vault.decrypted_secrets where id=config.private_key_id),'webhookSecret',(select decrypted_secret from vault.decrypted_secrets where id=config.webhook_secret_id));
end;
$$;
create function public.push_credentials(new_public text default null,new_private text default null) returns jsonb language sql security invoker set search_path='' as $$ select private.push_credentials(new_public,new_private); $$;
revoke all on function private.push_credentials(text,text),public.push_credentials(text,text) from public,anon,authenticated;
grant usage on schema private to service_role;
grant execute on function private.push_credentials(text,text),public.push_credentials(text,text) to service_role;

create function private.notify_shortnote() returns trigger language plpgsql security definer set search_path='' as $$
declare recipient uuid; notification uuid; hook text;
begin
 if new.kind <> 'ShortNotes' then return new; end if;
 if auth.uid() is distinct from new.created_by then raise exception 'Invalid note author'; end if;
 select id into recipient from public.profiles where couple_id=new.couple_id and id<>new.created_by;
 if recipient is null then return new; end if;
 insert into public.note_notifications(user_id,entry_id) values(recipient,new.id) returning id into notification;
 if exists(select 1 from public.push_subscriptions where user_id=recipient) then
  select s.decrypted_secret into hook from private.push_config c join vault.decrypted_secrets s on s.id=c.webhook_secret_id where c.id=true;
  if hook is not null then
   perform net.http_post(url:='https://cxvovxdmhgoyrnfxzkpi.supabase.co/functions/v1/shortnote-push',headers:=jsonb_build_object('Content-Type','application/json','x-ami-push-secret',hook),body:=jsonb_build_object('notificationId',notification),timeout_milliseconds:=10000);
  end if;
 end if;
 return new;
end;
$$;
revoke all on function private.notify_shortnote() from public,anon,authenticated;
create trigger shortnote_notification after insert on public.entries for each row execute function private.notify_shortnote();
revoke all on net.http_request_queue from public,anon,authenticated;
