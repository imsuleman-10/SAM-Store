'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

const FILTERS = [
  { label: 'All',          value: '' },
  { label: 'New Arrivals', value: 'new' },
  { label: 'Face Care',    value: 'face-care' },
  { label: 'Beard Care',   value: 'beard-care' },
  { label: 'Hair Care',    value: 'hair-care' },
  { label: 'Sale',         value: 'sale' },
];

const SORT_OPTIONS = [
  { label: 'Newest',        value: 'new' },
  { label: 'Price: Low–High', value: 'price_asc' },
  { label: 'Price: High–Low', value: 'price_desc' },
];

function CollectionsContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('cat') || '';
  const searchQuery = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(catParam);
  const [sort, setSort] = useState('new');

  // Keep filter in sync with URL param
  useEffect(() => {
    setActiveFilter(catParam);
  }, [catParam]);

  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Client-side filter + sort
  let filtered = [...products];

  if (activeFilter === 'sale') {
    filtered = filtered.filter((p) => p.compare_at_price && p.compare_at_price > p.price);
  } else if (activeFilter === 'new') {
    filtered = filtered.slice(0, 8); // newest 8
  } else if (activeFilter) {
    filtered = filtered.filter((p) =>
      (p.category || '').toLowerCase().includes(activeFilter.toLowerCase())
    );
  }

  if (searchQuery) {
    filtered = filtered.filter((p) =>
      (p.name || '').toLowerCase().includes(searchQuery)
    );
  }

  if (sort === 'price_asc')  filtered.sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);

  const activeLabel = FILTERS.find((f) => f.value === activeFilter)?.label || 'All';

  return (
    <div className="bg-white">
      {/* ── Hero banner ─── */}
      <div className="relative flex h-52 items-end overflow-hidden bg-coal md:h-64">
        <img
          src="https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=1800&q=80"
          alt="Collections"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="relative z-10 w-full px-5 pb-10 md:px-8 lg:px-12">
          <p className="section-label mb-2 text-white/60">Browse</p>
          <h1 className="font-display text-4xl font-light text-white md:text-5xl">
            {activeLabel}
          </h1>
        </div>
      </div>

      {/* ── Filters + sort ─── */}
      <div className="sticky top-16 z-30 border-b border-border bg-white">
        <div className="mx-auto max-w-screen-xl px-5 md:px-8 lg:px-12">
          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Category filters */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`shrink-0 px-4 py-2 text-[10px] font-medium uppercase tracking-widest transition ${
                    activeFilter === f.value
                      ? 'bg-black text-white'
                      : 'text-grey hover:text-black'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] uppercase tracking-widest text-silver">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-border bg-white px-3 py-2 text-[11px] text-black outline-none focus:border-black"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Product grid ─── */}
      <div className="mx-auto max-w-screen-xl px-5 py-10 md:px-8 lg:px-12 lg:py-14">
        {/* Results count */}
        <p className="mb-6 text-[10px] uppercase tracking-widest text-silver">
          {loading ? 'Loading...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
        </p>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="section-label mb-3">No products found</p>
            <p className="text-sm text-grey">Try selecting a different category.</p>
            <button
              className="btn btn-outline mt-6"
              onClick={() => setActiveFilter('')}
            >
              Show All
            </button>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    }>
      <CollectionsContent />
    </Suspense>
  );
}
