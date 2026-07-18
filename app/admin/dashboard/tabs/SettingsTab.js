import React from 'react';
import Link from 'next/link';
import { 
  Badge, EmptyState, Spinner, StatCard, Table, Th, Td, SearchInput, Select,
  COURIER_OPTIONS, CATEGORIES, STATUS_META, Btn,
  formatCurrency, formatDate, cleanItems, getTrackingMeta, sendWhatsApp
} from '../components/UI';

export default function SettingsTab({ state }) {
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
      
            {tab === 'settings' && (
              <div className="max-w-2xl">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Store Settings</h2>
                  <p className="text-sm text-gray-400 mt-1">Configure API keys, contact info, and shipping preferences</p>
                </div>
                <div className="space-y-4">
                  {/* API Keys */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">API Keys</h3>
                        <p className="text-xs text-gray-400">For AI descriptions and image hosting</p>
                      </div>
                    </div>
                    {settingsLoading ? <div className="h-20 animate-pulse bg-gray-100 rounded-xl" /> : (
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-500">AI API Key (OpenAI / Groq)</label>
                        <input value={settings.ai_api_key || ''} onChange={e => setSettings(p => ({ ...p, ai_api_key: e.target.value }))}
                          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition" placeholder="sk-… or gsk-…" type="password" />
                      </div>
                    )}
                  </div>

                  {/* Store Logo */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Store Logo</h3>
                        <p className="text-xs text-gray-400">Shown in header and admin panel</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                        {settings.store_logo ? <img src={settings.store_logo} alt="Logo" className="h-full w-full object-contain p-1" /> : <span className="text-gray-300 text-xs">No logo</span>}
                      </div>
                      <label className="btn btn-sm btn-outline cursor-pointer">
                        Upload Logo
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.91 14a16 16 0 006.09 6.09l.91-.91a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7a2 2 0 011.72 2z"/></svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Contact Information</h3>
                        <p className="text-xs text-gray-400">Shown to customers for support</p>
                      </div>
                    </div>
                    {settingsLoading ? <div className="h-24 animate-pulse bg-gray-100 rounded-xl" /> : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2 block text-xs font-semibold text-gray-500">Contact Phone</label>
                          <input value={settings.contact_phone || ''} onChange={e => setSettings(p => ({ ...p, contact_phone: e.target.value }))}
                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition" placeholder="+92 300 0000000" />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold text-gray-500">Contact Email</label>
                          <input value={settings.contact_email || ''} onChange={e => setSettings(p => ({ ...p, contact_email: e.target.value }))}
                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition" placeholder="support@baroque.com" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shipping */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Shipping</h3>
                        <p className="text-xs text-gray-400">Set standard shipping charges</p>
                      </div>
                    </div>
                    {settingsLoading ? <div className="h-14 animate-pulse bg-gray-100 rounded-xl" /> : (
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-500">Standard Shipping Fee (Rs)</label>
                        <input type="number" value={settings.shipping_fee || ''} onChange={e => setSettings(p => ({ ...p, shipping_fee: e.target.value }))}
                          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition" placeholder="250" />
                      </div>
                    )}
                  </div>

                  <Btn onClick={saveSettings}
                    variant="primary" size="sm">
                    Save All Settings
                  </Btn>
                </div>
              </div>
            )} 
    </>
  );
}
