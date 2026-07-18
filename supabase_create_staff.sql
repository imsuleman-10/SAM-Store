-- Run this in your Supabase SQL Editor
-- Creates the staff table for staff portal authentication

CREATE TABLE IF NOT EXISTS public.staff (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text default '',
  avatar_url text default '',
  first_login boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

ALTER TABLE public.staff DISABLE ROW LEVEL SECURITY;
