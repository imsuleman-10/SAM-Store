import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminSession } from '@/lib/authHelper';
import nodemailer from 'nodemailer';

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orderId, email, subject, message } = await request.json();

  if (!orderId || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return NextResponse.json({ error: 'Email SMTP credentials not configured' }, { status: 500 });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Glowvie" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject || `Update regarding your order #${orderId.slice(0,8).toUpperCase()}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; text-align: center; border: 1px solid #eaeaea;">
          <h1 style="font-size: 24px; font-weight: 300; letter-spacing: 4px; color: #000000; margin-bottom: 30px;">Glowvie</h1>
          <p style="font-size: 14px; color: #666666; margin-bottom: 30px; text-align: left; white-space: pre-wrap;">${message}</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea;">
            <p style="font-size: 12px; color: #999999;">Glowvie Store<br>This email was sent by the admin regarding your recent order.</p>
          </div>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send admin email', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
