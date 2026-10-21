alter table public.entries drop constraint entries_kind_check;
alter table public.entries add constraint entries_kind_check check(kind in ('ShortNotes','Goals','Ambitions','Todos','Groceries','Places','Countdowns','FoodToTry'));
alter table public.entries add column category text not null default '' check(length(category)<=40);
alter table public.entries add column place_name text not null default '' check(length(place_name)<=160);
alter table public.entries add column location text not null default '' check(length(location)<=500);
alter table public.entries add constraint food_place_required check(kind<>'FoodToTry' or (length(trim(category))>0 and length(trim(place_name))>0 and length(trim(location))>0));
grant insert(category,place_name,location),update(category,place_name,location) on public.entries to authenticated;
