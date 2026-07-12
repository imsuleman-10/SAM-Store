'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from './CartContext';

const NAV_LINKS = [
  { label: 'New Arrivals', href: '/collections?cat=new' },
  { label: 'Face Care',    href: '/collections?cat=face-care' },
  { label: 'Beard Care',   href: '/collections?cat=beard-care' },
  { label: 'Sale',         href: '/collections?cat=sale' },
];

export default function Header() {
  const { count } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isHome = pathname === '/';
  const isTransparent = isHome && !scrolled;

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 4);
    handle();
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (!searchOpen) setSearchTerm('');
  }, [searchOpen]);

  return (
    <>
      {/* ── Announcement Bar (Scrolls away) ─────────────────── */}
      <div className="announcement-bar relative z-50">
        <span>Free Delivery Across Pakistan &nbsp;·&nbsp; Cash on Delivery Available &nbsp;·&nbsp; Easy 7-Day Returns</span>
      </div>

      {/* ── Sticky wrapper: Navbar only ─────────────── */}
      <div className="sticky top-0 z-50 w-full">
        {/* ── Navbar ───────────────────────────────────────────── */}
        <header
          className={`w-full transition-all duration-300 ${
            isTransparent
              ? 'bg-transparent border-b border-transparent text-white'
              : 'bg-white border-b border-border shadow-soft text-black'
          }`}
        >
        <nav className="mx-auto flex max-w-screen-xl items-center justify-between px-5 md:px-8 lg:px-12" style={{ height: '64px' }}>

          {/* ── Left nav ─ desktop ─── */}
          <div className="hidden flex-1 items-center gap-7 lg:flex">
            {NAV_LINKS.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[11px] font-medium uppercase tracking-widest transition ${
                  isTransparent ? 'text-white/90 hover:text-white' : 'text-charcoal hover:text-black'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Logo ─── */}
          <Link
            href="/"
            className="flex flex-1 flex-col items-center justify-center lg:flex-none"
          >
            <span className="font-display text-2xl font-light tracking-[0.35em] md:text-3xl">
              SAM&amp;CO
            </span>
            <span className={`hidden text-[8px] font-medium uppercase tracking-[0.45em] lg:block ${isTransparent ? 'text-white/70' : 'text-silver'}`} style={{ marginTop: '-2px' }}>
              Est. 2020
            </span>
          </Link>

          {/* ── Right nav ─ desktop ─── */}
          <div className="hidden flex-1 items-center justify-end gap-7 lg:flex">
            {NAV_LINKS.slice(2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[11px] font-medium uppercase tracking-widest transition ${
                  isTransparent ? 'text-white/90 hover:text-white' : 'text-charcoal hover:text-black'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Search icon */}
            <button
              aria-label="Search"
              className={`icon-btn ${isTransparent ? 'hover:bg-white/10' : ''}`}
              onClick={() => setSearchOpen((v) => !v)}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="11" cy="11" r="6" />
                <path d="M16 16l4.5 4.5" strokeLinecap="square" />
              </svg>
            </button>

            {/* Cart icon */}
            <Link href="/cart" className={`icon-btn relative ${isTransparent ? 'hover:bg-white/10' : ''}`} aria-label="Cart">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="square" strokeLinejoin="miter" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {count > 0 && (
                <span className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center text-[9px] font-semibold ${isTransparent ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  {count}
                </span>
              )}
            </Link>
          </div>

          {/* ── Mobile right ─── */}
          <div className="flex items-center gap-1 lg:hidden">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className={`icon-btn ${isTransparent ? 'hover:bg-white/10' : ''}`}
              aria-label="Search"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="11" cy="11" r="6" />
                <path d="M16 16l4.5 4.5" strokeLinecap="square" />
              </svg>
            </button>
            <Link href="/cart" className={`icon-btn relative ${isTransparent ? 'hover:bg-white/10' : ''}`} aria-label="Cart">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="square" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {count > 0 && (
                <span className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center text-[9px] font-semibold ${isTransparent ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  {count}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className={`icon-btn ${isTransparent ? 'hover:bg-white/10' : ''}`}
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <line x1="3" y1="6"  x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </nav>

        {/* ── Search Bar ─── */}
        {searchOpen && (
          <div className="fixed inset-x-0 top-[104px] z-50 border-t border-border bg-white px-5 py-4 animate-slideDown md:px-8 lg:px-12">
            <div className="mx-auto flex max-w-xl items-center gap-3">
              <form
                className="flex flex-1 items-center gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const query = searchTerm.trim();
                  if (query) {
                    router.push(`/collections?search=${encodeURIComponent(query)}`);
                    setSearchOpen(false);
                  }
                }}
              >
                <input
                  autoFocus
                  className="input flex-1"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchOpen(false);
                    }
                  }}
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-[10px] uppercase tracking-widest text-white bg-black"
                >
                  Search
                </button>
              </form>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="icon-btn text-black"
                aria-label="Close search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}
        </header>
      </div> {/* end sticky wrapper */}

      {/* ── Mobile Drawer ─────────────────────────────────────── */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          {/* Drawer panel */}
          <div className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-panel">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <span className="font-display text-xl tracking-[0.3em]">SAM&amp;CO</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="icon-btn"
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6"  y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col divide-y divide-border">
              <Link href="/" onClick={() => setMenuOpen(false)} className="px-6 py-4 text-[11px] font-medium uppercase tracking-widest text-charcoal hover:text-black">
                Home
              </Link>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-6 py-4 text-[11px] font-medium uppercase tracking-widest text-charcoal hover:text-black"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/collections" onClick={() => setMenuOpen(false)} className="px-6 py-4 text-[11px] font-medium uppercase tracking-widest text-charcoal hover:text-black">
                All Collections
              </Link>
            </nav>
            <div className="mt-auto border-t border-border px-6 py-5">
              <p className="text-[10px] uppercase tracking-widest text-silver">Free delivery across Pakistan</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
