import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findStaffById, updateStaff } from '@/lib/staff';

export async function POST(request) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('staff_session')?.value;
  if (!sessionId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const staff = await findStaffById(sessionId);
  if (!staff) {
    return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
  }

  const { name, avatar_url } = await request.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  }

  const updated = await updateStaff(sessionId, {
    name: name.trim(),
    avatar_url: avatar_url || '',
    first_login: false,
  });

  return NextResponse.json({
    staff: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      avatar_url: updated.avatar_url,
      first_login: updated.first_login,
    }
  });
}
