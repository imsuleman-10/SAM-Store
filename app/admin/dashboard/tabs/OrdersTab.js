import React from 'react';
import Link from 'next/link';
import { 
  Badge, EmptyState, Spinner, StatCard, Table, Th, Td, SearchInput, Select,
  COURIER_OPTIONS, CATEGORIES, STATUS_META, Btn,
  formatCurrency, formatDate, cleanItems, getTrackingMeta, sendWhatsApp
} from '../components/UI';

export default function OrdersTab({ state }) {
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
      
            {tab === 'orders' && (
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[220px]">
                    <SearchInput value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="Search by ID, name, phone, city…" />
                  </div>
                  <Select value={orderFilter} onChange={e => setOrderFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </Select>
                  <Select value={orderSort} onChange={e => setOrderSort(e.target.value)}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Value</option>
                    <option value="lowest">Lowest Value</option>
                  </Select>
                  <Btn onClick={() => { setOrderSearch(''); setOrderFilter('all'); setOrderSort('newest'); }} variant="secondary" size="sm">Reset</Btn>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  {loading ? (
                    <div className="flex h-48 items-center justify-center gap-2 text-sm text-gray-400"><Spinner /> Loading orders…</div>
                  ) : filteredOrders.length === 0 ? (
                    <EmptyState
                      icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>}
                      title="No orders found"
                      sub={orderSearch || orderFilter !== 'all' ? 'Try adjusting your filters' : 'Orders will appear here once placed'}
                    />
                  ) : (
                    <>
                      <Table>
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/80">
                            <Th>Order</Th>
                            <Th>Customer</Th>
                            <Th>Contact</Th>
                            <Th>Total</Th>
                            <Th>Status</Th>
                            <Th>Courier</Th>
                            <Th>Tracking</Th>
                            <Th right>Actions</Th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredOrders.map(o => {
                            const tracking = getTrackingMeta(o.items);
                            const m = STATUS_META[o.status] || STATUS_META.pending;
                            return (
                              <React.Fragment key={o.id}>
                                <tr className="hover:bg-gray-50/70 transition group">
                                  <td className="px-5 py-4">
                                    <button onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)} className="text-left rounded hover:bg-gray-100/50 p-1 -ml-1 transition-colors">
                                      <span className="font-mono text-[11px] font-semibold text-gray-500">#{o.id.slice(0, 8).toUpperCase()}</span>
                                      <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(o.created_at)}</p>
                                    </button>
                                  </td>
                                  <td className="px-5 py-4">
                                    <p className="font-semibold text-gray-900">{o.customer_name}</p>
                                    <p className="text-[11px] text-gray-400">{o.customer_city}</p>
                                  </td>
                                  <td className="px-5 py-4">
                                    <button onClick={() => sendWhatsApp(o.customer_phone, `Hi ${o.customer_name}, your Glowvie order #${o.id.slice(0,8).toUpperCase()} is ${o.status}.`)}
                                      className="text-emerald-600 hover:text-emerald-700 font-mono text-[12px] flex items-center gap-1 hover:underline rounded p-0.5 -ml-0.5 transition-colors">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                      {o.customer_phone}
                                    </button>
                                    {o.customer_email && <p className="text-[11px] text-gray-400 mt-0.5">{o.customer_email}</p>}
                                  </td>
                                  <td className="px-5 py-4">
                                    <span className="font-bold text-gray-900">{formatCurrency(o.total)}</span>
                                  </td>
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`h-2 w-2 rounded-full ${m.dot}`} />
                                      <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold cursor-pointer outline-none transition ${m.badge}`}>
                                        {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                      </select>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4">
                                    <select value={tracking.courier_company || ''} onChange={e => updateOrderTracking(o.id, e.target.value, tracking.tracking_id || '')}
                                      className="rounded-lg border border-gray-200 px-2 py-1 text-[11px] text-gray-600 outline-none focus:border-gray-400 transition">
                                      {COURIER_OPTIONS.map(c => <option key={c} value={c}>{c || '— Select —'}</option>)}
                                    </select>
                                  </td>
                                  <td className="px-5 py-4">
                                    <input value={tracking.tracking_id || ''} onChange={e => updateOrderTracking(o.id, tracking.courier_company || '', e.target.value)}
                                      placeholder="Tracking ID" className="rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] w-28 outline-none focus:border-gray-400 transition" />
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <Btn onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)} variant="ghost" size="sm">
                                        {expandedOrder === o.id ? 'Hide' : 'Details'}
                                      </Btn>
                                      <Btn onClick={() => emailCustomer(o)} variant="info" size="sm">Email</Btn>
                                      <Btn onClick={() => handlePrintInvoice(o)} variant="secondary" size="sm">Print</Btn>
                                      {o.status === 'cancelled' && (
                                        <Btn onClick={() => deleteOrder(o.id)} variant="danger" size="sm">Delete</Btn>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                                {expandedOrder === o.id && (
                                  <tr>
                                    <td colSpan={8} className="bg-blue-50/30 px-5 py-4 border-b border-blue-100">
                                      <div className="space-y-3">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                                          Order Items {o.customer_address && <span className="text-gray-400 font-normal">· {o.customer_address}</span>}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {cleanItems(o.items).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white px-4 py-2.5 shadow-sm">
                                              {item.image_url && <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />}
                                              <div>
                                                <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                                                <p className="text-[11px] text-gray-400">Qty: {item.qty} · {formatCurrency(item.price)}</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        {tracking.courier_company && (
                                          <div className="inline-flex items-center gap-2 rounded-xl bg-violet-50 border border-violet-200 px-4 py-2 text-xs text-violet-700">
                                            <span className="font-semibold">Courier:</span> {tracking.courier_company}
                                            {tracking.tracking_id && <><span className="text-violet-300 mx-1">·</span><span className="font-semibold">Tracking:</span> {tracking.tracking_id}</>}
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </Table>
                      <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400 bg-gray-50/50">
                        Showing <span className="font-semibold text-gray-600">{filteredOrders.length}</span> of <span className="font-semibold text-gray-600">{orders.length}</span> orders
                      </div>
                    </>
                  )}
                </div>
              </div>
            )} 
    </>
  );
}
