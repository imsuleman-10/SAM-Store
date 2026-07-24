'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';

function isVideoUrl(url) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)$/i.test(url) || url.includes('video');
}

/* ─── Media Gallery ─────────────────────────────────────────────────────── */
export function MediaGallery({ allMedia, discount }) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const mainMedia = allMedia[activeMediaIndex] || null;

  return (
    <div>
      {/* Main media */}
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
              alt="Product"
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
                <video src={url} muted className="h-20 w-16 object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={`view ${idx + 1}`} className="h-20 w-16 object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Add to Cart / Buy Now ─────────────────────────────────────────────── */
export function AddToCartSection({ product, discount }) {
  const [qty, setQty] = useState(1);
  const [addedMsg, setAddedMsg] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();

  function handleAddToCart() {
    addToCart(product, qty);
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2200);
  }

  return (
    <>
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
    </>
  );
}

/* ─── Accordions ─────────────────────────────────────────────────────────── */
export function Accordions({ accordions }) {
  const [openAccordion, setOpenAccordion] = useState('description');

  return (
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
  );
}
