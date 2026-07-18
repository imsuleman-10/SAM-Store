import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('baroque_admin_session');
  
  if (sessionCookie && sessionCookie.value && sessionCookie.value !== 'valid' && supabaseAdmin) {
    // Delete session from DB
    await supabaseAdmin
      .from('admin_sessions')
      .delete()
      .eq('session_id', sessionCookie.value);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('baroque_admin_session');
  return response;
}
