import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';

export async function PATCH(request, { params }) {
  const session = cookies().get('baroque_admin_session');
  if (!session || session.value !== 'valid') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { status } = await request.json();
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}

export async function DELETE(request, { params }) {
  const session = cookies().get('baroque_admin_session');
  if (!session || session.value !== 'valid') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Safety check: only allow deletion of cancelled orders
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('status')
    .eq('id', params.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  if (existing.status !== 'cancelled') {
    return NextResponse.json({ error: 'Only cancelled orders can be deleted.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
