'use client';

import Link from 'next/link';
import { useCart } from './CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;

  return (
    <article className="group relative bg-white">
      {/* Image container */}
      <Link href={`/product/${product.id}`} className="relative block overflow-hidden bg-stone">
        {/* Sale badge */}
        {discount && (
          <span className="badge-sale absolute left-0 top-3 z-10">
            -{discount}%
          </span>
        )}
        {/* New badge if no sale */}
        {!discount && (
          <span className="badge-new absolute left-0 top-3 z-10">New</span>
        )}

        {/* Product image */}
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center bg-stone text-6xl text-warm">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
            </svg>
          </div>
        )}

        {/* Quick-add overlay */}
        <div className="product-overlay">
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product, 1);
            }}
            className="btn btn-white text-[10px] shadow-soft"
          >
            Quick Add
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="px-3 pt-4 pb-3">
        {/* Category */}
        <p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-silver">
          {product.category || 'Collection'}
        </p>

        {/* Name */}
        <Link href={`/product/${product.id}`}>
          <h3 className="mb-2 font-display text-lg font-light text-black transition hover:text-charcoal leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="font-medium text-sm text-black">
            Rs {Number(product.price).toLocaleString()}
          </span>
          {product.compare_at_price && (
            <span className="text-sm text-silver line-through">
              Rs {Number(product.compare_at_price).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
