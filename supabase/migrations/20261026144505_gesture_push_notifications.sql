alter table public.partner_gestures add column dispatched_at timestamptz;
grant select, update(dispatched_at) on public.partner_gestures to service_role;

create function private.notify_partner_gesture() returns trigger language plpgsql security definer set search_path='' as $$
declare hook text;
begin
 if auth.uid() is distinct from new.sender_id then raise exception 'Invalid gesture author'; end if;
 if exists(select 1 from public.push_subscriptions where user_id=new.recipient_id) then
  select s.decrypted_secret into hook from private.push_config c join vault.decrypted_secrets s on s.id=c.webhook_secret_id where c.id=true;
  if hook is not null then
   perform net.http_post(url:='https://cxvovxdmhgoyrnfxzkpi.supabase.co/functions/v1/shortnote-push',headers:=jsonb_build_object('Content-Type','application/json','x-ami-push-secret',hook),body:=jsonb_build_object('gestureId',new.id),timeout_milliseconds:=10000);
  end if;
 end if;
 return new;
end;
$$;
revoke all on function private.notify_partner_gesture() from public,anon,authenticated;
create trigger partner_gesture_notification after insert on public.partner_gestures for each row execute function private.notify_partner_gesture();
