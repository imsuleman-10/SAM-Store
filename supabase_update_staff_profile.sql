-- Update staff table to support profiles
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
