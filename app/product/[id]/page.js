'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';

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

  const accordions = [
    {
      key: 'description',
      label: 'Description',
      content: product.description || 'No description available.',
    },
    {
      key: 'delivery',
      label: 'Delivery & Returns',
      content: 'Free nationwide delivery via Cash on Delivery. Orders dispatch within 1-2 business days and arrive in 2-3 working days to major cities. 7-day hassle-free return policy.',
    },
    {
      key: 'care',
      label: 'Care Instructions',
      content: 'Dry clean recommended for embroidered pieces. Hand wash delicate fabrics in cold water. Do not bleach. Iron on low heat. Store flat or hanging in a cool, dry place.',
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

            {/* Name */}
            <h1 className="mb-4 font-display text-4xl font-light leading-snug text-black md:text-5xl">
              {product.name}
            </h1>

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
                { icon: '🚚', text: 'Free Delivery' },
                { icon: '💵', text: 'Cash on Delivery' },
                { icon: '↩️', text: '7-Day Returns' },
              ].map((b) => (
                <div key={b.text} className="flex flex-col items-center gap-1 text-center">
                  <span className="text-lg">{b.icon}</span>
                  <span className="text-[9px] font-medium uppercase tracking-wider text-grey">{b.text}</span>
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
      </div>
    </div>
  );
}
