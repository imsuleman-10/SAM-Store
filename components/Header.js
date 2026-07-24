'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from './CartContext';

/* ─── Navigation structure ─────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'New Arrivals', href: '/collections?cat=new' },
  { label: 'Sale',         href: '/collections?cat=sale' },
];

const MARQUEE_TEXT = 'EXPERTLY FORMULATED SKINCARE · FREE DELIVERY ACROSS PAKISTAN · PREMIUM BEAUTY ESSENTIALS · VISIBLE RESULTS · AUTHENTIC Glowvie ·';

/* ─── Reusable icon components ─────────────────────────────────────────── */
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="22" y2="22" />
  </svg>
);

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconBag = ({ count, isTransparent }) => (
  <span className="relative flex items-center justify-center">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
    {count > 0 && (
      <span
        className="absolute -top-[7px] -right-[9px] flex h-[16px] w-[16px] items-center justify-center text-[9px] font-semibold leading-none rounded-full"
        style={{ background: isTransparent ? '#fff' : '#000', color: isTransparent ? '#000' : '#fff' }}
      >
        {count}
      </span>
    )}
  </span>
);

const IconClose = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─── Nav Link with animated underline ─────────────────────────────────── */
function NavLink({ href, label, isTransparent, pathname }) {
  const isActive = pathname.startsWith(href.split('?')[0]) && href !== '/';
  return (
    <Link
      href={href}
      className="group relative flex items-center"
      style={{ padding: '4px 0' }}
      onMouseEnter={e => {
        const underline = e.currentTarget.querySelector('[data-underline]');
        if (underline) underline.style.width = '100%';
      }}
      onMouseLeave={e => {
        const underline = e.currentTarget.querySelector('[data-underline]');
        if (underline) underline.style.width = isActive ? '100%' : '0%';
      }}
    >
      <span
        className="text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-200"
        style={{ color: isTransparent ? 'rgba(255,255,255,0.85)' : '#1a1a1a' }}
      >
        {label}
      </span>
      {/* Animated underline */}
      <span
        data-underline="true"
        className="absolute bottom-0 left-0 h-px transition-all duration-300"
        style={{
          width: isActive ? '100%' : '0%',
          background: isTransparent ? '#fff' : '#000',
        }}
      />
    </Link>
  );
}

/* ─── Icon button wrapper ───────────────────────────────────────────────── */
function IconBtn({ onClick, label, isTransparent, children, as: Tag = 'button', href }) {
  const props = Tag === 'a' ? { href } : { onClick };
  return (
    <Tag
      {...props}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-none transition-colors duration-200"
      style={{ color: isTransparent ? 'rgba(255,255,255,0.85)' : '#1a1a1a' }}
      onMouseEnter={e => (e.currentTarget.style.color = isTransparent ? '#fff' : '#000')}
      onMouseLeave={e => (e.currentTarget.style.color = isTransparent ? 'rgba(255,255,255,0.85)' : '#1a1a1a')}
    >
      {children}
    </Tag>
  );
}

