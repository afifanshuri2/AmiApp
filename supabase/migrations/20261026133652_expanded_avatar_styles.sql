-- Additive avatar revision; existing saved choices remain valid.
alter table public.avatars drop constraint avatars_headwear_check;
alter table public.avatars add constraint avatars_headwear_check check(headwear in ('none','cap','beanie','bucket','beret','songkok','hijab','hijab_wrap','hijab_instant','hijab_sport'));
alter table public.avatars drop constraint avatars_glasses_check;
alter table public.avatars add constraint avatars_glasses_check check(glasses in ('none','round','square','oval','cat_eye','sunglasses'));
alter table public.avatars add column eyes text not null default 'dot' check(eyes in ('dot','almond','lashes'));
alter table public.avatars add column nose text not null default 'none' check(nose in ('none','button','pointed'));
alter table public.avatars add column facial_hair text not null default 'none' check(facial_hair in ('none','moustache','beard','goatee'));
alter table public.avatars add column mood text not null default 'happy' check(mood in ('happy','neutral','angry','sad','sleepy','love','surprised'));
grant insert(eyes,nose,facial_hair,mood),update(eyes,nose,facial_hair,mood) on public.avatars to authenticated;
