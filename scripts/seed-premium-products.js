require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedProducts() {
  const products = [
    {
      name: "DermiVe Moisturizing Wash",
      category: "face-care",
      price: 2850,
      compare_at_price: 3500,
      stock: 120,
      description: JSON.stringify({
        short: "Gentle cleansing for sensitive, dry, and irritated skin.",
        long: "Formulated with ceramides and hyaluronic acid, DermiVe Moisturizing Wash is a dermatologist-recommended cleanser that effectively removes dirt without stripping your skin's natural moisture barrier. Perfect for daily use on both face and body, leaving your skin soft and hydrated."
      }),
      // Using the generated AI image as primary
      image_url: "/images/products/dermive_wash_ai_1784028695728.png",
      media_urls: [
        "/images/products/dermive_wash_ai_1784028695728.png", // AI Image
        "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1200&q=80" // Placeholder for Authentic
      ]
    },
    {
      name: "Roots Hair Treatment Serum",
      category: "hair-care",
      price: 3200,
      compare_at_price: 4500,
      stock: 85,
      description: JSON.stringify({
        short: "Advanced serum for hair fall, frizz, and damaged hair.",
        long: "Transform your hair with Roots Hair Treatment Serum. Infused with potent botanical extracts and argan oil, this luxurious serum deeply nourishes the scalp, reduces hair fall, and tames frizz. Achieve salon-like smoothness and shine from the comfort of your home."
      }),
      image_url: "/images/products/roots_serum_ai_1784028705803.png",
      media_urls: [
        "/images/products/roots_serum_ai_1784028705803.png", // AI Image
        "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      name: "Relax Vitamin C Serum",
      category: "face-care",
      price: 2500,
      compare_at_price: 3200,
      stock: 150,
      description: JSON.stringify({
        short: "Radiant glow targeting dullness, dark spots, and uneven tone.",
        long: "Reveal your true glow with Relax Vitamin C Serum. This potent, fast-absorbing formula brightens dull skin, fades dark spots, and evens out skin tone. Enriched with antioxidants, it protects against environmental stressors for a clinical, radiant finish."
      }),
      image_url: "/images/products/relax_vitamin_c_ai_1784028717382.png",
      media_urls: [
        "/images/products/relax_vitamin_c_ai_1784028717382.png", // AI Image
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      name: "Markaway Stretch Mark Serum",
      category: "body-care",
      price: 4500,
      compare_at_price: 5800,
      stock: 60,
      description: JSON.stringify({
        short: "Clinically proven to reduce pregnancy stretch marks and scars.",
        long: "Markaway Stretch Mark Serum is a deeply restorative treatment formulated to repair and fade stretch marks and scars. Its rich blend of peptides and natural oils improves skin elasticity and texture, making it an essential part of your postpartum or body-care routine."
      }),
      image_url: "/images/products/markaway_serum_ai_1784028726123.png",
      media_urls: [
        "/images/products/markaway_serum_ai_1784028726123.png", // AI Image
        "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      name: "Zafrani Beauty Cream",
      category: "face-care",
      price: 1800,
      compare_at_price: 2200,
      stock: 200,
      description: JSON.stringify({
        short: "Saffron-infused cream for acne marks, freckles, and dark circles.",
        long: "Experience the luxury of Zafrani Beauty Cream. Infused with pure saffron extracts, this rich cream targets stubborn acne marks, freckles, and dark circles. It deeply moisturizes while promoting a flawless, even complexion with daily use."
      }),
      image_url: "/images/products/zafrani_cream_ai_1784028737146.png",
      media_urls: [
        "/images/products/zafrani_cream_ai_1784028737146.png", // AI Image
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1200&q=80"
      ]
    }
  ];

  for (const product of products) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select();

    if (error) {
      console.error(`Error inserting ${product.name}:`, error.message);
    } else {
      console.log(`Inserted: ${product.name} (ID: ${data[0].id})`);
    }
  }
}

seedProducts();
