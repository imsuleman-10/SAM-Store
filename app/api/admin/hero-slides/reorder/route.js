import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminSession } from '@/lib/authHelper';

// POST /api/admin/hero-slides/reorder - Reorder slides
export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  const body = await request.json();
  const { slideIds } = body; // Array of slide IDs in new order

  if (!Array.isArray(slideIds) || slideIds.length === 0) {
    return NextResponse.json({ error: 'slideIds array required' }, { status: 400 });
  }

  // Update sort_order for each slide
  const updates = slideIds.map((id, index) =>
    supabaseAdmin
      .from('hero_slides')
      .update({ sort_order: index + 1 })
      .eq('id', id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter(r => r.error);

  if (errors.length > 0) {
    return NextResponse.json({ error: errors[0].error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}