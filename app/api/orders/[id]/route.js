import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminSession } from '@/lib/authHelper';

export async function PATCH(request, { params }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { status, courier_company, tracking_id } = await request.json();
  
  // Fetch existing order to get items
  const { data: existingOrder, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('items, status')
    .eq('id', params.id)
    .single();

  if (fetchError || !existingOrder) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const updatePayload = {};
  if (status) updatePayload.status = status;

  // Store tracking info in the items array (JSONB fallback for extreme stability)
  if (courier_company !== undefined || tracking_id !== undefined) {
    const items = existingOrder.items || [];
    const cleanItems = items.filter(item => item && !item.is_tracking_meta);
    
    // Get existing tracking values to avoid overwriting with undefined
    const currentMeta = items.find(item => item && item.is_tracking_meta) || {};
    const finalCourier = courier_company !== undefined ? courier_company : (currentMeta.courier_company || '');
    const finalTracking = tracking_id !== undefined ? tracking_id : (currentMeta.tracking_id || '');

    if (finalCourier || finalTracking) {
      cleanItems.push({
        is_tracking_meta: true,
        courier_company: finalCourier,
        tracking_id: finalTracking
      });
    }
    updatePayload.items = cleanItems;
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update(updatePayload)
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}

export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) {
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
