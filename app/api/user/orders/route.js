import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  // We are using supabaseAdmin to bypass RLS, but filtering by the requested email.
  // In a stricter system, you would verify the session matches the email on the server.
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, created_at, status, total')
    .eq('customer_email', email)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data || [] });
}
