'use client';

import { useState, useEffect } from 'react';
import { Spinner, Btn } from '../components/UI';

export default function ResultsTab() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [product, setProduct] = useState('');
  const [tag, setTag] = useState('');
  const [days, setDays] = useState('');
  const [desc, setDesc] = useState('');
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [beforePreview, setBeforePreview] = useState(null);
  const [afterPreview, setAfterPreview] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/result-images');
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setError('Failed to load results');
    }
    setLoading(false);
  }

  async function uploadImage(file, folder) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder); // → images/results/
    const res = await fetch('/api/admin/media', { method: 'POST', body: formData, credentials: 'include' });
    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');
    return data.url;
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!beforeFile || !afterFile) {
      setError('Please select both Before and After images.');
      return;
    }
    setError('');
    setUploading(true);

    try {
      const [before_url, after_url] = await Promise.all([
        uploadImage(beforeFile, 'results'),
        uploadImage(afterFile, 'results'),
      ]);

      const res = await fetch('/api/admin/result-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, tag, days, desc, before_url, after_url }),
      });

      if (res.ok) {
        setProduct(''); setTag(''); setDays(''); setDesc('');
        setBeforeFile(null); setAfterFile(null);
        setBeforePreview(null); setAfterPreview(null);
        // reset file inputs
        document.getElementById('before-input').value = '';
        document.getElementById('after-input').value = '';
        fetchResults();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to save result.');
      }
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this result card?')) return;
    await fetch('/api/admin/result-images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchResults();
  }

  function handleFileChange(e, type) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'before') { setBeforeFile(file); setBeforePreview(url); }
    else { setAfterFile(file); setAfterPreview(url); }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Before &amp; After Results</h2>
          <p className="text-sm text-gray-400 mt-0.5">Upload before/after images — these appear on the homepage</p>
        </div>
      </div>

      {/* Add Form */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 mb-8">
        <h3 className="mb-5 text-sm font-semibold text-gray-900">Add New Result Card</h3>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">{error}</div>
        )}

        <form onSubmit={handleAdd} className="space-y-5">
          {/* Image upload row */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Before Image */}
            <div>
              <label className="block mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Before Image <span className="text-rose-500">*</span>
              </label>
              <label
                htmlFor="before-input"
                className="flex flex-col items-center justify-center w-full aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition overflow-hidden"
              >
                {beforePreview ? (
                  <img src={beforePreview} alt="Before preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span className="text-xs font-medium">Click to upload Before</span>
                  </div>
                )}
              </label>
              <input
                id="before-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'before')}
              />
            </div>

            {/* After Image */}
            <div>
              <label className="block mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                After Image <span className="text-rose-500">*</span>
              </label>
              <label
                htmlFor="after-input"
                className="flex flex-col items-center justify-center w-full aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition overflow-hidden"
              >
                {afterPreview ? (
                  <img src={afterPreview} alt="After preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span className="text-xs font-medium">Click to upload After</span>
                  </div>
                )}
              </label>
              <input
                id="after-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'after')}
              />
            </div>
          </div>

          {/* Text fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                required
                placeholder="e.g. DermiVe Face Wash"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">Tag</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. Clearer Skin"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">Days Label</label>
              <input
                type="text"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="e.g. 14 Days"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">Description</label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Short description of the result"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition"
              />
            </div>
          </div>

          <Btn type="submit" variant="primary" size="md" disabled={uploading}>
            {uploading ? (
              <><Spinner /> Uploading & Saving…</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Result Card
              </>
            )}
          </Btn>
        </form>
      </div>

      {/* Results Grid */}
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Current Result Cards ({results.length})</h3>

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-sm text-gray-400"><Spinner /> Loading...</div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
          No result cards yet. Upload your first before &amp; after above.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => (
            <div key={r.id} className="relative rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              {/* Images */}
              <div className="grid grid-cols-2 gap-0.5 bg-gray-100">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img src={r.before_url} alt="Before" className="h-full w-full object-cover" />
                  <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white">Before</span>
                </div>
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img src={r.after_url} alt="After" className="h-full w-full object-cover" />
                  <span className="absolute bottom-2 left-2 bg-white/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-black">After</span>
                </div>
                {r.days && (
                  <span className="absolute right-2 top-2 bg-black px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest text-white">
                    {r.days}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                {r.tag && <span className="mb-1 inline-block text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-600">{r.tag}</span>}
                <h4 className="text-sm font-semibold text-gray-900">{r.product}</h4>
                {r.desc && <p className="mt-1 text-xs text-gray-400 leading-5">{r.desc}</p>}
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(r.id)}
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 transition shadow"
                title="Delete"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
