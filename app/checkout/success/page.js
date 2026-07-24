'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';

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
  const email = params.get('email') || '';
  const { user, authLoaded } = useCart();

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
          <p>Your order has been successfully placed. Our team will contact you shortly via <strong className="text-black">call or WhatsApp</strong> to confirm your order and arrange delivery.</p>
          <p className="text-[11px] uppercase tracking-widest text-silver">Cash on Delivery · No Advance Payment</p>
        </div>

        {/* Trust row */}
        <div className="mb-8 grid grid-cols-3 gap-3 border border-border bg-sand py-5">
          {[
            { icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8l5 3-5 3V8z"/></svg>
            ), text: 'Free Delivery' },
            { icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            ), text: 'Pay on Delivery' },
            { icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
            ), text: '7-Day Returns' },
          ].map(b => (
            <div key={b.text} className="flex flex-col items-center gap-1.5">
              <span className="text-grey">{b.icon}</span>
              <span className="text-[9px] font-medium uppercase tracking-wider text-grey">{b.text}</span>
            </div>
          ))}
        </div>

        {/* Guest Signup Prompt */}
        {authLoaded && !user && (
          <div className="mb-8 border border-border bg-sand p-6 text-center">
            <h3 className="font-display text-xl text-black mb-2">Save Your Order History</h3>
            <p className="text-sm text-grey mb-4">Create an account to track this order and enjoy faster checkouts in the future.</p>
            <Link href={`/signup?email=${encodeURIComponent(email)}`} className="btn bg-black text-white hover:bg-grey px-6 py-2 block w-full text-center">
              Create an Account
            </Link>
          </div>
        )}

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
