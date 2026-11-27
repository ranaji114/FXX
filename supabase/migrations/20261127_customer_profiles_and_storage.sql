-- Safe upgrade for an existing FXX Supabase project.
-- Run this once in Supabase SQL Editor after the original schema.sql.

alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists default_address text;

alter table public.order_items drop constraint if exists order_items_product_id_fkey;
alter table public.order_items add constraint order_items_product_id_fkey foreign key (product_id) references public.products(id) on delete set null;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public reads product images" on storage.objects;
drop policy if exists "Admin uploads product images" on storage.objects;
drop policy if exists "Admin updates product images" on storage.objects;
drop policy if exists "Admin deletes product images" on storage.objects;

create policy "Public reads product images"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "Admin uploads product images"
on storage.objects for insert to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admin updates product images"
on storage.objects for update to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admin deletes product images"
on storage.objects for delete to authenticated
using (bucket_id = 'product-images' and public.is_admin());
