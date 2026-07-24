import Link from 'next/link';
import { getStoreSettings } from '@/lib/storeSettings';
import NewsletterForm from '@/components/NewsletterForm';

const FOOTER_LINKS = {
  Collections: [
    { label: 'New Arrivals', href: '/collections?cat=new' },
    { label: 'Face Care',    href: '/collections?cat=face-care' },
    { label: 'Hair Care',    href: '/collections?cat=hair-care' },
    { label: 'Body Care',    href: '/collections?cat=body-care' },
    { label: 'Sale',         href: '/collections?cat=sale' },
  ],
  Help: [
    { label: 'Contact Us',           href: '/contact' },
    { label: 'Track Order',          href: '/track-order' },
    { label: 'Shipping & Returns',   href: '/policies/shipping' },
    { label: 'About Us',             href: '/about' },
  ],
};

export default async function Footer() {
  const { store_phone, store_email, store_address } = await getStoreSettings();

  return (
    <footer className="bg-coal text-white">
      {/* ── Main footer content ─── */}
      <div className="mx-auto max-w-screen-xl px-5 pb-12 pt-16 md:px-8 lg:px-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="mb-5 font-display text-2xl font-light tracking-[0.35em]">Glowvie</div>
            <p className="mb-6 text-sm leading-7 text-warm/70">
              Premium beauty and grooming essentials crafted for the modern individual. Quality you can trust, delivered to your doorstep.
            </p>

            {/* Dynamic contact info */}
            {(store_phone || store_email || store_address) && (
              <div className="mb-6 space-y-2 border-t border-white/10 pt-5">
                {store_address && (
                  <div className="flex items-start gap-2 text-sm text-warm/70">
                    <span className="mt-0.5 shrink-0">📍</span>
                    <span>{store_address}</span>
                  </div>
                )}
                {store_phone && (
                  <div className="flex items-center gap-2 text-sm text-warm/70">
                    <span>📞</span>
                    <a href={`tel:${store_phone}`} className="hover:text-white transition">{store_phone}</a>
                  </div>
                )}
                {store_email && (
                  <div className="flex items-center gap-2 text-sm text-warm/70">
                    <span>✉️</span>
                    <a href={`mailto:${store_email}`} className="hover:text-white transition">{store_email}</a>
                  </div>
                )}
              </div>
            )}

            {/* Social icons - Hidden until real handles are provided */}
            {/* <div className="flex items-center gap-3">
              {[
                { label: 'Instagram', icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                )},
                { label: 'Facebook', icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                )},
                { label: 'TikTok', icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 12a4 4 0 104 4V4a5 5 0 005 5"/></svg>
                )},
              ].map(({ label, icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/60 transition hover:border-white/60 hover:text-white"
                >
                  {icon}
                </a>
              ))}
            </div> */}
          </div>

          {/* Collections */}
          <div>
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-warm/50">Collections</p>
            <ul className="space-y-3">
              {FOOTER_LINKS.Collections.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-warm/70 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-warm/50">Customer Care</p>
            <ul className="space-y-3">
              {FOOTER_LINKS.Help.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-warm/70 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-warm/50">Stay Updated</p>
            <p className="mb-5 text-sm leading-7 text-warm/70">Subscribe for exclusive deals and new arrivals.</p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* ── Bottom bar ─── */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-4 px-5 py-5 text-[10px] uppercase tracking-[0.2em] text-warm/40 md:flex-row md:px-8 lg:px-12">
          <span>© {new Date().getFullYear()} Glowvie. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span>Cash on Delivery</span>
            <span className="text-white/20">|</span>
            <span>Nationwide Delivery</span>
            <span className="text-white/20">|</span>
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
