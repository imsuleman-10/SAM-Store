-- Run this in your Supabase project's SQL Editor (Project -> SQL Editor -> New query)

create extension if not exists "pgcrypto";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  category text default 'General',
  price numeric not null,
  compare_at_price numeric,
  image_url text,
  media_urls jsonb default '[]',
  stock integer default 50,
  created_at timestamptz default now()
);

create table if not exists settings (
  key text primary key,
  value text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  items jsonb not null,
  customer_name text not null,
  customer_phone text not null,
  customer_city text not null,
  customer_address text not null,
  total numeric not null,
  status text default 'pending', -- pending | confirmed | shipped | delivered | cancelled
  created_at timestamptz default now()
);

-- Row Level Security
alter table products enable row level security;
alter table orders enable row level security;

-- Anyone (anon key) can READ products — this powers your public storefront
create policy "Public can view products"
  on products for select
  using (true);

-- Anyone (anon key) can INSERT an order — this powers your public checkout
create policy "Public can create orders"
  on orders for insert
  with check (true);

-- Note: there is intentionally NO public policy for update/delete on products,
-- or select/update/delete on orders. Those actions go through the admin API
-- routes, which use the SERVICE ROLE key (supabaseAdmin.js) and bypass RLS.
-- Never expose your service role key in client-side code.

-- Optional: seed a few starter products
insert into products (name, description, category, price, compare_at_price, stock) values
('Wireless Game Controller', 'Bluetooth controller compatible with mobile, PC and console. Rechargeable battery, ergonomic grip.', 'Gaming', 1699, 2499, 40),
('Over-Ear Wireless Headphones', 'Noise-isolating over-ear headphones with 30-hour battery life and deep bass.', 'Audio', 3500, 4999, 25),
('Beard Growth Oil', 'Nourishing beard oil blend for softer, fuller-looking facial hair.', 'Grooming', 1299, 1899, 60);
