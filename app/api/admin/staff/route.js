import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStaffList, saveStaffList, hashPassword, generateStaffId, findStaffByEmail } from '@/lib/staff';

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('baroque_admin_session') || cookieStore.get('admin_session');
  return session?.value === 'valid';
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const list = await getStaffList();
  const safe = list.map(s => ({
    id: s.id,
    email: s.email,
    name: s.name || '',
    avatar_url: s.avatar_url || '',
    first_login: s.first_login,
    created_at: s.created_at,
  }));

  return NextResponse.json({ staff: safe });
}

export async function POST(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email, password, name } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const existing = await findStaffByEmail(email);
  if (existing) {
    return NextResponse.json({ error: 'A staff member with this email already exists.' }, { status: 409 });
  }

  const list = await getStaffList();
  list.push({
    id: generateStaffId(),
    email: email.toLowerCase().trim(),
    password_hash: hashPassword(password),
    name: name || '',
    avatar_url: '',
    first_login: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  await saveStaffList(list);

  return NextResponse.json({ success: true });
}

export async function PATCH(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, email, password, name, reset_setup } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Staff ID is required.' }, { status: 400 });
  }

  const list = await getStaffList();
  const idx = list.findIndex(s => s.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Staff not found.' }, { status: 404 });
  }

  if (email) list[idx].email = email.toLowerCase().trim();
  if (password) list[idx].password_hash = hashPassword(password);
  if (name !== undefined) list[idx].name = name;
  if (reset_setup) list[idx].first_login = true;
  list[idx].updated_at = new Date().toISOString();

  await saveStaffList(list);
  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Staff ID is required.' }, { status: 400 });
  }

  const list = await getStaffList();
  const idx = list.findIndex(s => s.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Staff not found.' }, { status: 404 });
  }

  list.splice(idx, 1);
  await saveStaffList(list);
  return NextResponse.json({ success: true });
}
