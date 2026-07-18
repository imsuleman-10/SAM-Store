const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  // Test connection
  const { data, error } = await supabase.from('staff').select('id').limit(1);
  if (error) {
    console.error('Connection test failed:', error.message);
  } else {
    console.log('Connected! Attempting to add columns via raw SQL...');
  }

  // Use rpc to run raw SQL if available, or just do a test update to check schema
  const { error: e2 } = await supabase.rpc('exec_sql', { 
    sql: `ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS name TEXT; ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS avatar_url TEXT;`
  });
  
  if (e2) {
    console.log('RPC not available, please run supabase_update_staff_profile.sql manually in your Supabase SQL editor.');
    console.log('SQL to run:');
    console.log(`ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS name TEXT;`);
    console.log(`ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS avatar_url TEXT;`);
  } else {
    console.log('Columns added successfully!');
  }
}

run();
