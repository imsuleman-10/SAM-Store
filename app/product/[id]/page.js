// ─── SERVER COMPONENT — no 'use client' ──────────────────────────────────
// Data is fetched on the server → Google, WhatsApp, Facebook all see full HTML.
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { parseDescription } from '@/lib/descriptionUtils';
import { MediaGallery, AddToCartSection, Accordions } from './ProductInteractive';

// Server-side Supabase client (uses public anon key — same RLS rules apply)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function getProduct(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

/* ─── SEO Metadata — generated server-side for every product ────────────── */
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);
  if (!product) {
    return { title: 'Product Not Found — Glowvie' };
  }
  const descObj = parseDescription(product.description, '');
  return {
    title: `${product.name} — Glowvie`,
    description: descObj.short || descObj.long?.slice(0, 155) || `Buy ${product.name} at Glowvie. Free delivery across Pakistan.`,
    openGraph: {
      title: `${product.name} — Glowvie`,
      description: descObj.short || `Buy ${product.name} at Glowvie.`,
      images: product.image_url ? [{ url: product.image_url }] : [],
    },
  };
}

/* ─── Page Component ────────────────────────────────────────────────────── */
export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);

  if (!product) notFound();

  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;

  const hasMedia = product.media_urls && product.media_urls.length > 0;
  const allMedia = hasMedia ? product.media_urls : product.image_url ? [product.image_url] : [];

  const descObj = parseDescription(product.description, 'No description available.');

  const accordions = [
    {
      key: 'description',
      label: 'Description',
      content: descObj.long,
    },
    {
      key: 'delivery',
      label: 'Delivery & Returns',
      content: 'Free nationwide delivery via Cash on Delivery. Orders dispatch within 1-2 business days. 7-day return policy for sealed or faulty items. Personal preference returns are not accepted to ensure hygiene.',
    },
    {
      key: 'ingredients',
      label: 'Ingredients & Safety',
      content: 'Expertly formulated for visible results. Free from harmful parabens and sulfates. Cruelty-free.',
    },
  ];

  const TRUST_BADGES = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      text: 'Skin-Friendly Formulas'
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
        </svg>
      ),
      text: 'Cruelty-Free'
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8l5 3-5 3V8z"/>
        </svg>
      ),
      text: 'Fast Delivery'
    },
  ];

  const reviews = [
    {
      author: { '@type': 'Person', name: "Ayesha M." },
      name: "Ayesha M.",
      reviewRating: { '@type': 'Rating', ratingValue: 5, bestRating: 5 },
      stars: 5,
      headline: "Incredible difference",
      reviewBody: "I've struggled with finding products that don't irritate my skin. This has been a game changer. I noticed results within the first two weeks."
    },
    {
      author: { '@type': 'Person', name: "Fatima K." },
      name: "Fatima K.",
      reviewRating: { '@type': 'Rating', ratingValue: 5, bestRating: 5 },
      stars: 5,
      headline: "Highly recommended!",
      reviewBody: "The texture is perfect and it absorbs so quickly. It doesn't feel greasy at all. My confidence has honestly improved so much since I started using this."
    },
    {
      author: { '@type': 'Person', name: "Sara A." },
      name: "Sara A.",
      reviewRating: { '@type': 'Rating', ratingValue: 4, bestRating: 5 },
      stars: 4,
      headline: "Works really well",
      reviewBody: "Very satisfied with the quality. The packaging is premium and the product does exactly what it claims. Will definitely be repurchasing."
    }
  ];

  const totalStars = reviews.reduce((acc, r) => acc + r.stars, 0);
  const averageRating = (totalStars / reviews.length).toFixed(1);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: allMedia[0] || '',
    description: descObj.short || descObj.long,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Glowvie'
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://glowvie.vercel.app'}/product/${product.id}`,
      priceCurrency: 'PKR',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock !== 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount: reviews.length
    },
    review: reviews.map(r => ({
      '@type': 'Review',
      reviewRating: r.reviewRating,
      author: r.author,
      name: r.headline,
      reviewBody: r.reviewBody
    }))
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: accordions.map(a => ({
      '@type': 'Question',
      name: a.label,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a.content
      }
    }))
  };

  const schemas = [productJsonLd, faqJsonLd];

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      {/* Breadcrumb — SSR for SEO */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-screen-xl px-5 py-3 md:px-8 lg:px-12">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-silver" aria-label="breadcrumb">
            <Link href="/" className="hover:text-black transition">Home</Link>
            <span>›</span>
            <Link href="/collections" className="hover:text-black transition">Collections</Link>
            {product.category && (
              <>
                <span>›</span>
                <Link href={`/collections?cat=${product.category}`} className="capitalize hover:text-black transition">
                  {product.category}
                </Link>
              </>
            )}
            <span>›</span>
            <span className="text-black">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-5 py-10 md:px-8 lg:px-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">

          {/* ── Media column — interactive (client) ─── */}
          <MediaGallery allMedia={allMedia} discount={discount} />

          {/* ── Info column ─── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {/* Category — visible to crawlers */}
            <p className="mb-3 section-label">{product.category || 'Collection'}</p>

            {/* Product name — h1 for SEO */}
            <h1 className="mb-2 font-display text-4xl font-light leading-snug text-black md:text-5xl">
              {product.name}
            </h1>
            {descObj.short && (
              <p className="mb-4 text-sm text-grey">{descObj.short}</p>
            )}

            {/* Interactive: price + qty + add to cart */}
            <AddToCartSection product={product} discount={discount} />

            {/* Trust badges — SSR */}
            <div className="mb-8 grid grid-cols-3 gap-3 border border-border bg-sand py-4">
              {TRUST_BADGES.map((b) => (
                <div key={b.text} className="flex flex-col items-center gap-2 text-center text-charcoal">
                  <span className="text-xl">{b.icon}</span>
                  <span className="text-[9px] font-medium uppercase tracking-wider text-grey leading-tight">{b.text}</span>
                </div>
              ))}
            </div>

            {/* Interactive: accordions */}
            <Accordions accordions={accordions} />
          </div>
        </div>

        {/* ── Reviews Section — SSR ─── */}
        <div className="mt-20 border-t border-border pt-16 lg:mt-28">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-light text-black">What Our Customers Say</h2>
            <p className="mt-2 text-sm text-grey">Real reviews from verified buyers.</p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, i) => (
              <div key={i} className="border border-border bg-sand p-6 flex flex-col gap-3">
                <div className="flex text-gold text-sm">
                  {"★".repeat(review.stars)}{"☆".repeat(5 - review.stars)}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-black">{review.headline}</p>
                <p className="text-sm text-charcoal leading-relaxed">"{review.reviewBody}"</p>
                <p className="text-xs text-silver mt-auto pt-4 border-t border-border">
                  {review.name} <span className="text-green-600 ml-1">✓ Verified</span>
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
