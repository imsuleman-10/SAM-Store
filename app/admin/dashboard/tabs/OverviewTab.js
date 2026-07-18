import React from 'react';
import Link from 'next/link';
import { 
  Badge, EmptyState, Spinner, StatCard, Table, Th, Td, SearchInput, Select,
  COURIER_OPTIONS, CATEGORIES, STATUS_META, Btn,
  formatCurrency, formatDate, cleanItems, getTrackingMeta, sendWhatsApp
} from '../components/UI';

export default function OverviewTab({ state }) {
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
      
            {tab === 'overview' && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Status distribution */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-5 text-sm font-bold text-gray-900">Order Status Distribution</h3>
                  {loading ? <div className="h-40 animate-pulse bg-gray-100 rounded-xl" /> : (
                    <div className="space-y-4">
                      {Object.entries(STATUS_META).map(([status, meta]) => {
                        const count = orders.filter(o => o.status === status).length;
                        const pct = orders.length > 0 ? (count / orders.length) * 100 : 0;
                        return (
                          <div key={status}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                                <span className="font-semibold text-gray-700">{meta.label}</span>
                              </div>
                              <span className="text-gray-400">{count} ({Math.round(pct)}%)</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                              <div className={`h-full rounded-full transition-all duration-700 ${meta.dot}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-5 text-sm font-bold text-gray-900">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Pending Orders', action: () => { setTab('orders'); setOrderFilter('pending'); }, bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800', count: analytics?.pending, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                      { label: 'All Products', action: () => setTab('products'), bg: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800', count: products.length, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg> },
                      { label: 'Subscribers', action: () => setTab('subscribers'), bg: 'bg-violet-50 hover:bg-violet-100 border-violet-200 text-violet-800', count: null, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
                      { label: 'Store Settings', action: () => setTab('settings'), bg: 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800', count: null, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> },
                    ].map((item, i) => (
                      <button key={i} onClick={item.action} className={`flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition ${item.bg}`}>
                        <div className="opacity-60">{item.icon}</div>
                        <div>
                          <p className="text-xs font-semibold">{item.label}</p>
                          {item.count != null && <p className="text-2xl font-bold mt-0.5">{item.count}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent orders */}
                <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">Recent Orders</h3>
                    <Btn onClick={() => setTab('orders')} variant="ghost" size="sm" className="!text-gray-500 hover:!text-gray-900">View all →</Btn>
                  </div>
                  {loading ? <div className="h-32 animate-pulse bg-gray-100 rounded-xl" /> : (
                    <div className="space-y-1">
                      {orders.slice(0, 6).map(o => {
                        const m = STATUS_META[o.status] || STATUS_META.pending;
                        return (
                          <div key={o.id} className="flex items-center gap-4 rounded-xl px-4 py-3 hover:bg-gray-50 transition cursor-pointer" onClick={() => setTab('orders')}>
                            <span className={`h-2 w-2 rounded-full shrink-0 ${m.dot}`} />
                            <span className="font-mono text-[11px] text-gray-400 w-20">#{o.id.slice(0,8).toUpperCase()}</span>
                            <span className="flex-1 text-sm font-medium text-gray-800 truncate">{o.customer_name}</span>
                            <span className="text-[11px] text-gray-400 hidden sm:block">{o.customer_city}</span>
                            <span className="text-sm font-bold text-gray-900">{formatCurrency(o.total)}</span>
                            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${m.badge}`}>{m.label}</span>
                          </div>
                        );
                      })}
                      {orders.length === 0 && !loading && (
                        <EmptyState
                          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>}
                          title="No orders yet"
                          sub="New orders will appear here"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )} 
    </>
  );
}
