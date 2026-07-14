-- Run this in your Supabase SQL Editor
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_whatsapp text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email text;
