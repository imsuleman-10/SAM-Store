require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Check if cart_items table exists by trying to select from it
  const { data, error } = await supabase.from('cart_items').select('*').limit(1);
  if (error) {
    console.error('cart_items error:', error.message);
  } else {
    console.log('cart_items exists');
  }

  // Check auth setup
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Auth error:', authError.message);
  } else {
    console.log(`Auth is active, found ${users.length} users`);
  }
}
run();
