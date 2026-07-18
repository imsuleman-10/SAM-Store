import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findStaffById } from '@/lib/staff';

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('staff_session')?.value;
  if (!sessionId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const staff = await findStaffById(sessionId);
  if (!staff) {
    return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
  }

  return NextResponse.json({
    staff: {
      id: staff.id,
      email: staff.email,
      name: staff.name,
      avatar_url: staff.avatar_url,
      first_login: staff.first_login,
    }
  });
}
