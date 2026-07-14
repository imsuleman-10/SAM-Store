require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('products').select('*').in('category', ['face-care', 'hair-care', 'body-care']);
  if (error) {
    console.error(error);
  } else {
    data.forEach(p => {
      console.log(`\n=== ${p.name} ===`);
      console.log(`Main Image: ${p.image_url}`);
      console.log(`Media URLs:`, p.media_urls);
    });
  }
}
run();
