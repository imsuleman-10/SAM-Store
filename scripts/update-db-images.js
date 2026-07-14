require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: products } = await supabase.from('products').select('*').in('category', ['face-care', 'hair-care', 'body-care']);
  
  const aiImages = {
    "DermiVe Moisturizing Wash": "/images/products/dermive_main_1784031961863.png",
    "Roots Hair Treatment Serum": "/images/products/roots_main_1784031979917.png",
    "Relax Vitamin C Serum": "/images/products/relax_main_1784031921744.png",
    "Markaway Stretch Mark Serum": "/images/products/markaway_main_1784031932381.png",
    "Zafrani Beauty Cream": "/images/products/zafrani_main_1784031942184.png"
  };

  for (const p of products) {
    if (!aiImages[p.name]) continue;
    
    // Pick first 2 images from what the user uploaded (filtering out videos for the carousel)
    const uploadedImages = p.media_urls.filter(u => u.includes('.webp') || u.includes('.png') || u.includes('.jpg')).slice(0, 2);
    const video = p.media_urls.find(u => u.includes('.mp4'));
    
    const newMediaUrls = [aiImages[p.name], ...uploadedImages];
    if (video) newMediaUrls.push(video);
    
    const { error } = await supabase.from('products').update({ 
      image_url: aiImages[p.name],
      media_urls: newMediaUrls 
    }).eq('id', p.id);
    
    if (error) console.error(`Error updating ${p.name}:`, error);
    else console.log(`Updated ${p.name}`);
  }
}
run();
