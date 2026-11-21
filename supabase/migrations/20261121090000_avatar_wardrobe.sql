-- Additive avatar revision: more moods, hair, colours, headwear, clothing and
-- accessories. Every previously saved value stays valid; ownership policies and
-- column grants are unchanged apart from the two new columns.
alter table public.avatars drop constraint if exists avatars_hair_check;
alter table public.avatars add constraint avatars_hair_check check(hair in ('short','bob','curls','long','none','wavy','ponytail','bun','buzz','side_part'));
alter table public.avatars drop constraint if exists avatars_hair_color_check;
alter table public.avatars add constraint avatars_hair_color_check check(hair_color in ('espresso','chestnut','honey','silver','black','auburn','blonde','pink'));
alter table public.avatars drop constraint if exists avatars_headwear_check;
alter table public.avatars add constraint avatars_headwear_check check(headwear in ('none','cap','beanie','bucket','beret','songkok','hijab','hijab_wrap','hijab_instant','hijab_sport','headband','bow','flower_crown'));
alter table public.avatars drop constraint if exists avatars_outfit_check;
alter table public.avatars add constraint avatars_outfit_check check(outfit in ('rose','sage','lavender','blue','coral','mustard','navy','teal','charcoal','cream'));
alter table public.avatars drop constraint if exists avatars_mood_check;
alter table public.avatars add constraint avatars_mood_check check(mood in ('happy','neutral','angry','sad','sleepy','love','surprised','excited','wink','cool','shy','proud','silly'));
alter table public.avatars add column clothing text not null default 'tee' check(clothing in ('tee','hoodie','shirt','sweater','dress','jacket','kurung','baju_melayu'));
alter table public.avatars add column accessory text not null default 'none' check(accessory in ('none','earrings','necklace','scarf','headphones','bowtie'));
grant insert(clothing,accessory),update(clothing,accessory) on public.avatars to authenticated;
