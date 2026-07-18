export const metadata = {
  title: 'About Us — Glowvie',
  description: 'The story behind Glowvie, Pakistan\'s premium grooming and beauty brand.',
};

export default function AboutPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative flex h-[50vh] min-h-[400px] items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1800&q=80"
          alt="About Glowvie"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white px-5">
          <p className="text-[11px] uppercase tracking-[0.3em] mb-4 text-white/80">Est. 2020</p>
          <h1 className="font-display text-4xl md:text-5xl font-light tracking-wide">Our Story</h1>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl font-light text-black mb-8 text-center">Refining Your Daily Ritual</h2>
        
        <div className="space-y-6 text-grey text-sm md:text-base leading-relaxed text-center">
          <p>
            Founded with a vision to bring premium, high-quality grooming and beauty essentials to Pakistan, <strong className="text-black font-medium">Glowvie</strong> is more than just a brand—it's a lifestyle. We believe that self-care is not a luxury, but a necessity, and everyone deserves products that look elegant and deliver real results.
          </p>
          <p>
            From our signature Face Care formulations to our meticulously crafted Beard Oils, every product in our lineup is designed with modern aesthetics and supreme functionality in mind. We source the finest ingredients to ensure that your skin and hair receive the nourishment they deserve.
          </p>
          <p>
            At Glowvie, we take pride in our uncompromising standards. Whether you're preparing for a boardroom meeting or winding down after a long day, our products are built to elevate your routine. We are committed to transparency, quality, and an exceptional customer experience.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-b border-line py-10">
          {[
            { n: '10k+', l: 'Happy Customers' },
            { n: '50+', l: 'Premium Products' },
            { n: '100%', l: 'Authentic Quality' },
            { n: '24/7', l: 'Customer Support' },
          ].map(stat => (
            <div key={stat.l} className="text-center">
              <p className="font-display text-3xl text-black mb-1">{stat.n}</p>
              <p className="text-[10px] uppercase tracking-widest text-silver">{stat.l}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
