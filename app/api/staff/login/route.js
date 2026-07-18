import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findStaffByEmail, verifyPassword } from '@/lib/staff';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const staff = await findStaffByEmail(email);
    if (!staff || !verifyPassword(password, staff.password_hash)) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set('staff_session', staff.id, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      staff: {
        id: staff.id,
        email: staff.email,
        name: staff.name,
        avatar_url: staff.avatar_url,
        first_login: staff.first_login,
      }
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
