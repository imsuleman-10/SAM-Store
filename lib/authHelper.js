import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Returns { isSuperAdmin, staffId, role, permissions } or null if unauthenticated
export async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('baroque_admin_session');
  
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }
  
  const sessionId = sessionCookie.value;
  
  if (sessionId === 'valid') {
    // Legacy / Fallback for super admin before DB migration
    return { isSuperAdmin: true, staffId: null, role: 'admin', permissions: { all_products: true } };
  }

  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('admin_sessions')
    .select(`
      is_super_admin,
      staff:staff_id (
        id, role, status, permissions
      )
    `)
    .eq('session_id', sessionId)
    .single();

  if (error || !data) {
    return null;
  }

  if (data.is_super_admin) {
    return { isSuperAdmin: true, staffId: null, role: 'admin', permissions: { all_products: true } };
  }

  if (!data.staff || data.staff.status !== 'active') {
    return null;
  }

  return {
    isSuperAdmin: false,
    staffId: data.staff.id,
    role: data.staff.role,
    permissions: data.staff.permissions || {}
  };
}
