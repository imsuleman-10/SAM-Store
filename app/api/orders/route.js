import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';

// GET /api/orders — admin only, list all orders
export async function GET() {
  const session = cookies().get('baroque_admin_session');
  if (!session || session.value !== 'valid') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}

// POST /api/orders — public, called from checkout (Cash on Delivery only)
export async function POST(request) {
  const body = await request.json();
  const { items, customer_email, customer_name, customer_phone, customer_whatsapp, customer_city, customer_address, total } = body;

  if (!items || !items.length || !customer_name || !customer_phone || !customer_city || !customer_address) {
    return NextResponse.json({ error: 'Please fill in all required fields before placing your order.' }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert([{ items, customer_email, customer_name, customer_phone, customer_whatsapp, customer_city, customer_address, total, status: 'pending' }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send Order Confirmation Email
  if (customer_email && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      let itemsHtml = items.map(item => `<li>${item.name} (x${item.qty}) - Rs ${(item.price * item.qty).toLocaleString()}</li>`).join('');

      await transporter.sendMail({
        from: `"SAM&CO" <${process.env.GMAIL_USER}>`,
        to: customer_email,
        subject: `Order Confirmed #${data.id.slice(0,8).toUpperCase()}`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; text-align: center; border: 1px solid #eaeaea;">
            <h1 style="font-size: 24px; font-weight: 300; letter-spacing: 4px; color: #000000; margin-bottom: 30px;">SAM&CO</h1>
            <p style="font-size: 14px; color: #666666; margin-bottom: 30px;">Hi ${customer_name},</p>
            <p style="font-size: 14px; color: #666666; margin-bottom: 30px;">Thank you for your order! Your order has been successfully placed and will be dispatched soon.</p>
            <div style="background-color: #f9f9f9; border: 1px solid #eaeaea; padding: 20px; margin-bottom: 30px; text-align: left;">
              <h3 style="margin-top: 0;">Order #${data.id.slice(0,8).toUpperCase()}</h3>
              <ul style="padding-left: 20px;">
                ${itemsHtml}
              </ul>
              <h3 style="border-top: 1px solid #ccc; padding-top: 10px; margin-bottom: 0;">Total: Rs ${Number(total).toLocaleString()} (Cash on Delivery)</h3>
            </div>
            <p style="font-size: 14px; color: #666666;">We will contact you at <strong>${customer_whatsapp || customer_phone}</strong> if we need any further information.</p>
          </div>
        `
      });
    } catch (e) {
      console.error("Failed to send email", e);
    }
  }

  return NextResponse.json({ order: data });
}
