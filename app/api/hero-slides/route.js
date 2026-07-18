import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// GET /api/hero-slides - Public endpoint for HeroSlider
export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ slides: [] });

  const { data, error } = await supabaseAdmin
    .from('hero_slides')
    .select('id, image_url, heading, subtitle, link_url, video_url')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching hero slides:', error);
    return NextResponse.json({ slides: [] });
  }

  const slides = (data || []).map(slide => ({
    id: slide.id,
    image: slide.image_url,
    imageDesktop: slide.image_url,
    imageMobile: slide.image_url,
    heading: slide.heading,
    sub: slide.subtitle,
    link: slide.link_url || '/collections',
    videoUrl: slide.video_url,
  }));

  return NextResponse.json({ slides });
}