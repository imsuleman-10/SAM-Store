import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Server misconfigured.' }, { status: 500 });
  }

  const { email } = await request.json();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('subscribers')
    .upsert({ email, status: 'subscribed' }, { onConflict: 'email' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
