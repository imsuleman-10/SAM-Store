import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminSession } from '@/lib/authHelper';

export const dynamic = 'force-dynamic';

// GET /api/admin/hero-slides - List all slides
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  const { data, error } = await supabaseAdmin
    .from('hero_slides')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ slides: data || [] });
}

// POST /api/admin/hero-slides - Create new slide
export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  const body = await request.json();
  const { image_url, heading, subtitle, link_url, video_url } = body;

  if (!image_url || !heading) {
    return NextResponse.json({ error: 'Image URL and heading are required' }, { status: 400 });
  }

  // Get next sort_order
  const { data: maxOrder } = await supabaseAdmin
    .from('hero_slides')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = (maxOrder?.[0]?.sort_order || 0) + 1;

  const { data, error } = await supabaseAdmin
    .from('hero_slides')
    .insert({ image_url, heading, subtitle, link_url, video_url, sort_order: nextOrder, is_active: true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ slide: data }, { status: 201 });
}