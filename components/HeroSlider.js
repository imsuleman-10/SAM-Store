'use client';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

const DEFAULT_SLIDES = [];

function ChevronLeft() {
  return (
    <svg viewBox="0 0 10 18" fill="none" width="10" height="18" aria-hidden="true">
      <polyline points="8,1 2,9 8,17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 10 18" fill="none" width="10" height="18" aria-hidden="true">
      <polyline points="2,1 8,9 2,17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export default function HeroSlider({ initialSlides = [] }) {
  const slides = initialSlides;
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  const [hovered, setHovered] = useState(false);

  const goTo = useCallback((index) => {
    setFade(false);
    setTimeout(() => { setCurrent(index); setFade(true); }, 400);
  }, []);

  const goPrev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo, slides.length]);

  const goNext = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo, slides.length]);

  useEffect(() => {
    if (hovered) return;
    const t = setInterval(goNext, 5000);
    return () => clearInterval(t);
  }, [hovered, goNext]);

  if (!slides.length) return null;

  const slide = slides[current];

  return (
    <section
      className="relative w-full flex-1 overflow-hidden h-[100vh] min-h-[480px] md:h-auto md:aspect-video bg-black"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {slides.map((s, i) => (
        s.image ? (
          <img key={i} src={s.image} alt={s.heading}
            className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0 }} />
        ) : (
          <div key={i} className="absolute inset-0 h-full w-full bg-black transition-opacity duration-700" style={{ opacity: i === current ? 1 : 0 }} />
        )
      ))}

      <div className="absolute inset-0 bg-black/40" />

      <button onClick={goPrev} aria-label="Previous slide"
        className="group"
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 20, width: '56px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.75)', background: 'transparent', border: 'none', cursor: 'pointer',
          transition: 'color 0.25s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
      >
        <ChevronLeft />
      </button>

      <button onClick={goNext} aria-label="Next slide"
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, zIndex: 20, width: '56px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.75)', background: 'transparent', border: 'none', cursor: 'pointer',
          transition: 'color 0.25s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
      >
        <ChevronRight />
      </button>

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
          <Link href={slide.link || "/collections"} className="hero-btn hero-btn-white">
            Shop the Collection
          </Link>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-[6px] z-20">
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`}
            style={{
              width: i === current ? '28px' : '14px', height: '1.5px',
              background: i === current ? '#ffffff' : 'rgba(255,255,255,0.38)',
              border: 'none', padding: 0, cursor: 'pointer',
              transition: 'width 0.35s ease, background 0.35s ease',
            }} />
        ))}
      </div>
    </section>
  );
}
