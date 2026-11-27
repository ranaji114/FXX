-- Run this once in Supabase SQL Editor. It enables saved customer details
-- and unlimited admin-defined product detail rows.
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists default_address text;
alter table public.products add column if not exists custom_details jsonb not null default '[]'::jsonb;
