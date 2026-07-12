import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';

function requireAdmin() {
  const session = cookies().get('baroque_admin_session');
  return session && session.value === 'valid';
}

export async function GET() {
  if (!requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin.from('settings').select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings = {};
  (data || []).forEach((item) => {
    settings[item.key] = item.value;
  });

  return NextResponse.json({ settings });
}

export async function POST(request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500 });
  }

  const body = await request.json();
  const entries = Object.entries(body || {}).map(([key, value]) => ({ key, value: String(value || '') }));

  if (entries.length === 0) {
    return NextResponse.json({ error: 'No settings provided.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('settings')
    .upsert(entries, { onConflict: ['key'] });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
