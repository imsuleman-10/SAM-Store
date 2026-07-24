import React from 'react';
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
        
        const filteredMedia = mediaFilter === 'all' 
          ? mediaItems 
          : mediaFilter === 'external' 
            ? mediaItems.filter(item => item.source === 'external')
            : mediaItems.filter(item => item.category === mediaFilter);
        
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
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-150 ${mediaFilter === f.key ? f.color : f.inactive}`}>
                  {f.label}
                  <span className={`inline-flex items-center justify-center h-4 min-w-[16px] px-1 text-[9px] font-bold rounded-full ${mediaFilter === f.key ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                    {f.key === 'all' ? mediaItems.length : mediaItems.filter(i => i.category === f.key).length}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Hero configuration was moved to HeroTab */}

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
              {mediaLoading ? (
                <div className="flex h-48 items-center justify-center gap-2 text-sm text-gray-400"><Spinner /> Loading media…</div>
              ) : filteredMedia.length === 0 ? (
                <EmptyState icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>} title="No media found" sub={mediaFilter === 'all' ? 'Upload images to get started' : `No ${mediaFilter} files found`} />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filteredMedia.map((item, idx) => {
                    const catMeta = CATEGORY_META[item.category] || CATEGORY_META.external;
                    const realIdx = mediaItems.indexOf(item);
                    return (
                      <div key={idx} className="group relative aspect-square rounded-xl border border-gray-200 overflow-hidden bg-gray-50 cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                        {item.url && /\.(mp4|webm|ogg|mov)$/i.test(item.url) ? (
                          <video src={item.url} className="h-full w-full object-cover" onClick={() => setSelectedMedia(item)} preload="metadata" muted />
                        ) : (
                          <img src={item.url} alt={item.name} className="h-full w-full object-cover" onClick={() => setSelectedMedia(item)} />
                        )}
                        <span className={`absolute top-1.5 left-1.5 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white rounded-full ${catMeta.bg}`}>
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
