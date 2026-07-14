'use client';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';

const HERO_SLIDES = [
  {
    imageDesktop: '/images/products/dermive_hero_desktop.png',
    imageMobile: '/images/products/dermive_hero_desktop.png',
    heading: 'Dermatologist-Backed Skincare Solutions',
    sub: 'DermiVe Moisturizing Wash',
  },
  {
    imageDesktop: '/images/products/roots_hero_desktop.png',
    imageMobile: '/images/products/roots_hero_desktop.png',
    heading: 'Transform Your Hair',
    sub: 'Roots Hair Treatment Serum',
  },
  {
    imageDesktop: '/images/products/relax_hero_desktop.png',
    imageMobile: '/images/products/relax_hero_desktop.png',
    heading: 'Reveal Your True Glow',
    sub: 'Relax Vitamin C Serum',
  },
  {
    imageDesktop: '/images/products/markaway_hero_desktop.png',
    imageMobile: '/images/products/markaway_hero_desktop.png',
    heading: 'Restore Skin Confidence',
    sub: 'Markaway Stretch Mark Serum',
  },
  {
    imageDesktop: '/images/products/zafrani_hero_desktop.png',
    imageMobile: '/images/products/zafrani_hero_desktop.png',
    heading: 'Flawless Even Complexion',
    sub: 'Zafrani Beauty Cream',
  },
];

/* ─── Sapphire-style minimal chevron (single thin stroke, no background) ─── */
function ChevronLeft() {
  return (
    <svg
      viewBox="0 0 10 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="10" height="18"
      aria-hidden="true"
    >
      <polyline
        points="8,1 2,9 8,17"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 10 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="10" height="18"
      aria-hidden="true"
    >
      <polyline
        points="2,1 8,9 2,17"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  const [hovered, setHovered] = useState(false);

  const goTo = useCallback((index) => {
    setFade(false);
    setTimeout(() => {
      setCurrent(index);
      setFade(true);
    }, 400);
  }, []);

  const goPrev = useCallback(() => {
    goTo((current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, [current, goTo]);

  const goNext = useCallback(() => {
    goTo((current + 1) % HERO_SLIDES.length);
  }, [current, goTo]);

  /* Auto-play — pauses while hovering */
  useEffect(() => {
    if (hovered) return;
    const t = setInterval(goNext, 5000);
    return () => clearInterval(t);
  }, [hovered, goNext]);

  const slide = HERO_SLIDES[current];

  return (
    <section
      className="relative w-full flex-1 overflow-hidden h-[100vh] min-h-[480px] md:h-auto md:aspect-video"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Slides ──────────────────────────────────────────── */}
      {HERO_SLIDES.map((s, i) => (
        <picture key={i}>
          <source media="(min-width: 768px)" srcSet={s.imageDesktop} />
          <img
            src={s.imageMobile}
            alt={s.heading}
            className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0 }}
          />
        </picture>
      ))}

      {/* ── Overlay ─────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-black/40" />

      {/* ── LEFT ARROW — Sapphire style: bare chevron, full-height zone ── */}
      <button
        onClick={goPrev}
        aria-label="Previous slide"
        className="group"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 20,
          width: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.75)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'color 0.25s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
      >
        <ChevronLeft />
      </button>

      {/* ── RIGHT ARROW — Sapphire style: bare chevron, full-height zone ── */}
      <button
        onClick={goNext}
        aria-label="Next slide"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          zIndex: 20,
          width: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.75)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'color 0.25s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
      >
        <ChevronRight />
      </button>

      {/* ── Center content ───────────────────────────────────── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-24 pt-16 md:pt-24"
        style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.4s ease' }}
      >
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.5em] text-white/70">
          {slide.sub}
        </p>
        <h1 className="mb-8 font-display text-4xl font-light leading-tight text-white md:text-5xl lg:text-6xl uppercase tracking-widest">
          {slide.heading}
        </h1>
        <div className="flex items-center gap-4">
          <Link href="/collections" className="hero-btn hero-btn-white">
            Shop the Collection
          </Link>
        </div>
      </div>

      {/* ── Slide dots (bottom center) ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-[6px] z-20">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: i === current ? '28px' : '14px',
              height: '1.5px',
              background: i === current ? '#ffffff' : 'rgba(255,255,255,0.38)',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'width 0.35s ease, background 0.35s ease',
            }}
          />
        ))}
      </div>
    </section>
  );
}
