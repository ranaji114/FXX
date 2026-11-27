-- Add unlimited admin-managed product detail rows.
alter table public.products
add column if not exists custom_details jsonb not null default '[]'::jsonb;