/* ─── Main Header ───────────────────────────────────────────────────────── */
export default function Header() {
  const { count, user } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);

  const isHome = pathname === '/';
  const isTransparent = isHome && !scrolled;

  /* scroll listener */
  useEffect(() => {
    const handle = () => {
      const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      setScrolled(currentScroll > 10);
    };
    handle();
    window.addEventListener('scroll', handle, { passive: true });
    // also listen to resize just in case
    window.addEventListener('resize', handle, { passive: true });
    return () => {
      window.removeEventListener('scroll', handle);
      window.removeEventListener('resize', handle);
    };
  }, []);

  /* body lock when drawer open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  /* auto-focus search input */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
    else setSearchTerm('');
  }, [searchOpen]);

  /* ── sign-out helper ──────────────────────────────────────────────── */
  const handleSignOut = async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          ANNOUNCEMENT BAR (scrolls with page)
      ═══════════════════════════════════════════════════ */}
      <div
        className="overflow-hidden whitespace-nowrap flex items-center relative z-50"
        style={{
          background: '#0a0a0a',
          color: '#ffffff',
          padding: '10px 0',
        }}
      >
        <div className="flex animate-marquee">
          {[MARQUEE_TEXT, MARQUEE_TEXT].map((t, i) => (
            <span
              key={i}
              className="mx-8 font-medium uppercase tracking-[0.28em]"
              style={{
                fontSize: '10px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          STICKY NAVBAR
      ═══════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-50 w-full">
        <header
          style={{
            width: '100%',
            transition: 'background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
            background: isTransparent ? 'transparent' : '#ffffff',
            borderBottom: isTransparent ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e5e5e5',
            boxShadow: isTransparent ? 'none' : '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <nav
            className="mx-auto flex max-w-screen-xl items-center"
            style={{ height: '68px', padding: '0 32px' }}
          >

            {/* ── LEFT NAV — desktop ────────────────────────── */}
            <div className="hidden flex-1 items-center gap-8 lg:flex">
              {NAV_LINKS.slice(0, 1).map(link => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  isTransparent={isTransparent}
                  pathname={pathname}
                />
              ))}
            </div>

            {/* ── LOGO — always centered ────────────────────── */}
            <Link
              href="/"
              className="flex flex-1 flex-col items-center justify-center gap-[1px] lg:flex-none"
              style={{ textDecoration: 'none' }}
            >
              <span
                className="font-display"
                style={{
                  fontSize: '1.65rem',
                  fontWeight: 300,
                  letterSpacing: '0.38em',
                  color: isTransparent ? '#fff' : '#0a0a0a',
                  lineHeight: 1,
                  transition: 'color 0.3s ease',
                }}
              >
                Glowvie
              </span>
              <span
                className="hidden lg:block"
                style={{
                  fontSize: '8px',
                  fontWeight: 500,
                  letterSpacing: '0.48em',
                  textTransform: 'uppercase',
                  color: isTransparent ? 'rgba(255,255,255,0.55)' : '#999',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'color 0.3s ease',
                }}
              >
                PREMIUM SKINCARE
              </span>
            </Link>

            {/* ── RIGHT NAV — desktop ───────────────────────── */}
            <div className="hidden flex-1 items-center justify-end gap-8 lg:flex">
              {NAV_LINKS.slice(1).map(link => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  isTransparent={isTransparent}
                  pathname={pathname}
                />
              ))}

              {/* Divider */}
              <span
                style={{
                  width: '1px',
                  height: '16px',
                  background: isTransparent ? 'rgba(255,255,255,0.2)' : '#ddd',
                  display: 'block',
                  margin: '0 2px',
                }}
              />

              {/* Account icon */}
              {user ? (
                <Link
                  href="/account"
                  aria-label="My Account"
                  title="My Account"
                  className="flex h-9 w-9 items-center justify-center transition-opacity duration-200 hover:opacity-70"
                  style={{ color: isTransparent ? 'rgba(255,255,255,0.85)' : '#1a1a1a' }}
                >
                  <IconUser />
                </Link>
              ) : (
                <Link
                  href="/login"
                  aria-label="Log in"
                  title="Log in"
                  className="flex h-9 w-9 items-center justify-center transition-opacity duration-200 hover:opacity-70"
                  style={{ color: isTransparent ? 'rgba(255,255,255,0.85)' : '#1a1a1a' }}
                >
                  <IconUser />
                </Link>
              )}

              {/* Search icon */}
              <button
                onClick={() => setSearchOpen(v => !v)}
                aria-label="Search"
                className="flex h-9 w-9 items-center justify-center transition-opacity duration-200 hover:opacity-70"
                style={{ color: isTransparent ? 'rgba(255,255,255,0.85)' : '#1a1a1a', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <IconSearch />
              </button>

              {/* Cart icon */}
              <Link
                href="/cart"
                aria-label="Shopping bag"
                className="flex h-9 w-9 items-center justify-center transition-opacity duration-200 hover:opacity-70"
                style={{ color: isTransparent ? 'rgba(255,255,255,0.85)' : '#1a1a1a' }}
              >
                <IconBag count={count} isTransparent={isTransparent} />
              </Link>
            </div>

            {/* ── MOBILE RIGHT ─────────────────────────────── */}
            <div className="flex flex-1 items-center justify-end gap-1 lg:hidden">
              <button
                onClick={() => setSearchOpen(v => !v)}
                aria-label="Search"
                className="flex h-10 w-10 items-center justify-center"
                style={{ color: isTransparent ? '#fff' : '#1a1a1a', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <IconSearch />
              </button>
              <Link
                href="/cart"
                aria-label="Shopping bag"
                className="flex h-10 w-10 items-center justify-center"
                style={{ color: isTransparent ? '#fff' : '#1a1a1a' }}
              >
                <IconBag count={count} isTransparent={isTransparent} />
              </Link>
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="flex h-10 w-10 items-center justify-center"
                style={{ color: isTransparent ? '#fff' : '#1a1a1a', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {/* Refined hamburger — 3 lines, different widths */}
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                  <line x1="0" y1="1" x2="20" y2="1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <line x1="0" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <line x1="0" y1="13" x2="20" y2="13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

          </nav>

          {/* ═══════════════════════════════════════════════
              SEARCH OVERLAY — full-width dropdown
          ═══════════════════════════════════════════════ */}
          {searchOpen && (
            <div
              style={{
                position: 'fixed',
                insetInline: 0,
                top: '109px',
                zIndex: 60,
                background: '#fff',
                borderBottom: '1px solid #e8e8e8',
                padding: '20px 32px',
                animation: 'slideDown 0.22s ease',
              }}
            >
              <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <form
                  style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0', borderBottom: '1.5px solid #0a0a0a' }}
                  onSubmit={e => {
                    e.preventDefault();
                    const q = searchTerm.trim();
                    if (q) { router.push(`/collections?search=${encodeURIComponent(q)}`); setSearchOpen(false); }
                  }}
                >
                  <span style={{ color: '#888', marginRight: '10px', lineHeight: 0 }}>
                    <IconSearch />
                  </span>
                  <input
                    ref={searchInputRef}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
                    placeholder="Search for products…"
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: '14px',
                      letterSpacing: '0.02em',
                      color: '#0a0a0a',
                      padding: '10px 0',
                      background: 'transparent',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  />
                </form>
                <button
                  onClick={() => setSearchOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '4px' }}
                  aria-label="Close search"
                >
                  <IconClose size={18} />
                </button>
              </div>
            </div>
          )}
        </header>
      </div>

      {/* ═══════════════════════════════════════════════════
          MOBILE DRAWER
      ═══════════════════════════════════════════════════ */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 60,
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(2px)',
            }}
          />

          {/* Panel */}
          <div
            style={{
              position: 'fixed', insetY: 0, left: 0, zIndex: 70,
              width: '300px',
              background: '#fff',
              display: 'flex', flexDirection: 'column',
              boxShadow: '4px 0 32px rgba(0,0,0,0.12)',
            }}
          >
            {/* Drawer header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', letterSpacing: '0.32em', fontWeight: 300 }}>
                Glowvie
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: '4px' }}
                aria-label="Close menu"
              >
                <IconClose size={18} />
              </button>
            </div>

            {/* Drawer nav */}
            <nav style={{ flex: 1, overflowY: 'auto' }}>
              {[{ label: 'Home', href: '/' }, ...NAV_LINKS, { label: 'All Collections', href: '/collections' }].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '16px 24px',
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: '#1a1a1a',
                    borderBottom: '1px solid #f5f5f5',
                    textDecoration: 'none',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'padding-left 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.paddingLeft = '32px')}
                  onMouseLeave={e => (e.currentTarget.style.paddingLeft = '24px')}
                >
                  {link.label}
                </Link>
              ))}

              {/* Auth link */}
              {user ? (
                <button
                  onClick={async () => { setMenuOpen(false); await handleSignOut(); }}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '16px 24px',
                    fontSize: '11px', fontWeight: 500,
                    letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: '#1a1a1a', borderBottom: '1px solid #f5f5f5',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Log Out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '16px 24px',
                    fontSize: '11px', fontWeight: 500,
                    letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: '#1a1a1a', borderBottom: '1px solid #f5f5f5',
                    textDecoration: 'none',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Log In
                </Link>
              )}
            </nav>

            {/* Drawer footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0' }}>
              <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#aaa', fontFamily: "'Inter', sans-serif" }}>
                Free delivery across Pakistan
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
