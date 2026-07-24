import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminSession } from '@/lib/authHelper';

// GET - Fetch all result images
export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Not configured' }, { status: 500 });

  const { data, error } = await supabaseAdmin
    .from('result_images')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ results: data || [] });
}

// POST - Add new result image pair
export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: 'Not configured' }, { status: 500 });

  const body = await request.json();
  const { product, tag, days, desc, before_url, after_url } = body;

  if (!product || !before_url || !after_url) {
    return NextResponse.json({ error: 'product, before_url, and after_url are required.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('result_images')
    .insert({ product, tag, days, desc, before_url, after_url })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ result: data });
}

// DELETE - Remove a result image pair
export async function DELETE(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: 'Not configured' }, { status: 500 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const { error } = await supabaseAdmin.from('result_images').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
