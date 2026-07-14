-- Run this in your Supabase SQL Editor
-- Creates a dedicated OTP storage table

CREATE TABLE IF NOT EXISTS public.otp_store (
  email text PRIMARY KEY,
  payload text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Allow service role to read/write (no RLS needed, handled server-side)
ALTER TABLE public.otp_store DISABLE ROW LEVEL SECURITY;
