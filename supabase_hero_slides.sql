-- ====================================================
-- Run this in your Supabase SQL Editor
-- Creates dedicated hero_slides table with proper schema
-- ====================================================

-- Step 1: Create the hero_slides table
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url     TEXT NOT NULL,
  heading       TEXT NOT NULL,
  subtitle      TEXT,
  link_url      TEXT,
  video_url     TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Create index for ordering
CREATE INDEX IF NOT EXISTS idx_hero_slides_sort_order ON public.hero_slides (sort_order);

-- Step 3: Disable RLS so service role can read/write freely
ALTER TABLE public.hero_slides DISABLE ROW LEVEL SECURITY;

-- Step 4: Seed with default slides (matches current HeroSlider defaults)
INSERT INTO public.hero_slides (image_url, heading, subtitle, link_url, sort_order, is_active) VALUES
  ('/images/products/dermive_hero_desktop.png', 'Dermatologist-Backed Skincare Solutions', 'DermiVe Moisturizing Wash', '/collections', 1, true),
  ('/images/products/roots_hero_desktop.png', 'Transform Your Hair', 'Roots Hair Treatment Serum', '/collections', 2, true),
  ('/images/products/relax_hero_desktop.png', 'Reveal Your True Glow', 'Relax Vitamin C Serum', '/collections', 3, true),
  ('/images/products/markaway_hero_desktop.png', 'Restore Skin Confidence', 'Markaway Stretch Mark Serum', '/collections', 4, true),
  ('/images/products/zafrani_hero_desktop.png', 'Flawless Even Complexion', 'Zafrani Beauty Cream', '/collections', 5, true)
ON CONFLICT DO NOTHING;

-- Step 5: Create updated_at trigger (optional but recommended)
-- Run this if you want automatic updated_at updates:
/*
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_hero_slides_updated_at ON public.hero_slides;
CREATE TRIGGER update_hero_slides_updated_at
  BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
*/