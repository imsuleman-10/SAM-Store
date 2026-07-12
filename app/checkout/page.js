'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function placeOrder() {
    if (!form.name || !form.phone || !form.city || !form.address) {
      setError('Please fill in all fields before placing your order.');
      return;
    }
    setSubmitting(true);
    setError('');

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_city: form.city,
        customer_address: form.address,
        total,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong. Please try again.');
      return;
    }

    clearCart();
    router.push(`/checkout/success?order=${data.order.id.slice(0, 8).toUpperCase()}`);
  }

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
        <p className="section-label mb-3">Checkout</p>
        <h1 className="mb-4 font-display text-3xl font-light">Your bag is empty</h1>
        <p className="mb-8 text-sm text-grey">Add some products first to complete your purchase.</p>
        <Link href="/" className="btn btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Page header */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-screen-xl px-5 py-8 md:px-8 lg:px-12">
          <p className="section-label mb-2">Checkout</p>
          <h1 className="font-display text-4xl font-light text-black">Complete Your Order</h1>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-5 py-10 md:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr]">

          {/* ── Shipping form ─── */}
          <div>
            <div className="mb-8 border border-border p-7">
              <h2 className="mb-6 font-display text-2xl font-light text-black">Shipping Details</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-grey">
                    Full Name *
                  </label>
                  <input
                    className="input"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Ahmed Khan"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-grey">
                    Phone Number *
                  </label>
                  <input
                    className="input"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-grey">
                    City *
                  </label>
                  <input
                    className="input"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    placeholder="Lahore"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-grey">
                    Delivery Address *
                  </label>
                  <input
                    className="input"
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
                    placeholder="House #, Street, Area"
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="border border-border bg-sand p-7">
              <h2 className="mb-4 font-display text-2xl font-light text-black">Payment Method</h2>
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 border-black bg-black">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold text-black">Cash on Delivery (COD)</p>
                  <p className="text-sm leading-6 text-grey">
                    Pay in cash when your order is delivered to your doorstep. No card or online payment required.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Order summary ─── */}
          <div>
            <div className="sticky top-24 border border-border bg-sand p-7">
              <h2 className="mb-6 font-display text-2xl font-light text-black">Order Summary</h2>

              {/* Items list */}
              <div className="mb-5 max-h-64 space-y-4 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-14 w-11 shrink-0 object-cover bg-stone"
                      />
                    ) : (
                      <div className="flex h-14 w-11 shrink-0 items-center justify-center bg-stone">
                        <span className="text-xl">🛍️</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-black">{item.name}</p>
                      <p className="text-xs text-grey">Qty: {item.qty}</p>
                    </div>
                    <p className="shrink-0 text-sm font-medium text-black">
                      Rs {(item.price * item.qty).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <hr className="divider" />

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-grey">
                  <span>Subtotal</span>
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

              {error && (
                <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                className="btn btn-primary w-full"
                disabled={submitting}
                onClick={placeOrder}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Placing order...
                  </span>
                ) : (
                  'Place Order — COD'
                )}
              </button>

              <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-grey">
                Secure checkout · Free delivery
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
