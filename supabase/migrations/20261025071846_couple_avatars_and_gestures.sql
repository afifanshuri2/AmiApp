-- Avatar choices are bounded tokens, never uploaded images or executable SVG.
create table public.avatars (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 skin text not null default 'peach' check (skin in ('porcelain','peach','golden','tan','brown','deep')),
 hair text not null default 'short' check (hair in ('short','bob','curls','long','none')),
 hair_color text not null default 'espresso' check (hair_color in ('espresso','chestnut','honey','silver')),
 headwear text not null default 'none' check (headwear in ('none','cap','beanie','hijab')),
 glasses text not null default 'none' check (glasses in ('none','round','square')),
 outfit text not null default 'sage' check (outfit in ('rose','sage','lavender','blue'))
);
alter table public.avatars enable row level security;
revoke all on public.avatars from public,anon,authenticated;
grant select on public.avatars to authenticated;
grant insert(user_id,skin,hair,hair_color,headwear,glasses,outfit), update(user_id,skin,hair,hair_color,headwear,glasses,outfit) on public.avatars to authenticated;
create policy avatars_read on public.avatars for select to authenticated using (
 user_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.id=user_id and p.couple_id=(select private.my_couple()))
);
create policy avatars_insert on public.avatars for insert to authenticated with check (user_id=(select auth.uid()));
create policy avatars_update on public.avatars for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

create table public.partner_gestures (
 id uuid primary key default gen_random_uuid(),
 couple_id uuid not null references private.couples(id) on delete cascade,
 sender_id uuid not null references public.profiles(id) on delete cascade,
 recipient_id uuid not null references public.profiles(id) on delete cascade,
 kind text not null check(kind in ('poke','nudge','kiss')),
 created_at timestamptz not null default now(),
 read_at timestamptz,
 check(sender_id <> recipient_id)
);
create index partner_gestures_sender_created on public.partner_gestures(sender_id,created_at desc);
create index partner_gestures_recipient_created on public.partner_gestures(recipient_id,created_at desc);
create index partner_gestures_couple on public.partner_gestures(couple_id);
alter table public.partner_gestures enable row level security;
revoke all on public.partner_gestures from public,anon,authenticated;
grant select on public.partner_gestures to authenticated;
grant update(read_at) on public.partner_gestures to authenticated;
create policy gestures_read on public.partner_gestures for select to authenticated using (
 couple_id=(select private.my_couple()) and (sender_id=(select auth.uid()) or recipient_id=(select auth.uid()))
);
create policy gestures_acknowledge on public.partner_gestures for update to authenticated
 using(recipient_id=(select auth.uid()) and couple_id=(select private.my_couple()))
 with check(recipient_id=(select auth.uid()) and couple_id=(select private.my_couple()));

-- A private broker is necessary: clients cannot choose recipient, authorship,
-- timestamps, or insert around the cooldown. The public wrapper stays invoker.
create function private.send_partner_gesture(gesture_kind text) returns uuid
 language plpgsql security definer set search_path='' as $$
declare me uuid := auth.uid(); pair uuid; recipient uuid; sent uuid;
begin
 if me is null then raise exception 'Login required'; end if;
 if gesture_kind is null or gesture_kind not in ('poke','nudge','kiss') then raise exception 'Invalid gesture'; end if;
 -- Serialize sends for this account so concurrent requests cannot bypass limits.
 perform 1 from public.profiles where id=me for update;
 pair := private.my_couple();
 if pair is null then raise exception 'Pair first'; end if;
 select id into recipient from public.profiles where couple_id=pair and id<>me;
 if recipient is null then raise exception 'Partner not found'; end if;
 if exists(select 1 from public.partner_gestures where sender_id=me and created_at>now()-interval '10 seconds') then raise exception 'A little pause, please'; end if;
 if (select count(*) from public.partner_gestures where sender_id=me and created_at>now()-interval '24 hours')>=60 then raise exception 'Enough love for today'; end if;
 insert into public.partner_gestures(couple_id,sender_id,recipient_id,kind) values(pair,me,recipient,gesture_kind) returning id into sent;
 return sent;
end;
$$;
create function public.send_partner_gesture(gesture_kind text) returns uuid
 language sql security invoker set search_path='' as $$ select private.send_partner_gesture(gesture_kind); $$;
revoke all on function private.send_partner_gesture(text),public.send_partner_gesture(text) from public,anon,authenticated;
grant execute on function private.send_partner_gesture(text),public.send_partner_gesture(text) to authenticated;
