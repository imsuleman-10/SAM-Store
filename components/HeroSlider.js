'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1800&q=85',
    heading: 'Refine Your Daily Ritual',
    sub: 'Premium Grooming 2026',
  },
  {
    image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1800&q=85',
    heading: 'Own Your New Look',
    sub: 'New Arrivals Are Here',
  },
  {
    image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=1800&q=85',
    heading: 'Crafted For Excellence',
    sub: 'Authentic SAM&CO',
  },
];

// We set -mt-[104px] to pull the hero under the transparent sticky header
// and height calc(100vh - 42px) so it fills the screen but leaves room for the bottom marquee strip perfectly.
const HERO_HEIGHT = 'calc(100vh - 42px)';

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
        setFade(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const slide = HERO_SLIDES[current];

  return (
    <section
      className="relative w-full flex-1 overflow-hidden min-h-[480px]"
    >
      {/* Slideshow images with fade */}
      {HERO_SLIDES.map((s, i) => (
        <img
          key={i}
          src={s.image}
          alt={s.heading}
          className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        />
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Center content — baroque.pk style */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-16 md:pt-24"
        style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.5s ease' }}
      >
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.5em] text-white/70">
          {slide.sub}
        </p>
        <h1 className="mb-8 font-display text-4xl font-light leading-tight text-white md:text-5xl lg:text-6xl uppercase tracking-widest">
          {slide.heading}
        </h1>

        {/* baroque.pk style buttons — white + black, with gap */}
        <div className="flex items-center gap-4">
          <Link href="/collections" className="hero-btn hero-btn-white">
            Shop Now
          </Link>
          <Link href="/collections?cat=new" className="hero-btn hero-btn-black">
            New Arrivals
          </Link>
        </div>
      </div>

      {/* Slide indicator dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setFade(false);
              setTimeout(() => { setCurrent(i); setFade(true); }, 300);
            }}
            className="h-[2px] transition-all duration-300"
            style={{
              width: i === current ? '32px' : '16px',
              background: i === current ? '#fff' : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>
    </section>
  );
}
