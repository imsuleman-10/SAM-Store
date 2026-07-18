import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/authHelper';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const session = await getAdminSession();
  if (session && !session.isSuperAdmin) {
    const { data, error } = await supabaseAdmin
      .from('staff')
      .select('id, email, role, permissions, name, avatar_url')
      .eq('id', session.staffId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      id: data.id, 
      email: data.email, 
      role: data.role, 
      permissions: data.permissions,
      name: data.name,
      avatar_url: data.avatar_url 
    });
  }

  // Super Admin Fallback
  const { data: nameData } = await supabaseAdmin.from('settings').select('value').eq('key', 'super_admin_name').maybeSingle();
  const { data: avatarData } = await supabaseAdmin.from('settings').select('value').eq('key', 'super_admin_avatar').maybeSingle();

  return NextResponse.json({ 
    id: 'super_admin', 
    email: 'admin@system', 
    role: 'admin', 
    permissions: { all_products: true },
    name: nameData?.value || 'Super Admin',
    avatar_url: avatarData?.value || null
  });
}

export async function PATCH(request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, avatar_url } = await request.json();

  if (session.isSuperAdmin) {
    if (name !== undefined) {
      const { data: existName } = await supabaseAdmin.from('settings').select('key').eq('key', 'super_admin_name').maybeSingle();
      if (existName) await supabaseAdmin.from('settings').update({ value: name }).eq('key', 'super_admin_name');
      else await supabaseAdmin.from('settings').insert({ key: 'super_admin_name', value: name });
    }
    if (avatar_url !== undefined) {
      const { data: existAvatar } = await supabaseAdmin.from('settings').select('key').eq('key', 'super_admin_avatar').maybeSingle();
      if (existAvatar) await supabaseAdmin.from('settings').update({ value: avatar_url }).eq('key', 'super_admin_avatar');
      else await supabaseAdmin.from('settings').insert({ key: 'super_admin_avatar', value: avatar_url });
    }
    return NextResponse.json({
        id: 'super_admin',
        email: 'admin@system',
        role: 'admin',
        permissions: { all_products: true },
        name: name || 'Super Admin',
        avatar_url: avatar_url || null
    });
  }

  const { data, error } = await supabaseAdmin
    .from('staff')
    .update({ name, avatar_url })
    .eq('id', session.staffId)
    .select('id, email, role, permissions, name, avatar_url')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
