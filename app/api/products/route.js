import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';

// GET /api/products — public, anyone can list products (used by the storefront)
export async function GET() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

// POST /api/products — admin only, creates a new product
export async function POST(request) {
  const session = cookies().get('baroque_admin_session');
  if (!session || session.value !== 'valid') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is missing in .env.local. Admin cannot create products.' }, { status: 500 });
  }

  const body = await request.json();
  const { name, description, category, price, compare_at_price, image_url, stock, media_urls } = body;

  if (!name || !price) {
    return NextResponse.json({ error: 'Product name and price are required fields.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert([{ name, description, category, price, compare_at_price, image_url, stock, media_urls }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}
