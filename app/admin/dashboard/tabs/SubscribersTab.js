import React from 'react';
import Link from 'next/link';
import { 
  Badge, EmptyState, Spinner, StatCard, Table, Th, Td, SearchInput, Select,
  COURIER_OPTIONS, CATEGORIES, STATUS_META, Btn,
  formatCurrency, formatDate, cleanItems, getTrackingMeta, sendWhatsApp
} from '../components/UI';

export default function SubscribersTab({ state }) {
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
      
            {tab === 'subscribers' && (
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[220px]">
                    <SearchInput value={subscriberSearch} onChange={e => setSubscriberSearch(e.target.value)} placeholder="Search by email…" />
                  </div>
                  <span className="rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-2.5 text-xs font-semibold text-violet-700">
                    {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}
                  </span>
                  <Btn onClick={exportSubscribersCSV}
                    variant="secondary" size="sm">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export CSV
                  </Btn>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  {subscribersLoading ? (
                    <div className="flex h-48 items-center justify-center gap-2 text-sm text-gray-400"><Spinner /> Loading subscribers…</div>
                  ) : filteredSubscribers.length === 0 ? (
                    <EmptyState icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} title="No subscribers" sub="Users who subscribe via footer will appear here" />
                  ) : (
                    <Table>
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/80">
                          <Th>#</Th><Th>Email</Th><Th>Status</Th><Th>Joined</Th><Th right>Actions</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredSubscribers.map((s, idx) => (
                          <tr key={s.id || s.email} className="hover:bg-gray-50/70 transition group">
                            <Td mono muted>{idx + 1}</Td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-xs font-bold">
                                  {(s.email[0] || '?').toUpperCase()}
                                </div>
                                <span className="font-semibold text-gray-900">{s.email}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <Badge variant={s.status === 'subscribed' ? 'success' : 'default'}>{s.status || 'subscribed'}</Badge>
                            </td>
                            <Td muted>{formatDate(s.created_at)}</Td>
                            <td className="px-5 py-4 text-right">
                              <button onClick={() => deleteSubscriber(s.email)}
                                className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-100 transition opacity-0 group-hover:opacity-100">
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              </div>
            )} 
    </>
  );
}
