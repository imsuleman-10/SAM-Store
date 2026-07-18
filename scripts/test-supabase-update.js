require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching a single order...');
  const { data: orders, error } = await supabase.from('orders').select('*').limit(1);
  if (error) {
    console.error('Fetch error:', error);
    return;
  }
  
  if (!orders || orders.length === 0) {
    console.log('No orders found in the database. Creating a mock order first...');
    const { data: newOrder, error: insertError } = await supabase.from('orders').insert({
      customer_name: 'Test Customer',
      customer_phone: '03001234567',
      customer_city: 'Karachi',
      customer_address: '123 Street',
      total: 1000,
      items: [{ name: 'Test Product', qty: 1, price: 1000 }]
    }).select().single();
    
    if (insertError) {
      console.error('Insert error:', insertError);
      return;
    }
    
    console.log('Mock order created with ID:', newOrder.id);
    orders.push(newOrder);
  }
  
  const orderId = orders[0].id;
  console.log(`Testing column update on order: ${orderId}...`);
  const { data: updated, error: updateError } = await supabase
    .from('orders')
    .update({
      courier_company: 'TCS',
      tracking_id: 'TEST123456'
    })
    .eq('id', orderId)
    .select();
    
  if (updateError) {
    console.log('❌ Update failed. Column likely does not exist.');
    console.log('Error details:', updateError.message);
  } else {
    console.log('✅ Success! The columns courier_company and tracking_id already exist and were successfully updated.');
    console.log('Updated order:', updated[0]);
  }
}

run();
