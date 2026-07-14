import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Public supabase client (anon key) for triggering signUp
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { email, password, name, whatsapp } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json({ error: 'Server email credentials are not configured.' }, { status: 500 });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 30 * 60 * 1000; // 30 minutes

    // Delete existing user if previously registered but unconfirmed
    if (supabaseAdmin) {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existing = existingUsers?.users?.find(u => u.email === email);
      if (existing && !existing.email_confirmed_at) {
        await supabaseAdmin.auth.admin.deleteUser(existing.id);
      }
    }

    // Use Supabase's signUp to create the user — we intercept and send our own email
    // Store OTP + metadata in user_metadata via admin API
    if (supabaseAdmin) {
      // Create user directly with admin, confirmed = false so they can't login yet
      // We track OTP in a temp approach: store in user_metadata
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: {
          full_name: name,
          whatsapp,
          pending_otp: otpCode,
          otp_expires: expires,
        }
      });

      if (createErr) {
        return NextResponse.json({ error: createErr.message }, { status: 400 });
      }
    }

    // Send OTP via Gmail
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"SAM&CO" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Your SAM&CO Verification Code: ${otpCode}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; text-align: center; border: 1px solid #eaeaea;">
          <h1 style="font-size: 24px; font-weight: 300; letter-spacing: 4px; color: #000000; margin-bottom: 30px;">SAM&CO</h1>
          <p style="font-size: 14px; color: #666666; margin-bottom: 30px;">Hi ${name},</p>
          <p style="font-size: 14px; color: #666666; margin-bottom: 40px;">Please use the following 6-digit One-Time Password (OTP) to complete your registration. This code will expire in 30 minutes.</p>
          <div style="background-color: #f9f9f9; border: 1px solid #eaeaea; padding: 20px; margin-bottom: 40px;">
            <h2 style="font-size: 36px; letter-spacing: 10px; color: #000000; margin: 0; font-weight: 300;">${otpCode}</h2>
          </div>
          <p style="font-size: 12px; color: #999999;">This code expires in 30 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Send OTP Error:', err.message || err);
    return NextResponse.json({ error: `Error: ${err.message || 'Unknown error occurred'}` }, { status: 500 });
  }
}
