import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';

function requireAdmin() {
  const session = cookies().get('baroque_admin_session');
  return session && session.value === 'valid';
}

// GET /api/products/:id — public, single product detail
export async function GET(request, { params }) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ product: data });
}

// PUT /api/products/:id — admin only, update a product
export async function PUT(request, { params }) {
  if (!requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, description, category, price, compare_at_price, image_url, stock, media_urls } = body;

  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ name, description, category, price, compare_at_price, image_url, stock, media_urls })
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

// DELETE /api/products/:id — admin only
export async function DELETE(request, { params }) {
  if (!requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabaseAdmin.from('products').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
