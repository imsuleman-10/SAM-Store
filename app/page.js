import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import NewsletterForm from '@/components/NewsletterForm';
import HeroSlider from '@/components/HeroSlider';
import HomepageVideoPlayer from '@/components/HomepageVideoPlayer';

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

async function getResultImages() {
  const { data, error } = await supabase
    .from('result_images')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error(error); return []; }
  return data;
}

async function getHeroSlides() {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin
    .from('hero_slides')
    .select('id, image_url, heading, subtitle, link_url, video_url')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) return [];
  return (data || []).map(slide => ({
    id: slide.id,
    image: slide.image_url,
    heading: slide.heading,
    sub: slide.subtitle,
    link: slide.link_url || '/collections',
    videoUrl: slide.video_url,
  }));
}

async function getHomepageVideos() {
  const { data, error } = await supabase
    .from('homepage_videos')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error(error); return []; }
  return data;
}

const CATEGORIES = [
  {
    label: 'Face Care',
    tag: 'face-care',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    desc: 'Brightening & Anti-Aging',
  },
  {
    label: 'Hair Care',
    tag: 'hair-care',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    desc: 'Nourish & Strengthen',
  },
  {
    label: 'Body Care',
    tag: 'body-care',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80',
    desc: 'Hydrate & Restore',
  },
  {
    label: 'Best Sellers',
    tag: 'bestsellers',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
    desc: 'Top Rated Products',
  },
];

// Dynamic results fetched from database — see getResultImages()
// Dynamic videos will be fetched from the database

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
    title: 'Skin-Friendly Formulas',
    desc: 'Safe & effective formulas',
  },
];


export default async function HomePage() {
  const products = await getProducts();
  const slides = await getHeroSlides();
  const homepageVideos = await getHomepageVideos();
  const resultImages = await getResultImages();

  return (
    <div className="bg-white">

      <div className="flex flex-col h-[100vh] -mt-[104px] bg-black">
        <HeroSlider initialSlides={slides} />
      </div>

      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-screen-xl px-5 py-10 md:px-8 lg:px-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-border text-charcoal">
                  {f.icon}
                </div>
                <div>
                  <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-widest text-black">{f.title}</p>
                  <p className="text-xs text-grey">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              <div className="aspect-[3/4] overflow-hidden bg-stone">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/10 p-5">
                <div>
                  <p className="font-display text-xl font-light tracking-wide text-white">{cat.label}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/60">{cat.desc}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-widest text-white/70 transition group-hover:text-white">
                    Shop now →
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

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

      {homepageVideos && homepageVideos.length > 0 && (
        <section className="bg-sand py-16 lg:py-24">
          <div className="mx-auto max-w-screen-xl px-5 md:px-8 lg:px-12">
            <div className="mb-12 text-center">
              <p className="section-label mb-3">Watch & Learn</p>
              <h2 className="section-title text-3xl text-black md:text-4xl">See the Magic Happen</h2>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-grey">
                Watch how our products work, application tips, and real customer reviews.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {homepageVideos.map((v) => (
                <div key={v.id} className="group overflow-hidden bg-white shadow-soft">
                  <div className="relative aspect-square overflow-hidden bg-black">
                    <HomepageVideoPlayer src={v.video_url} />
                  </div>
                  <div className="p-4">
                    <p className="mb-0.5 text-[10px] font-medium uppercase tracking-widest text-gold">{v.sub}</p>
                    <p className="font-display text-lg font-light text-black">{v.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-border bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-screen-xl px-5 md:px-8 lg:px-12">
          <div className="mb-12 text-center">
            <p className="section-label mb-3">Product Demos</p>
            <h2 className="section-title text-3xl text-black md:text-4xl">See How It Works</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-grey">
              Discover how our products are applied and the visible difference they can make in your daily routine.
            </p>
          </div>

          {resultImages && resultImages.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-3">
              {resultImages.map((r) => (
                <div key={r.id} className="group">
                  <div className="relative mb-5 grid grid-cols-2 gap-1 overflow-hidden">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img src={r.before_url} alt={`Before ${r.product}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white">Before</span>
                    </div>
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img src={r.after_url} alt={`After ${r.product}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      <span className="absolute bottom-2 left-2 bg-white/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-black">After</span>
                    </div>
                    {r.days && (
                      <span className="absolute right-2 top-2 bg-black px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest text-white">
                        {r.days}
                      </span>
                    )}
                  </div>
                  {r.tag && <span className="mb-1 inline-block text-[9px] font-semibold uppercase tracking-[0.2em] text-gold">{r.tag}</span>}
                  <h3 className="mb-1 font-display text-lg font-light text-black">{r.product}</h3>
                  {r.desc && <p className="text-xs leading-6 text-grey">{r.desc}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-grey">No results added yet.</p>
          )}

          <div className="mt-12 text-center">
            <Link href="/collections" className="btn btn-primary inline-flex">
              Shop All Products
            </Link>
          </div>
        </div>
      </section>



      <section className="relative flex min-h-[520px] items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1800&q=80"
          alt="Glowvie Clinical Care"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-2xl px-5 py-16 text-center md:px-8">
          <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.4em] text-white/80">Clinical Efficacy</p>
          <h2 className="mb-6 font-display text-4xl font-light leading-snug text-white md:text-5xl">
            "Backed by science,<br/>crafted for your skin."
          </h2>
          <p className="mx-auto mb-8 max-w-md text-sm leading-7 text-white/90">
            Glowvie integrates dermatological science with premium beauty. Our targeted treatments are formulated to restore your skin's natural balance and radiant glow.
          </p>
          <Link href="/collections" className="btn btn-white">
            Discover Our Science
          </Link>
        </div>
      </section>

      <section className="bg-coal py-16 lg:py-20">
        <div className="mx-auto max-w-2xl px-5 text-center md:px-8">
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.35em] text-white/50">
            Stay in the loop
          </p>
          <h2 className="mb-4 font-display text-3xl font-light text-white md:text-4xl">
            Be the first to know
          </h2>
          <p className="mb-8 text-sm leading-7 text-white/60">
            Subscribe to get exclusive early access to new collections, seasonal sales, and skincare tips.
          </p>
          <div className="mx-auto max-w-md text-left">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}
