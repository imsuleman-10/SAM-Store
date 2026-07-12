'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartContext';

export default function CartPage() {
  const { cart, updateQty, removeFromCart, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center border border-border">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.4">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="square" strokeLinejoin="miter"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
        <p className="section-label mb-3">Your bag is empty</p>
        <h1 className="mb-4 font-display text-3xl font-light text-black">Nothing here yet</h1>
        <p className="mb-8 text-sm text-grey">Explore our collections and add your favourite pieces.</p>
        <Link href="/" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Page header */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-screen-xl px-5 py-8 md:px-8 lg:px-12">
          <p className="section-label mb-2">Shopping bag</p>
          <h1 className="font-display text-4xl font-light text-black">Your Bag</h1>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-5 py-10 md:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.8fr_0.7fr]">

          {/* ── Cart items ─── */}
          <div className="divide-y divide-border border-t border-border">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-5 py-6 sm:gap-8">
                {/* Thumbnail */}
                <Link href={`/product/${item.id}`} className="shrink-0">
                  {item.media_url ? (
                    /\.(mp4|webm|ogg|mov)$/i.test(item.media_url) ? (
                      <video
                        src={item.media_url}
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="h-32 w-24 object-cover bg-stone sm:h-36 sm:w-28"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.media_url}
                        alt={item.name}
                        className="h-32 w-24 object-cover bg-stone sm:h-36 sm:w-28"
                      />
                    )
                  ) : (
                    <div className="flex h-32 w-24 items-center justify-center bg-stone text-2xl sm:h-36 sm:w-28">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                        <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                      </svg>
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    {item.category && (
                      <p className="mb-1 text-[10px] uppercase tracking-widest text-silver">{item.category}</p>
                    )}
                    <Link href={`/product/${item.id}`}>
                      <h2 className="mb-1 font-display text-xl font-light text-black hover:text-charcoal transition">
                        {item.name}
                      </h2>
                    </Link>
                    <p className="text-sm font-medium text-black">
                      Rs {Number(item.price).toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    {/* Qty control */}
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="flex h-9 w-9 items-center justify-center text-lg transition hover:bg-sand"
                      >
                        −
                      </button>
                      <span className="flex h-9 w-10 items-center justify-center border-x border-border text-sm">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="flex h-9 w-9 items-center justify-center text-lg transition hover:bg-sand"
                      >
                        +
                      </button>
                    </div>

                    {/* Line total + remove */}
                    <div className="text-right">
                      <p className="mb-1 text-sm font-medium text-black">
                        Rs {(item.price * item.qty).toLocaleString()}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[10px] uppercase tracking-widest text-grey underline-offset-2 hover:text-black hover:underline transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Order Summary ─── */}
          <div>
            <div className="sticky top-24 border border-border bg-sand p-7">
              <h2 className="mb-6 font-display text-2xl font-light text-black">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-grey">
                  <span>Subtotal ({cart.reduce((a, i) => a + i.qty, 0)} items)</span>
                  <span>Rs {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-grey">
                  <span>Delivery</span>
                  <span className="font-medium text-black">Free</span>
                </div>
                <div className="flex justify-between text-grey">
                  <span>Payment</span>
                  <span>Cash on Delivery</span>
                </div>
              </div>
              <hr className="divider my-5" />
              <div className="mb-6 flex justify-between text-lg font-medium text-black">
                <span>Total</span>
                <span>Rs {total.toLocaleString()}</span>
              </div>
              <Link href="/checkout" className="btn btn-primary block w-full text-center">
                Proceed to Checkout
              </Link>
              <Link href="/" className="mt-4 block text-center text-[10px] uppercase tracking-widest text-grey hover:text-black transition">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
