export const metadata = {
  title: 'Shipping & Return Policy — Glowvie',
  description:
    'Learn about Glowvie shipping process, delivery timelines, quality checks, order cancellations, and our return & exchange policy for Pakistan.',
};

const sections = [
  {
    id: 'order-confirmation',
    title: 'Order Confirmation & Shipping',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8l5 3-5 3V8z" />
      </svg>
    ),
    content: (
      <>
        <p>
          After your order is placed, our team contacts you to confirm your delivery address and order
          details — ensuring a smooth and accurate delivery every time.
        </p>
        <p className="mt-4">
          Orders are processed <strong className="text-black">Monday through Saturday</strong>. If your
          order is confirmed before <strong className="text-black">4:00 PM</strong>, it is dispatched the
          same day. Orders confirmed after 4:00 PM are dispatched the next working day.
        </p>
        <p className="mt-4">
          Delivery timelines vary based on your location and courier availability. We ship via
          Pakistan&apos;s trusted courier partners, and{' '}
          <strong className="text-black">Cash on Delivery (COD)</strong> is available nationwide at no
          extra charge.
        </p>
        <ul className="mt-4 list-disc pl-5 space-y-2 text-sm">
          <li>
            <strong className="text-black">Lahore:</strong> 1–2 working days
          </li>
          <li>
            <strong className="text-black">Major cities (Karachi, Islamabad, Rawalpindi, etc.):</strong>{' '}
            2–3 working days
          </li>
          <li>
            <strong className="text-black">Other cities &amp; remote areas:</strong> 3–5 working days
          </li>
        </ul>
        <p className="mt-3 text-xs italic text-silver">
          * Delivery timelines may be slightly extended during sales events or peak periods.
        </p>
      </>
    ),
  },
  {
    id: 'quality-check',
    title: 'Quality Check Before Dispatch',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    content: (
      <>
        <p>
          Every order undergoes a visual inspection before dispatch. For non-sealed products — such as
          creams and serums where the seal can be checked — we verify that there is no damage and that no
          items are missing.
        </p>
        <p className="mt-4">
          Sealed products (such as sealed bottles and boxed packaging) are <strong className="text-black">not
          opened or tampered with</strong>, ensuring the hygiene and freshness of your product is fully
          preserved when it reaches you.
        </p>
      </>
    ),
  },
  {
    id: 'order-cancellation',
    title: 'Order Cancellation',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    content: (
      <>
        <p>
          If you need to cancel your order, please contact us via WhatsApp or our support channel{' '}
          <strong className="text-black">before your order is dispatched</strong>. We will process the
          cancellation promptly.
        </p>
        <p className="mt-4">
          Once an order has been dispatched, cancellation is no longer possible. In that case, you may
          refuse to accept the parcel at the time of delivery, which will initiate the return process
          automatically.
        </p>
        <p className="mt-4">
          If the delivery address provided is incomplete or incorrect, the order may be automatically
          cancelled. Please double-check your address details before placing your order.
        </p>
      </>
    ),
  },
  {
    id: 'return-exchange',
    title: 'Return & Exchange',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <polyline points="1 4 1 10 7 10" />
        <polyline points="23 20 23 14 17 14" />
        <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
      </svg>
    ),
    content: (
      <>
        <div className="rounded-lg border border-border bg-sand p-5 mb-5">
          <p className="text-sm font-semibold text-black mb-1">Wrong Item Received</p>
          <p className="text-sm">
            If you received an item different from what you ordered, please inform us within{' '}
            <strong className="text-black">48 hours</strong> of delivery with a clear{' '}
            <strong className="text-black">unboxing video or photos</strong> as evidence. We will arrange a
            free replacement — no additional charges whatsoever.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-sand p-5 mb-5">
          <p className="text-sm font-semibold text-black mb-1">Damaged or Non-Functional Product</p>
          <p className="text-sm">
            If your product arrives damaged or non-functional, you must submit a claim within{' '}
            <strong className="text-black">24 hours</strong> of delivery along with an{' '}
            <strong className="text-black">uncut, unedited unboxing video</strong>. Claims without this
            evidence cannot be processed.
          </p>
        </div>
        <div className="rounded-lg border border-red-100 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-700 mb-1">Please Note</p>
          <p className="text-sm text-red-700">
            Returns are <strong>not accepted</strong> on the basis of personal preference — such as
            disliking the smell, colour, or texture of a product. Returns are only accepted for genuinely
            faulty or incorrect items. The product must be unused and in its original packaging to be
            eligible.
          </p>
        </div>
      </>
    ),
  },
  {
    id: 'refund-process',
    title: 'Refund & Replacement Process',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    content: (
      <>
        <p>
          Once your claim is reviewed and verified, a replacement or refund will be processed within{' '}
          <strong className="text-black">24 to 48 hours</strong>.
        </p>
        <p className="mt-4">
          All complaints must be submitted exclusively through our{' '}
          <strong className="text-black">official WhatsApp</strong> or via a support ticket so that every
          case is properly tracked and resolved without delay.
        </p>
      </>
    ),
  },
];

export default function ShippingPage() {
  return (
    <main className="bg-white">
      {/* Page header */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-screen-xl px-5 py-16 md:px-8 lg:px-12 text-center">
          <p className="section-label mb-3">Policies</p>
          <h1 className="font-display text-4xl font-light text-black md:text-5xl">
            Shipping &amp; Return Policy
          </h1>
          <p className="mt-4 text-sm text-grey max-w-xl mx-auto leading-7">
            Everything you need to know about how we ship, our quality standards, and how we handle
            returns and exchanges.
          </p>
        </div>
      </div>

      {/* Free delivery banner */}
      <div className="border-b border-border bg-sand">
        <div className="mx-auto max-w-screen-xl px-5 py-5 md:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-left">
            {[
              { label: 'Free Delivery', sub: 'Nationwide — no minimum order' },
              { label: 'Cash on Delivery', sub: 'Pay only when you receive' },
              { label: 'Same-Day Dispatch', sub: 'Confirm before 4:00 PM' },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center sm:items-start px-6 first:border-0 sm:border-l border-border">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-silver mb-0.5">{b.label}</p>
                <p className="text-sm text-grey">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div className="mx-auto max-w-screen-xl px-5 py-16 md:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto space-y-12">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-black">{s.icon}</span>
                <h2 className="font-display text-2xl font-light text-black">{s.title}</h2>
              </div>
              <div className="pl-9 text-sm text-grey leading-7">{s.content}</div>
            </section>
          ))}
        </div>

        {/* Contact strip */}
        <div className="mt-16 max-w-3xl mx-auto border border-border bg-sand p-8 text-center">
          <p className="section-label mb-3">Need Help?</p>
          <h3 className="font-display text-2xl font-light text-black mb-3">Contact Our Support Team</h3>
          <p className="text-sm text-grey mb-6 max-w-md mx-auto leading-7">
            For any order-related queries, returns, or complaints — reach out to us directly. We respond
            promptly during business hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/923234352012"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              WhatsApp Support
            </a>
            <a href="/contact" className="btn btn-secondary">
              Contact Page
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
