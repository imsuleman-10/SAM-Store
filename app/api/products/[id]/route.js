import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminSession } from '@/lib/authHelper';

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
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.role === 'manager' && !session.permissions?.all_products) {
    if (!session.permissions?.allowed_products?.includes(Number(params.id)) && !session.permissions?.allowed_products?.includes(params.id)) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to modify this product.' }, { status: 403 });
    }
  }

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
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.role === 'manager' && !session.permissions?.all_products) {
    if (!session.permissions?.allowed_products?.includes(Number(params.id)) && !session.permissions?.allowed_products?.includes(params.id)) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to delete this product.' }, { status: 403 });
    }
  }

  const { error } = await supabaseAdmin.from('products').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
