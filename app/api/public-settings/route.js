import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// Public settings keys that are safe to expose to the frontend
const PUBLIC_KEYS = ['store_logo', 'store_phone', 'store_email', 'store_address', 'delivery_eta', 'free_shipping_threshold', 'shipping_fee'];

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ settings: {} });
  }

  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('key, value')
    .in('key', PUBLIC_KEYS);

  if (error) {
    return NextResponse.json({ settings: {} });
  }

  const settings = {};
  (data || []).forEach((item) => {
    settings[item.key] = item.value;
  });

  return NextResponse.json({ settings });
}
