import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ hero_slides: null });
  }

  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('value')
    .eq('key', 'hero_slides');

  if (error || !data || data.length === 0) {
    return NextResponse.json({ hero_slides: null });
  }

  // Take the last inserted row (most recent)
  const value = data[data.length - 1].value;

  try {
    return NextResponse.json({ hero_slides: JSON.parse(value) });
  } catch {
    return NextResponse.json({ hero_slides: value });
  }
}
