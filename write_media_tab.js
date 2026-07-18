const fs = require('fs');

const content = `import React from 'react';
import Link from 'next/link';
import { 
  Badge, EmptyState, Spinner, StatCard, Table, Th, Td, SearchInput, Select,
  COURIER_OPTIONS, CATEGORIES, STATUS_META, Btn,
  formatCurrency, formatDate, cleanItems, getTrackingMeta, sendWhatsApp
} from '../components/UI';

export default function MediaTab({ state }) {
  const {
    loading, analytics, orders, products, subscribers, users, staff, settings, heroSlides, mediaItems,
    tab, setTab, storeLogo,
    orderFilter, setOrderFilter, orderSearch, setOrderSearch, orderSort, setOrderSort, filteredOrders,
    expandedOrder, setExpandedOrder, updateOrderStatus, updateOrderTracking, emailCustomer, handlePrintInvoice, deleteOrder,
    productSearch, setProductSearch, productCategory, setProductCategory, productSort, setProductSort, filteredProducts,
    editingStockId, setEditingStockId, editingStockVal, setEditingStockVal, updateStock, deleteProduct,
    userSearch, setUserSearch, usersLoading, setUsersLoading, setUsers, filteredUsers, handleBanUser,
    subscriberSearch, setSubscriberSearch, subscribersLoading, filteredSubscribers, exportSubscribersCSV, deleteSubscriber,
    staffLoading, handleManagerAction, handleDeleteManager, handleAddManager,
    settingsLoading, setSettings, saveSettings, handleLogoUpload,
    heroLoading, heroSaving, saveAllHeroSlides, uploadHeroMedia, updateHeroSlide, deleteHeroSlide, handleAddHeroSlide,
    mediaLoading, mediaFilter, setMediaFilter, handleMediaUpload, deleteMediaItem, setSelectedMedia,
    me, addToast
  } = state;

  return (
    <>
      {tab === 'media' && (() => {
        const MEDIA_FILTERS = [
          { key: 'all',      label: 'All Media',      color: 'bg-gray-900 text-white',         inactive: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' },
          { key: 'hero',     label: 'Hero Slides',    color: 'bg-rose-500 text-white',          inactive: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' },
          { key: 'admin',    label: 'Admin Uploads',  color: 'bg-indigo-600 text-white',        inactive: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' },
          { key: 'staff',    label: 'Staff Avatars',  color: 'bg-emerald-600 text-white',       inactive: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' },
          { key: 'customer', label: 'Customers',      color: 'bg-blue-600 text-white',          inactive: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' },
          { key: 'product',  label: 'Products',       color: 'bg-orange-500 text-white',        inactive: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' },
          { key: 'external', label: 'External',       color: 'bg-gray-500 text-white',          inactive: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' },
        ];
        
        const CATEGORY_META = {
          hero:     { label: 'Hero',     bg: 'bg-rose-500' },
          admin:    { label: 'Admin',    bg: 'bg-indigo-500' },
          staff:    { label: 'Staff',    bg: 'bg-emerald-500' },
          customer: { label: 'Customer', bg: 'bg-blue-500' },
          product:  { label: 'Product',  bg: 'bg-orange-500' },
          external: { label: 'External', bg: 'bg-gray-500' },
        };
        
        const filteredMedia = mediaFilter === 'all' ? mediaItems : mediaItems.filter(item => item.category === mediaFilter);
        
        function downloadImage(url, filename) {
          const a = document.createElement('a');
          a.href = url;
          a.download = filename || 'hero-image.jpg';
          a.target = '_blank';
          a.click();
        }

        return (
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Media Library</h2>
                <p className="text-sm text-gray-400 mt-0.5">{mediaItems.length} files stored across all buckets</p>
              </div>
              <label className="inline-flex items-center gap-1.5 rounded-md border border-gray-900 bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-gray-700 active:bg-gray-800 transition-all duration-150 cursor-pointer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Upload Image
                <input type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
              </label>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {MEDIA_FILTERS.map(f => (
                <button key={f.key} onClick={() => setMediaFilter(f.key)}
                  className={\`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-150 \${mediaFilter === f.key ? f.color : f.inactive}\`}>
                  {f.label}
                  <span className={\`inline-flex items-center justify-center h-4 min-w-[16px] px-1 text-[9px] font-bold rounded-full \${mediaFilter === f.key ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}\`}>
                    {f.key === 'all' ? mediaItems.length : mediaItems.filter(i => i.category === f.key).length}
                  </span>
                </button>
              ))}
            </div>
            
            {mediaFilter === 'hero' && (
              <div className="mb-8 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Hero Slides Configuration</h3>
                      <p className="text-sm text-gray-400 mt-0.5">{heroSlides.length} slide{heroSlides.length !== 1 ? 's' : ''} — changes auto-save</p>
                    </div>
                    <Btn onClick={saveAllHeroSlides} disabled={heroSaving} variant="primary" size="sm">
                      {heroSaving ? <Spinner /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13"/><polyline points="7 3 7 8 15 8"/></svg>}
                      {heroSaving ? 'Saving…' : 'Save Slides'}
                    </Btn>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    {heroLoading ? (
                      <div className="flex h-48 items-center justify-center gap-2 text-sm text-gray-400"><Spinner /> Loading slides…</div>
                    ) : heroSlides.length === 0 ? (
                      <EmptyState icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} title="No hero slides" sub="Add your first slide using the form" />
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {heroSlides.map((slide, idx) => (
                          <div key={idx} className="flex items-start gap-5 p-5 hover:bg-gray-50/50 transition">
                            <div className="shrink-0 flex flex-col items-center gap-2">
                              <div className="relative group/img">
                                {slide.image || slide.image_url ? (
                                  <div className="relative">
                                    <img src={slide.image || slide.image_url} className="h-24 w-40 rounded-md object-cover border border-gray-200 shadow-sm" alt="Slide" />
                                    <button onClick={(e) => { e.stopPropagation(); downloadImage(slide.image || slide.image_url, \`hero-slide-\${idx + 1}.png\`); }}
                                      className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-900 hover:scale-110 transition-all opacity-0 group-hover/img:opacity-100 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1" title="Download">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex h-24 w-40 items-center justify-center rounded-md bg-gray-100 border border-gray-200 text-gray-400">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                  </div>
                                )}
                              </div>
                              <label className="flex w-40 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                {slide.image ? 'Replace' : 'Upload'} Image
                                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadHeroMedia(f, idx, 'image'); }} />
                              </label>
                            </div>

                            <div className="flex-1 min-w-0 space-y-3">
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Heading</label>
                                <input type="text" value={slide.heading || ''}
                                  onChange={e => updateHeroSlide(idx, 'heading', e.target.value)}
                                  className="w-full rounded-md border border-gray-200 px-3.5 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all" placeholder="Main Heading" />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Subtitle</label>
                                  <input type="text" value={slide.sub || ''}
                                    onChange={e => updateHeroSlide(idx, 'sub', e.target.value)}
                                    className="w-full rounded-md border border-gray-200 px-3.5 py-2 text-xs text-gray-700 outline-none focus:border-gray-400 transition-all" placeholder="Subtitle" />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Link URL</label>
                                  <input type="text" value={slide.link || ''}
                                    onChange={e => updateHeroSlide(idx, 'link', e.target.value)}
                                    className="w-full rounded-md border border-gray-200 px-3.5 py-2 text-xs text-gray-700 outline-none focus:border-gray-400 transition-all" placeholder="/collections" />
                                </div>
                              </div>
                            </div>

                            <Btn onClick={() => deleteHeroSlide(idx)} variant="danger" size="sm" className="h-8 w-8 !p-0">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                            </Btn>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-900 text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Add New Slide</h3>
                        <p className="text-xs text-gray-400">Create a new hero banner</p>
                      </div>
                    </div>
                    <form onSubmit={handleAddHeroSlide} className="space-y-4">
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-500">Heading <span className="text-rose-500">*</span></label>
                        <input type="text" name="heading" required
                          className="w-full rounded-md border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all" placeholder="Transform Your Skin" />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-500">Subtitle</label>
                        <input type="text" name="sub"
                          className="w-full rounded-md border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all" placeholder="New Collection" />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-500">Link URL</label>
                        <input type="text" name="link"
                          className="w-full rounded-md border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all" placeholder="/collections/all" />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-500">Image URL</label>
                        <input type="url" name="imageUrl"
                          className="w-full rounded-md border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all" placeholder="https://…or upload after adding" />
                      </div>
                      <Btn type="submit" variant="primary" size="md" className="w-full">
                        Add Slide
                      </Btn>
                    </form>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
              {mediaLoading ? (
                <div className="flex h-48 items-center justify-center gap-2 text-sm text-gray-400"><Spinner /> Loading media…</div>
              ) : filteredMedia.length === 0 ? (
                <EmptyState icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>} title="No media found" sub={mediaFilter === 'all' ? 'Upload images to get started' : \`No \${mediaFilter} files found\`} />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filteredMedia.map((item, idx) => {
                    const catMeta = CATEGORY_META[item.category] || CATEGORY_META.external;
                    const realIdx = mediaItems.indexOf(item);
                    return (
                      <div key={idx} className="group relative aspect-square rounded-xl border border-gray-200 overflow-hidden bg-gray-50 cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                        {item.url && /\\.(mp4|webm|ogg|mov)$/i.test(item.url) ? (
                          <video src={item.url} className="h-full w-full object-cover" onClick={() => setSelectedMedia(item)} preload="metadata" muted />
                        ) : (
                          <img src={item.url} alt={item.name} className="h-full w-full object-cover" onClick={() => setSelectedMedia(item)} />
                        )}
                        <span className={\`absolute top-1.5 left-1.5 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white rounded-full \${catMeta.bg}\`}>
                          {catMeta.label}
                        </span>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2 translate-y-full group-hover:translate-y-0 transition-transform">
                          <p className="text-[10px] text-white truncate">{item.name}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteMediaItem(realIdx); }}
                          className="absolute right-2 top-2 rounded-full bg-rose-500 p-2 text-white opacity-0 shadow-lg transition-all hover:bg-rose-600 hover:scale-110 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </>
  );
}
`;

fs.writeFileSync('app/admin/dashboard/tabs/MediaTab.js', content);
