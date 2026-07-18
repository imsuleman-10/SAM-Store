import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminSession } from '@/lib/authHelper';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings = {};
  // Last row per key wins (DB returns in insertion order)
  (data || []).forEach((item) => {
    settings[item.key] = item.value;
  });

  return NextResponse.json({ settings });
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500 });
  }

  const body = await request.json();
  const keys = Object.keys(body || {});
  const entries = keys.map((key) => ({ key, value: String(body[key] || '') }));

  if (entries.length === 0) {
    return NextResponse.json({ error: 'No settings provided.' }, { status: 400 });
  }

  // For each key, try update first; if no row exists, insert
  for (const { key, value } of entries) {
    const { data: existing } = await supabaseAdmin
      .from('settings')
      .select('key')
      .eq('key', key)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin.from('settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key);
    } else {
      await supabaseAdmin.from('settings').insert({ key, value });
    }
  }

  return NextResponse.json({ success: true });
}
