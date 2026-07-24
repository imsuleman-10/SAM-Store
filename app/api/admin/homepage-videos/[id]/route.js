import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminSession } from '@/lib/authHelper';

export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabaseAdmin
    .from('homepage_videos')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
