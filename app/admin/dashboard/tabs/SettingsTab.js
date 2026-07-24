'use client';
import React, { useState, useEffect } from 'react';
import { Spinner, Btn, EmptyState } from '../components/UI';

// ─── Section Nav ─────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'general',
    label: 'General',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
        <circle cx="8" cy="6" r="2" fill="white"/><circle cx="16" cy="12" r="2" fill="white"/><circle cx="10" cy="18" r="2" fill="white"/>
      </svg>
    ),
  },
  {
    id: 'branding',
    label: 'Branding',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
  },
  {
    id: 'hero',
    label: 'Hero Slides',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'videos',
    label: 'Videos',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
  },
  {
    id: 'results',
    label: 'Results',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="8" height="18" rx="1"/><rect x="13" y="3" width="8" height="18" rx="1"/>
      </svg>
    ),
  },
];

// ─── Input Component ──────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-[12px] text-gray-400">{hint}</p>}
    </div>
  );
}

function Input({ icon, prefix, ...props }) {
  return (
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
      {prefix && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium select-none">{prefix}</span>}
      <input
        {...props}
        className={`w-full rounded-xl border border-gray-200 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-50 transition placeholder:text-gray-300
          ${icon ? 'pl-10 pr-4' : prefix ? 'pl-12 pr-4' : 'px-4'} ${props.className || ''}`}
      />
    </div>
  );
}

// ─── Section: General ────────────────────────────────────────────────────────
function GeneralSection({ state }) {
  const { settings, settingsLoading, setSettings, saveSettings } = state;
  return (
    <div className="space-y-8">
      <SectionHeader title="General Configuration" desc="Configure API keys, contact info, and shipping preferences." />

      <Card title="API Keys" desc="Required for AI product description generation.">
        {settingsLoading ? <Skeleton /> : (
          <Field label="AI API Key (OpenAI / Groq)" hint="Keep this private. Used to auto-generate product descriptions.">
            <Input
              type="password"
              value={settings.ai_api_key || ''}
              onChange={e => setSettings(p => ({ ...p, ai_api_key: e.target.value }))}
              placeholder="sk-… or gsk-…"
            />
          </Field>
        )}
      </Card>

      <Card title="Contact Information" desc="Displayed to customers for support queries.">
        {settingsLoading ? <Skeleton h="h-20" /> : (
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Contact Phone">
              <Input
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.91 14a16 16 0 006.09 6.09l.91-.91a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7a2 2 0 011.72 2z"/></svg>}
                value={settings.contact_phone || ''}
                onChange={e => setSettings(p => ({ ...p, contact_phone: e.target.value }))}
                placeholder="+92 300 0000000"
              />
            </Field>
            <Field label="Contact Email">
              <Input
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                value={settings.contact_email || ''}
                onChange={e => setSettings(p => ({ ...p, contact_email: e.target.value }))}
                placeholder="support@store.com"
              />
            </Field>
          </div>
        )}
      </Card>

      <Card title="Shipping" desc="Standard fee applied at checkout.">
        {settingsLoading ? <Skeleton h="h-12" /> : (
          <div className="max-w-xs">
            <Field label="Standard Shipping Fee">
              <Input
                type="number"
                prefix="Rs."
                value={settings.shipping_fee || ''}
                onChange={e => setSettings(p => ({ ...p, shipping_fee: e.target.value }))}
                placeholder="250"
              />
            </Field>
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 active:bg-black transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13"/><polyline points="7 3 7 8 15 8"/></svg>
          Save Settings
        </button>
      </div>
    </div>
  );
}

// ─── Section: Branding ───────────────────────────────────────────────────────
function BrandingSection({ state }) {
  const { settings, handleLogoUpload, handleFaviconUpload } = state;
  return (
    <div className="space-y-8">
      <SectionHeader title="Store Branding" desc="Manage your logo and favicon to keep your store on-brand." />

      <Card title="Store Logo & Favicon" desc="These assets appear in the admin panel, browser tab, and emails.">
        <div className="grid sm:grid-cols-2 gap-8">
          <BrandAsset
            label="Store Logo"
            hint="Transparent PNG recommended. Max 2MB."
            preview={settings.store_logo}
            onUpload={handleLogoUpload}
          />
          <BrandAsset
            label="Favicon"
            hint="Square format (32×32px or 64×64px). ICO or PNG."
            preview={settings.store_favicon}
            onUpload={handleFaviconUpload}
            isSquare
          />
        </div>
      </Card>
    </div>
  );
}

function BrandAsset({ label, hint, preview, onUpload, isSquare }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">{label}</p>
      <div className="flex items-start gap-4">
        <div className={`shrink-0 flex items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm p-2 ${isSquare ? 'h-16 w-16' : 'h-16 w-28'}`}>
          {preview
            ? <img src={preview} alt={label} className="h-full w-full object-contain" />
            : <span className="text-[10px] text-gray-300 text-center leading-tight">No {label.toLowerCase()}</span>
          }
        </div>
        <div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            {preview ? 'Replace' : 'Upload'}
            <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
          </label>
          <p className="mt-2 text-[11px] text-gray-400">{hint}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Reorder Button pair ──────────────────────────────────────────────────────
function ReorderBtns({ idx, total, onMove }) {
  return (
    <div className="flex flex-col gap-1 shrink-0">
      <button
        onClick={() => onMove(idx, idx - 1)}
        disabled={idx === 0}
        title="Move up"
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed transition"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
      </button>
      <button
        onClick={() => onMove(idx, idx + 1)}
        disabled={idx === total - 1}
        title="Move down"
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed transition"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
    </div>
  );
}

// ─── Section: Hero Slides ────────────────────────────────────────────────────
function HeroSection({ state }) {
  const { heroSlides, heroLoading, heroSaving, saveAllHeroSlides, uploadHeroMedia, updateHeroSlide, deleteHeroSlide, handleAddHeroSlide, setHeroSlides } = state;

  async function moveSlide(fromIdx, toIdx) {
    if (toIdx < 0 || toIdx >= heroSlides.length) return;
    const next = [...heroSlides];
    const [removed] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, removed);
    // Optimistic update
    if (typeof setHeroSlides === 'function') setHeroSlides(next);
    // Persist order via API if slides have IDs
    const ids = next.map(s => s.id).filter(Boolean);
    if (ids.length === next.length) {
      await fetch('/api/admin/hero-slides/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideIds: ids }),
      });
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader title="Hero Banner Slides" desc="Manage the rotating banners shown at the top of your homepage. Use arrows to reorder." />

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Slides list */}
        <div className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              {heroSlides.length} slide{heroSlides.length !== 1 ? 's' : ''}
              <span className="ml-2 text-[11px] font-normal text-gray-400">— use ↑↓ to reorder</span>
            </p>
            <button
              onClick={saveAllHeroSlides}
              disabled={heroSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-700 transition disabled:opacity-50"
            >
              {heroSaving ? <Spinner /> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13"/><polyline points="7 3 7 8 15 8"/></svg>}
              {heroSaving ? 'Saving…' : 'Save Slides'}
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {heroLoading ? (
              <div className="flex h-48 items-center justify-center gap-2 text-sm text-gray-400"><Spinner /> Loading…</div>
            ) : heroSlides.length === 0 ? (
              <EmptyState
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                title="No hero slides"
                sub="Add your first slide using the form"
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {heroSlides.map((slide, idx) => (
                  <div key={slide.id || idx} className="flex flex-col sm:flex-row items-start gap-3 p-5 hover:bg-gray-50/50 transition group">
                    {/* Reorder */}
                    <ReorderBtns idx={idx} total={heroSlides.length} onMove={moveSlide} />

                    {/* Thumbnail + upload */}
                    <div className="shrink-0 space-y-2">
                      <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                        {slide.image || slide.image_url ? (
                          <img src={slide.image || slide.image_url} className="h-24 w-36 object-cover" alt="Slide" />
                        ) : (
                          <div className="flex h-24 w-36 items-center justify-center bg-gray-100 text-gray-300">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          </div>
                        )}
                      </div>
                      <label className="flex w-36 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        {slide.image ? 'Replace' : 'Upload'} Image
                        <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadHeroMedia(f, idx, 'image'); }} />
                      </label>
                    </div>

                    {/* Fields */}
                    <div className="flex-1 min-w-0 space-y-3 w-full">
                      <input type="text" value={slide.heading || ''} onChange={e => updateHeroSlide(idx, 'heading', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-50 transition" placeholder="Heading" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" value={slide.sub || ''} onChange={e => updateHeroSlide(idx, 'sub', e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs text-gray-700 outline-none focus:border-gray-400 transition" placeholder="Subtitle" />
                        <input type="text" value={slide.link || ''} onChange={e => updateHeroSlide(idx, 'link', e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs text-gray-700 outline-none focus:border-gray-400 transition" placeholder="Link URL" />
                      </div>
                    </div>

                    {/* Delete */}
                    <button onClick={() => deleteHeroSlide(idx)}
                      className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-100 transition" title="Delete slide">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add slide form */}
        <div>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-sm font-bold text-gray-900">Add New Slide</h3>
              <p className="text-xs text-gray-400 mt-0.5">Create a new hero banner</p>
            </div>
            <form onSubmit={handleAddHeroSlide} className="p-5 space-y-4">
              <Field label={<>Heading <span className="text-rose-500">*</span></>}>
                <input type="text" name="heading" required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-50 transition" placeholder="Transform Your Skin" />
              </Field>
              <Field label="Subtitle">
                <input type="text" name="sub" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-50 transition" placeholder="New Collection" />
              </Field>
              <Field label="Link URL">
                <input type="text" name="link" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-50 transition" placeholder="/collections/all" />
              </Field>
              <Field label="Image URL">
                <input type="url" name="image" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-50 transition" placeholder="https://… or upload after adding" />
              </Field>
              <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Slide
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Videos ─────────────────────────────────────────────────────────
function VideosSection() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [sub, setSub] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchVideos(); }, []);

  async function fetchVideos() {
    setLoading(true);
    const res = await fetch('/api/admin/homepage-videos');
    if (res.ok) { const d = await res.json(); setVideos(d.videos || []); }
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!title || !videoFile) return alert('Title and video file are required');
    setUploading(true);
    const fd = new FormData();
    fd.append('file', videoFile);
    fd.append('folder', 'homepage');
    const up = await fetch('/api/upload/video', { method: 'POST', body: fd });
    if (!up.ok) { alert('Video upload failed'); setUploading(false); return; }
    const { url } = await up.json();
    const res = await fetch('/api/admin/homepage-videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, sub, video_url: url }),
    });
    if (res.ok) { setTitle(''); setSub(''); setVideoFile(null); e.target.reset(); fetchVideos(); }
    else { const d = await res.json(); alert('Error: ' + d.error); }
    setUploading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this video?')) return;
    const res = await fetch(`/api/admin/homepage-videos/${id}`, { method: 'DELETE' });
    if (res.ok) fetchVideos();
  }

  function moveVideo(fromIdx, toIdx) {
    if (toIdx < 0 || toIdx >= videos.length) return;
    const next = [...videos];
    const [removed] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, removed);
    setVideos(next);
  }

  return (
    <div className="space-y-8">
      <SectionHeader title="Homepage Videos" desc="Upload short videos that appear in the video section of your homepage. Use arrows to reorder." />

      {/* Upload form */}
      <Card title="Add New Video" desc="Upload a square (1:1) video for best display.">
        <form onSubmit={handleAdd} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label={<>Title <span className="text-rose-500">*</span></>}>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-50 transition"
                placeholder="e.g. Skin Transformation" />
            </Field>
            <Field label="Subtitle (optional)">
              <input type="text" value={sub} onChange={e => setSub(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-50 transition"
                placeholder="e.g. Product Demo" />
            </Field>
          </div>
          <Field label={<>Video File <span className="text-rose-500">*</span></>} hint="MP4 or WebM. Square (1:1) recommended.">
            <label className="flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition">
              {videoFile ? (
                <span className="text-sm font-medium text-gray-700">{videoFile.name}</span>
              ) : (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300 mb-2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                  <span className="text-sm text-gray-400">Click to select a video</span>
                </>
              )}
              <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={e => setVideoFile(e.target.files[0])} required />
            </label>
          </Field>
          <button type="submit" disabled={uploading} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition disabled:opacity-50">
            {uploading ? <><Spinner /> Uploading…</> : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Upload Video</>}
          </button>
        </form>
      </Card>

      {/* Videos list with reorder */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Current Videos ({videos.length})
            <span className="ml-2 text-[11px] font-normal text-gray-400">— use ↑↓ to reorder</span>
          </p>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-gray-400"><Spinner /> Loading…</div>
        ) : videos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">No videos yet. Upload one above.</div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden divide-y divide-gray-100">
            {videos.map((v, idx) => (
              <div key={v.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition group">
                <ReorderBtns idx={idx} total={videos.length} onMove={moveVideo} />
                <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-black">
                  <video src={v.video_url} className="w-full h-full object-cover" muted playsInline />
                </div>
                <div className="flex-1 min-w-0">
                  {v.sub && <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 mb-0.5">{v.sub}</p>}
                  <p className="text-sm font-semibold text-gray-900 truncate">{v.title}</p>
                </div>
                <button onClick={() => handleDelete(v.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 transition shadow opacity-0 group-hover:opacity-100"
                  title="Delete">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section: Results ────────────────────────────────────────────────────────
function ResultsSection() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [product, setProduct] = useState('');
  const [tag, setTag] = useState('');
  const [days, setDays] = useState('');
  const [desc, setDesc] = useState('');
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [beforePreview, setBeforePreview] = useState(null);
  const [afterPreview, setAfterPreview] = useState(null);

  useEffect(() => { fetchResults(); }, []);

  async function fetchResults() {
    setLoading(true);
    try { const res = await fetch('/api/admin/result-images'); const d = await res.json(); setResults(d.results || []); }
    catch { setError('Failed to load results'); }
    setLoading(false);
  }

  async function uploadImg(file, folder) {
    const fd = new FormData();
    fd.append('image', file);
    fd.append('folder', folder);
    const res = await fetch('/api/admin/media', { method: 'POST', body: fd, credentials: 'include' });
    const d = await res.json();
    if (!res.ok || !d.url) throw new Error(d.error || 'Upload failed');
    return d.url;
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!beforeFile || !afterFile) { setError('Please select both Before and After images.'); return; }
    setError(''); setUploading(true);
    try {
      const [before_url, after_url] = await Promise.all([uploadImg(beforeFile, 'results'), uploadImg(afterFile, 'results')]);
      const res = await fetch('/api/admin/result-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, tag, days, desc, before_url, after_url }),
      });
      if (res.ok) {
        setProduct(''); setTag(''); setDays(''); setDesc('');
        setBeforeFile(null); setAfterFile(null); setBeforePreview(null); setAfterPreview(null);
        document.getElementById('s-before-input').value = '';
        document.getElementById('s-after-input').value = '';
        fetchResults();
      } else { const d = await res.json(); setError(d.error || 'Failed to save.'); }
    } catch (err) { setError(err.message); }
    setUploading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this result card?')) return;
    await fetch('/api/admin/result-images', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchResults();
  }

  function handleFile(e, type) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'before') { setBeforeFile(file); setBeforePreview(url); }
    else { setAfterFile(file); setAfterPreview(url); }
  }

  return (
    <div className="space-y-8">
      <SectionHeader title="Before & After Results" desc="Upload transformation photos that appear on your homepage." />

      <Card title="Add New Result Card" desc="Upload Before and After images to showcase product results.">
        {error && <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">{error}</div>}
        <form onSubmit={handleAdd} className="space-y-6">
          {/* Image pickers */}
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { type: 'before', label: 'Before Image', preview: beforePreview, id: 's-before-input' },
              { type: 'after', label: 'After Image', preview: afterPreview, id: 's-after-input' },
            ].map(({ type, label, preview, id }) => (
              <div key={type}>
                <p className="mb-2 text-sm font-semibold text-gray-700">{label} <span className="text-rose-500">*</span></p>
                <label htmlFor={id} className="flex flex-col items-center justify-center w-full aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition overflow-hidden">
                  {preview ? (
                    <img src={preview} alt={label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span className="text-xs">Click to upload {label}</span>
                    </div>
                  )}
                </label>
                <input id={id} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e, type)} />
              </div>
            ))}
          </div>

          {/* Text fields */}
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label={<>Product Name <span className="text-rose-500">*</span></>}>
              <input type="text" required value={product} onChange={e => setProduct(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-50 transition"
                placeholder="e.g. DermiVe Face Wash" />
            </Field>
            <Field label="Tag">
              <input type="text" value={tag} onChange={e => setTag(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-50 transition"
                placeholder="e.g. Clearer Skin" />
            </Field>
            <Field label="Days Label">
              <input type="text" value={days} onChange={e => setDays(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-50 transition"
                placeholder="e.g. 14 Days" />
            </Field>
            <Field label="Description">
              <input type="text" value={desc} onChange={e => setDesc(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-50 transition"
                placeholder="Short description" />
            </Field>
          </div>

          <button type="submit" disabled={uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition disabled:opacity-50">
            {uploading ? <><Spinner /> Uploading & Saving…</> : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Result Card</>}
          </button>
        </form>
      </Card>

      {/* Results list with reorder */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Current Results ({results.length})
            <span className="ml-2 text-[11px] font-normal text-gray-400">— use ↑↓ to reorder</span>
          </p>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-gray-400"><Spinner /> Loading…</div>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">No result cards yet. Upload one above.</div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden divide-y divide-gray-100">
            {results.map((r, idx) => (
              <div key={r.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition group">
                <ReorderBtns idx={idx} total={results.length} onMove={(from, to) => {
                  const next = [...results];
                  const [rem] = next.splice(from, 1);
                  next.splice(to, 0, rem);
                  setResults(next);
                }} />
                {/* Before/After thumbnails */}
                <div className="flex gap-1 shrink-0">
                  <div className="relative h-16 w-12 rounded-lg overflow-hidden">
                    <img src={r.before_url} alt="Before" className="h-full w-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 text-center bg-black/60 text-[8px] text-white font-bold py-0.5">Before</span>
                  </div>
                  <div className="relative h-16 w-12 rounded-lg overflow-hidden">
                    <img src={r.after_url} alt="After" className="h-full w-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 text-center bg-white/80 text-[8px] text-black font-bold py-0.5">After</span>
                  </div>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  {r.tag && <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-600">{r.tag}</span>}
                  <p className="text-sm font-semibold text-gray-900 truncate">{r.product}</p>
                  {r.days && <p className="text-xs text-gray-400">{r.days}</p>}
                </div>
                <button onClick={() => handleDelete(r.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 transition shadow opacity-0 group-hover:opacity-100"
                  title="Delete">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared UI Primitives ─────────────────────────────────────────────────────
function SectionHeader({ title, desc }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </div>
  );
}

function Card({ title, desc, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Skeleton({ h = 'h-14' }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${h}`} />;
}

// ─── Main SettingsTab ─────────────────────────────────────────────────────────
export default function SettingsTab({ state }) {
  const { tab } = state;
  const [activeSection, setActiveSection] = useState('general');

  if (tab !== 'settings') return null;

  return (
    <div className="max-w-6xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage all your store configurations, branding, and homepage content from one place.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* ── Sidebar nav (horizontal on mobile, vertical on desktop) ── */}
        <aside className="lg:w-52 shrink-0">
          <nav className="flex flex-row flex-wrap gap-1 lg:flex-col lg:space-y-0.5">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-left
                  ${activeSection === s.id
                    ? 'bg-gray-100 text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <span className={activeSection === s.id ? 'text-gray-700' : 'text-gray-400'}>
                  {s.icon}
                </span>
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0">
          {activeSection === 'general' && <GeneralSection state={state} />}
          {activeSection === 'branding' && <BrandingSection state={state} />}
          {activeSection === 'hero' && <HeroSection state={state} />}
          {activeSection === 'videos' && <VideosSection />}
          {activeSection === 'results' && <ResultsSection />}
        </div>
      </div>
    </div>
  );
}
