import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';

// GET /api/orders — admin only, list all orders
export async function GET() {
  const session = cookies().get('baroque_admin_session');
  if (!session || session.value !== 'valid') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}

// POST /api/orders — public, called from checkout (Cash on Delivery only)
export async function POST(request) {
  const body = await request.json();
  const { items, customer_name, customer_phone, customer_city, customer_address, total } = body;

  if (!items || !items.length || !customer_name || !customer_phone || !customer_city || !customer_address) {
    return NextResponse.json({ error: 'Sab fields fill karein.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('orders')
    .insert([{ items, customer_name, customer_phone, customer_city, customer_address, total, status: 'pending' }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}
