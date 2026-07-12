import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Disable caching so this runs fresh every time
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Check for a secret token if you want to secure this endpoint
    // Optional: const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return new NextResponse('Unauthorized', { status: 401 });

    // Perform a very lightweight query to keep the Supabase project active
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase keep-alive error:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log('Supabase keep-alive ping successful');
    return NextResponse.json({
      success: true,
      message: 'Supabase pinged successfully to prevent pausing.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Keep-alive exception:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
