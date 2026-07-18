import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/authHelper';
import { createClient } from '@supabase/supabase-js';

function normalizeValue(value) {
  return (value || '').toString().trim().toLowerCase();
}

// Admin-only: list all users from Supabase Auth plus their order activity
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const [usersResponse, ordersResponse] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      supabaseAdmin.from('orders').select('id, customer_email, customer_name, customer_phone, customer_whatsapp, status, created_at, total').order('created_at', { ascending: false })
    ]);

    const { data: userData, error: usersError } = usersResponse;
    const { data: ordersData, error: ordersError } = ordersResponse;

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    if (ordersError) {
      console.error('Error fetching orders for users:', ordersError);
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    const orders = ordersData || [];

    const users = (userData?.users || []).map((u) => {
      const userEmail = normalizeValue(u.email);
      const userPhone = normalizeValue(u.phone || u.user_metadata?.phone || u.user_metadata?.whatsapp || '');
      const userName = normalizeValue(u.user_metadata?.full_name || u.user_metadata?.name || '');

      const matchedOrders = orders.filter((order) => {
        const orderEmail = normalizeValue(order.customer_email);
        const orderPhone = normalizeValue(order.customer_phone || order.customer_whatsapp || '');
        const orderName = normalizeValue(order.customer_name || '');

        return (
          (userEmail && orderEmail && userEmail === orderEmail) ||
          (userPhone && orderPhone && userPhone === orderPhone) ||
          (userName && orderName && userName === orderName)
        );
      });

      const latestOrder = matchedOrders[0] || null;

      return {
        id: u.id,
        email: u.email || '—',
        // Prefer explicit phone, then whatsapp stored in metadata, then fallback to placeholder
        phone: u.phone || u.user_metadata?.phone || u.user_metadata?.whatsapp || '—',
        name: u.user_metadata?.full_name || u.user_metadata?.name || '—',
        avatar_url: u.user_metadata?.avatar_url || null,
        provider: u.app_metadata?.provider || 'email',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        confirmed: !!u.email_confirmed_at,
        banned: u.banned_until ? new Date(u.banned_until) > new Date() : false,
        has_orders: matchedOrders.length > 0,
        order_count: matchedOrders.length,
        latest_order_status: latestOrder?.status || null,
        latest_order_date: latestOrder?.created_at || null,
        order_state: matchedOrders.length > 0 ? 'Placed Order' : 'Account Only',
      };
    });

    users.sort((a, b) => {
      if (a.has_orders !== b.has_orders) {
        return Number(b.has_orders) - Number(a.has_orders);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return NextResponse.json({ users, total: users.length });
  } catch (err) {
    console.error('Users API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/users — admin-only: ban or unban a user
export async function PATCH(request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, action } = await request.json();
    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and Action are required.' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    if (action === 'ban') {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: '876000h' // Banned for 100 years
      });
      if (error) throw error;
      return NextResponse.json({ success: true, message: 'User banned successfully.' });
    } else if (action === 'unban') {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: 'none' // Remove ban
      });
      if (error) throw error;
      return NextResponse.json({ success: true, message: 'User unbanned successfully.' });
    } else {
      return NextResponse.json({ error: 'Invalid action. Must be ban or unban.' }, { status: 400 });
    }
  } catch (err) {
    console.error('Ban/Unban API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
