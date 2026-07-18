'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { parseDescription } from '@/lib/descriptionUtils';

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [addedMsg, setAddedMsg] = useState(false);
  const [openAccordion, setOpenAccordion] = useState('description');
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product || null);
        setLoading(false);
      });
  }, [params.id]);

  function handleAddToCart() {
    addToCart(product, qty);
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2200);
  }

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent mx-auto" />
        <p className="section-label">Loading product...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="flex min-h-[60vh] items-center justify-center text-center">
      <div>
        <p className="section-label mb-3">Product not found</p>
        <Link href="/" className="btn btn-primary">Back to shop</Link>
      </div>
    </div>
  );

  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;

  const hasMedia = product.media_urls && product.media_urls.length > 0;
  const allMedia = hasMedia ? product.media_urls : product.image_url ? [product.image_url] : [];
  const mainMedia = allMedia[activeMediaIndex] || null;

  function isVideoUrl(url) {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov)$/i.test(url) || url.includes('video');
  }

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
      content: 'Clinically tested and dermatologist-approved. Free from harmful parabens and sulfates. Cruelty-free.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-screen-xl px-5 py-3 md:px-8 lg:px-12">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-silver">
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

          {/* ── Media column ─── */}
          <div>
            {/* Main image */}
            <div className="relative overflow-hidden bg-stone">
              {mainMedia ? (
                isVideoUrl(mainMedia) ? (
                  <video
                    src={mainMedia}
                    controls
                    autoPlay={false}
                    muted
                    loop
                    playsInline
                    className="aspect-[4/5] w-full object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mainMedia}
                    alt={product.name}
                    className="aspect-[4/5] w-full object-cover"
                  />
                )
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-stone">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                    <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                  </svg>
                </div>
              )}
              {/* Sale badge */}
              {discount && (
                <span className="badge-sale absolute left-0 top-4">-{discount}%</span>
              )}
            </div>

            {/* Thumbnail strip */}
            {allMedia.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
                {allMedia.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`shrink-0 overflow-hidden border transition ${
                      activeMediaIndex === idx ? 'border-black' : 'border-transparent opacity-60 hover:opacity-90'
                    }`}
                  >
                    {isVideoUrl(url) ? (
                      <video
                        src={url}
                        muted
                        className="h-20 w-16 object-cover"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={url}
                        alt={`view ${idx + 1}`}
                        className="h-20 w-16 object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info column ─── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {/* Category */}
            <p className="mb-3 section-label">{product.category || 'Collection'}</p>

            {/* Name & Short Description */}
            <h1 className="mb-2 font-display text-4xl font-light leading-snug text-black md:text-5xl">
              {product.name}
            </h1>
            {descObj.short && (
              <p className="mb-4 text-sm text-grey">{descObj.short}</p>
            )}

            {/* Price */}
            <div className="mb-6 flex items-center gap-4">
              <span className="text-2xl font-medium text-black">
                Rs {Number(product.price).toLocaleString()}
              </span>
              {product.compare_at_price && (
                <>
                  <span className="text-lg text-silver line-through">
                    Rs {Number(product.compare_at_price).toLocaleString()}
                  </span>
                  <span className="badge-sale">{discount}% OFF</span>
                </>
              )}
            </div>

            <hr className="divider mb-6" />

            {/* Quantity selector */}
            <div className="mb-6">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-grey">Quantity</p>
              <div className="flex items-center gap-0 border border-border w-fit">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center transition hover:bg-sand text-xl"
                >
                  −
                </button>
                <span className="flex h-11 w-12 items-center justify-center border-x border-border text-sm font-medium">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="flex h-11 w-11 items-center justify-center transition hover:bg-sand text-xl"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mb-6 flex flex-col gap-3">
              <button
                className={`btn btn-primary w-full transition-all ${addedMsg ? 'bg-green-800 border-green-800' : ''}`}
                onClick={handleAddToCart}
              >
                {addedMsg ? '✓ Added to bag' : `Add to bag — Rs ${(product.price * qty).toLocaleString()}`}
              </button>
              <button
                className="btn btn-outline w-full"
                onClick={() => {
                  addToCart(product, qty);
                  router.push('/checkout');
                }}
              >
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div className="mb-8 grid grid-cols-3 gap-3 border border-border bg-sand py-4">
              {[
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  ),
                  text: 'Dermatologist Tested'
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
              ].map((b) => (
                <div key={b.text} className="flex flex-col items-center gap-2 text-center text-charcoal">
                  <span className="text-xl">{b.icon}</span>
                  <span className="text-[9px] font-medium uppercase tracking-wider text-grey leading-tight">{b.text}</span>
                </div>
              ))}
            </div>

            {/* Accordions */}
            <div className="divide-y divide-border border-y border-border">
              {accordions.map((acc) => (
                <div key={acc.key}>
                  <button
                    className="flex w-full items-center justify-between py-4 text-left"
                    onClick={() => setOpenAccordion(openAccordion === acc.key ? null : acc.key)}
                  >
                    <span className="text-[11px] font-medium uppercase tracking-widest text-black">
                      {acc.label}
                    </span>
                    <span className="text-lg text-grey">
                      {openAccordion === acc.key ? '−' : '+'}
                    </span>
                  </button>
                  {openAccordion === acc.key && (
                    <div className="pb-5 text-sm leading-7 text-charcoal animate-slideDown whitespace-pre-line">
                      {acc.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* ── Reviews Section ─── */}
        <div className="mt-20 border-t border-border pt-16 lg:mt-28">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-light text-black">Real Results</h2>
            <p className="mt-2 text-sm text-grey">What our customers are saying.</p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Ayesha M.",
                stars: 5,
                title: "Incredible difference",
                text: "I've struggled with finding products that don't irritate my skin. This has been a game changer. I noticed results within the first two weeks."
              },
              {
                name: "Fatima K.",
                stars: 5,
                title: "Highly recommended!",
                text: "The texture is perfect and it absorbs so quickly. It doesn't feel greasy at all. My confidence has honestly improved so much since I started using this."
              },
              {
                name: "Sara A.",
                stars: 4,
                title: "Works really well",
                text: "Very satisfied with the quality. The packaging is premium and the product does exactly what it claims. Will definitely be repurchasing."
              }
            ].map((review, i) => (
              <div key={i} className="border border-border bg-sand p-6 flex flex-col gap-3">
                <div className="flex text-gold text-sm">
                  {"★".repeat(review.stars)}{"☆".repeat(5-review.stars)}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-black">{review.title}</p>
                <p className="text-sm text-charcoal leading-relaxed">"{review.text}"</p>
                <p className="text-xs text-silver mt-auto pt-4 border-t border-border">{review.name} <span className="text-green-600 ml-1">✓ Verified</span></p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
