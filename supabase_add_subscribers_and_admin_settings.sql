-- Run this in your Supabase SQL Editor

-- 1. Create a table for newsletter subscribers
CREATE TABLE IF NOT EXISTS public.subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  status text DEFAULT 'subscribed',
  created_at timestamptz DEFAULT now()
);

-- Allow service role to read/write (disable RLS for simplicity, assuming handled server-side)
ALTER TABLE public.subscribers DISABLE ROW LEVEL SECURITY;

-- 2. Create a table for admin settings (email, phone, address)
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id serial PRIMARY KEY,
  email text,
  phone text,
  address text,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Allow service role to read/write (disable RLS for simplicity, assuming handled server-side)
ALTER TABLE public.admin_settings DISABLE ROW LEVEL SECURITY;

-- Insert a default row for admin settings if it doesn't exist
INSERT INTO public.admin_settings (id, email, phone, address)
VALUES (1, 'admin@example.com', '+92 000 0000000', '123 Admin Street, City, Country')
ON CONFLICT (id) DO NOTHING;
