import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyPassword } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required.' }, { status: 400 });
  }

  const SUPER_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sam.co';
  const SUPER_ADMIN_PASS = process.env.ADMIN_PASSWORD;

  let staffUser = null;
  let isSuperAdmin = false;

  if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASS) {
    isSuperAdmin = true;
  } else {
    // Check database
    if (!supabaseAdmin) return NextResponse.json({ error: 'Server misconfigured.' }, { status: 500 });
    
    const { data, error } = await supabaseAdmin
      .from('staff')
      .select('*')
      .eq('email', email)
      .single();
      
    if (error || !data) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }
    
    if (data.status !== 'active') {
      return NextResponse.json({ error: 'This account is frozen. Contact administrator.' }, { status: 403 });
    }
    
    if (!verifyPassword(password, data.password_hash)) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }
    
    staffUser = data;
  }

  // Generate Session ID
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  // Store session in DB
  let sessionStored = false;
  if (supabaseAdmin) {
    const { error: sessionError } = await supabaseAdmin
      .from('admin_sessions')
      .insert({
        session_id: sessionId,
        staff_id: staffUser ? staffUser.id : null,
        is_super_admin: isSuperAdmin,
        expires_at: expiresAt.toISOString()
      });

    if (sessionError) {
      console.error('Session Error:', sessionError);
      if (isSuperAdmin && sessionError.code === '42P01') {
         console.warn('admin_sessions table does not exist. Using fallback session for super admin.');
      } else {
         return NextResponse.json({ error: 'Failed to create session. Run SQL script.' }, { status: 500 });
      }
    } else {
      sessionStored = true;
    }
  }

  const response = NextResponse.json({ success: true, role: isSuperAdmin ? 'admin' : staffUser.role });

  // Super admin from env vars always uses 'valid' fallback cookie
  // Otherwise use the DB sessionId
  const cookieValue = isSuperAdmin ? 'valid' : sessionId;

  response.cookies.set('baroque_admin_session', cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}
