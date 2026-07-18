import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminSession } from '@/lib/authHelper';

// PATCH /api/admin/hero-slides/[id] - Update slide
export async function PATCH(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  const body = await request.json();
  const { image_url, heading, subtitle, link_url, video_url, is_active } = body;

  const updateData = {};
  if (image_url !== undefined) updateData.image_url = image_url;
  if (heading !== undefined) updateData.heading = heading;
  if (subtitle !== undefined) updateData.subtitle = subtitle;
  if (link_url !== undefined) updateData.link_url = link_url;
  if (video_url !== undefined) updateData.video_url = video_url;
  if (is_active !== undefined) updateData.is_active = is_active;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('hero_slides')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Slide not found' }, { status: 404 });

  return NextResponse.json({ slide: data });
}

// DELETE /api/admin/hero-slides/[id] - Delete slide
export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  const { error } = await supabaseAdmin
    .from('hero_slides')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}