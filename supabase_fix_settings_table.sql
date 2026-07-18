-- ====================================================
-- Run this in your Supabase SQL Editor
-- This fixes the settings table so admin can save
-- store phone, email, and address from dashboard
-- ====================================================

-- Step 1: Create the settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.settings (
  key   text PRIMARY KEY,
  value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 2: Disable RLS so service role can read/write freely
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- Step 3: Seed default store contact settings (will not overwrite existing values)
INSERT INTO public.settings (key, value) VALUES
  ('store_phone',   '03xx-xxxxxxx'),
  ('store_email',   'store@example.com'),
  ('store_address', '123 Main St, Lahore, Pakistan')
ON CONFLICT (key) DO NOTHING;
