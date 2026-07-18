import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Missing email or OTP code' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database connection not available.' }, { status: 500 });
    }

    // Find the user by email
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ error: 'Failed to verify. Please try again.' }, { status: 500 });
    }

    const user = usersData?.users?.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ error: 'No account found for this email. Please sign up again.' }, { status: 400 });
    }

    const meta = user.user_metadata || {};
    const storedOtp = meta.pending_otp;
    const otpExpires = meta.otp_expires;

    if (!storedOtp) {
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 });
    }

    // Check expiry
    if (Date.now() > otpExpires) {
      // Delete the unconfirmed user so they can sign up again
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      return NextResponse.json({ error: 'OTP has expired. Please sign up again.' }, { status: 400 });
    }

    // Check code
    if (storedOtp !== code.trim()) {
      return NextResponse.json({ error: 'Incorrect OTP code. Please try again.' }, { status: 400 });
    }

    // Correct! Confirm the user's email and clear OTP from metadata
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      user_metadata: {
        full_name: meta.full_name,
        phone: meta.phone || meta.whatsapp,
        avatar_url: meta.avatar_url,
        pending_otp: null,
        otp_expires: null,
      }
    });

    if (updateError) {
      return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Verify OTP Error:', err.message || err);
    return NextResponse.json({ error: `Error: ${err.message || 'Unknown error'}` }, { status: 500 });
  }
}
