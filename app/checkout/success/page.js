'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get('order');

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-white px-5 py-16">
      <div className="max-w-md w-full text-center">

        {/* Checkmark */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center border-2 border-black">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Title */}
        <p className="mb-3 section-label">Order Confirmed</p>
        <h1 className="mb-5 font-display text-4xl font-light text-black leading-snug">
          Thank You for<br />Your Order!
        </h1>

        {/* Order reference */}
        {orderId && (
          <div className="mb-6 inline-block border border-border bg-sand px-6 py-3">
            <p className="text-[10px] uppercase tracking-widest text-silver mb-1">Order Reference</p>
            <p className="font-mono text-lg font-semibold text-black tracking-widest">#{orderId}</p>
          </div>
        )}

        {/* Info */}
        <div className="mb-8 space-y-3 text-sm leading-7 text-grey">
          <p>Aapka order successfully place ho gaya hai. Hamari team aapko jald <strong className="text-black">call ya WhatsApp</strong> karay gi to confirm your order.</p>
          <p className="text-[11px] uppercase tracking-widest text-silver">Cash on Delivery · No Advance Payment</p>
        </div>

        {/* Trust row */}
        <div className="mb-8 grid grid-cols-3 gap-3 border border-border bg-sand py-5">
          {[
            { icon: '🚚', text: 'Free Delivery' },
            { icon: '💵', text: 'Pay on Delivery' },
            { icon: '↩️', text: '7-Day Returns' },
          ].map(b => (
            <div key={b.text} className="flex flex-col items-center gap-1.5">
              <span className="text-xl">{b.icon}</span>
              <span className="text-[9px] font-medium uppercase tracking-wider text-grey">{b.text}</span>
            </div>
          ))}
        </div>

        <Link href="/" className="btn btn-primary block w-full text-center">
          Continue Shopping
        </Link>
        <Link href="/collections" className="mt-3 block text-center text-[10px] uppercase tracking-widest text-grey hover:text-black transition">
          Browse Collections
        </Link>
      </div>
    </div>
  );
}
