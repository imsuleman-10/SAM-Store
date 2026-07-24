import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminSession } from '@/lib/authHelper';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('homepage_videos')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ videos: data });
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { title, sub, video_url } = body;

  if (!title || !video_url) {
    return NextResponse.json({ error: 'Title and Video URL are required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('homepage_videos')
    .insert([{ title, sub, video_url }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ video: data });
}
