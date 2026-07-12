import { supabase } from '@/lib/supabaseClient';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';

export const revalidate = 0;

async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);
  if (error) { console.error(error); return []; }
  return data;
}

// ── Category tiles ───────────────────────────────────────────
const CATEGORIES = [
  {
    label: 'Face Care',
    tag: 'face-care',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Beard Care',
    tag: 'beard-care',
    image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Hair Care',
    tag: 'hair-care',
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Body Care',
    tag: 'body-care',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80',
  },
];


// ── Marquee text ─────────────────────────────────────────────
const MARQUEE_TEXT = 'NEW ARRIVALS · FREE DELIVERY ACROSS PAKISTAN · PREMIUM GROOMING ESSENTIALS · CASH ON DELIVERY · EASY RETURNS · AUTHENTIC SAM&CO ·';

// ── Feature icons ─────────────────────────────────────────────
const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 4v4h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    title: 'Free Delivery',
    desc: 'On all orders nationwide',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
    title: 'Cash on Delivery',
    desc: 'Pay when you receive',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
      </svg>
    ),
    title: 'Easy Returns',
    desc: '7-day hassle-free returns',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: '100% Authentic',
    desc: 'Genuine SAM&CO products',
  },
];


export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="bg-white">

      {/* ══════════════════════════════════════════════════════════
          HERO BANNER & MARQUEE (100vh Viewport)
      ══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col h-[100vh] -mt-[104px]">
        <HeroSlider />

        {/* ══════════════════════════════════════════════════════════
            MARQUEE STRIP
        ══════════════════════════════════════════════════════════ */}
        <div className="shrink-0 overflow-hidden border-y border-border bg-sand py-3">
          <div className="flex animate-marquee whitespace-nowrap">
            {/* Double the text for seamless loop */}
            {[MARQUEE_TEXT, MARQUEE_TEXT].map((t, i) => (
              <span key={i} className="mx-8 text-[10px] font-medium uppercase tracking-[0.28em] text-charcoal">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          CATEGORY GRID
      ══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-screen-xl px-5 py-16 md:px-8 lg:px-12 lg:py-20">
        <div className="mb-10 text-center">
          <p className="section-label mb-3">Browse by category</p>
          <h2 className="section-title text-3xl text-black md:text-4xl">Our Collections</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.tag}
              href={`/collections?cat=${cat.tag}`}
              className="group relative overflow-hidden"
            >
              {/* Image */}
              <div className="aspect-[3/4] overflow-hidden bg-stone">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              {/* Label overlay */}
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent p-5">
                <div>
                  <p className="font-display text-xl font-light tracking-wide text-white">{cat.label}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-white/70 transition group-hover:text-gold">
                    Shop now →
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════════════════════ */}
      <section className="border-t border-border bg-sand py-16 lg:py-20">
        <div className="mx-auto max-w-screen-xl px-5 md:px-8 lg:px-12">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-label mb-3">Featured edit</p>
              <h2 className="section-title text-3xl text-black md:text-4xl">Customer Favourites</h2>
            </div>
            <Link href="/collections" className="text-[11px] font-medium uppercase tracking-widest text-charcoal underline-offset-4 hover:underline">
              View all →
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="border border-border bg-white py-24 text-center">
              <p className="section-label">No products yet</p>
              <p className="mt-3 text-sm text-grey">Add products from the admin dashboard.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          BRAND STORY BANNER
      ══════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[520px] items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=1800&q=80"
          alt="SAM&CO brand story"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-2xl px-5 py-16 text-center md:px-8">
          <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.4em] text-white/60">Our story</p>
          <h2 className="mb-6 font-display text-4xl font-light leading-snug text-white md:text-5xl">
            "Crafted with intention,<br/>groomed to perfection."
          </h2>
          <p className="mx-auto mb-8 max-w-md text-sm leading-7 text-white/75">
            Since 2020, SAM&amp;CO has been dedicated to creating premium grooming essentials that celebrate self-care and confidence.
          </p>
          <Link href="/collections" className="btn btn-white">
            Explore the Story
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES STRIP
      ══════════════════════════════════════════════════════════ */}
      <section className="border-t border-border bg-white">
        <div className="mx-auto max-w-screen-xl px-5 py-14 md:px-8 lg:px-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center border border-border text-charcoal">
                  {f.icon}
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-black">{f.title}</p>
                  <p className="text-sm text-grey">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          NEWSLETTER BANNER
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-coal py-16 lg:py-20">
        <div className="mx-auto max-w-2xl px-5 text-center md:px-8">
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.35em] text-white/50">
            Stay in the loop
          </p>
          <h2 className="mb-4 font-display text-3xl font-light text-white md:text-4xl">
            Be the first to know
          </h2>
          <p className="mb-8 text-sm leading-7 text-white/60">
            Subscribe to get exclusive early access to new collections, seasonal sales, and styling tips.
          </p>
          <form className="flex flex-col gap-3 sm:flex-row" method="post" action="#">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 border border-white/20 bg-transparent px-5 py-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/60"
            />
            <button type="submit" className="btn btn-white shrink-0">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
