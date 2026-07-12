import { NextResponse } from 'next/server';

export async function POST(request) {
  const { password } = await request.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Ghalat password.' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('baroque_admin_session', 'valid', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}
