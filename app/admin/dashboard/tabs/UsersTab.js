import React from 'react';
import Link from 'next/link';
import { 
  Badge, EmptyState, Spinner, StatCard, Table, Th, Td, SearchInput, Select,
  COURIER_OPTIONS, CATEGORIES, STATUS_META, Btn,
  formatCurrency, formatDate, cleanItems, getTrackingMeta, sendWhatsApp
} from '../components/UI';

export default function UsersTab({ state }) {
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
      
            {tab === 'users' && (
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[220px]">
                    <SearchInput value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by email, name, phone…" />
                  </div>
                  <Btn onClick={() => { setUsersLoading(true); fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || [])).finally(() => setUsersLoading(false)); }} variant="secondary" size="sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                    Refresh
                  </Btn>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  {usersLoading ? (
                    <div className="flex h-48 items-center justify-center gap-2 text-sm text-gray-400"><Spinner /> Loading users…</div>
                  ) : filteredUsers.length === 0 ? (
                    <EmptyState icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>} title="No users found" />
                  ) : (
                    <Table>
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/80">
                          <Th>#</Th><Th>User</Th><Th>Name</Th><Th>Phone</Th><Th>Provider</Th><Th>Joined</Th><Th>Activity</Th><Th>Status</Th><Th right>Actions</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map((u, idx) => (
                          <tr key={u.id} className="hover:bg-gray-50/70 transition">
                            <Td mono muted>{idx + 1}</Td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-xs font-bold overflow-hidden">
                                  {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : (u.name !== '—' && u.name ? u.name[0] : u.email[0] || '?').toUpperCase()}
                                </div>
                                <span className="font-semibold text-gray-900 text-sm">{u.email}</span>
                              </div>
                            </td>
                            <Td>{u.name !== '—' ? u.name : <span className="text-gray-300">—</span>}</Td>
                            <td className="px-5 py-4 text-gray-600 font-mono text-[12px]">{u.phone !== '—' ? u.phone : <span className="text-gray-300">—</span>}</td>
                            <td className="px-5 py-4"><Badge>{u.provider}</Badge></td>
                            <Td muted>{formatDate(u.created_at)}</Td>
                            <td className="px-5 py-4">
                              {u.has_orders ? (
                                <div>
                                  <Badge variant="success">Placed Order</Badge>
                                  <p className="text-[10px] text-gray-400 mt-0.5">{u.order_count} order{u.order_count !== 1 ? 's' : ''}{u.latest_order_status ? ` · ${u.latest_order_status}` : ''}</p>
                                </div>
                              ) : <Badge>Account Only</Badge>}
                            </td>
                            <td className="px-5 py-4">
                              {u.banned ? <Badge variant="error">Banned</Badge>
                                : u.confirmed ? <Badge variant="success">Verified</Badge>
                                : <Badge variant="warning">Unverified</Badge>}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button onClick={() => handleBanUser(u.id, u.banned ? 'unban' : 'ban')}
                                className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition ${u.banned ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'}`}>
                                {u.banned ? 'Unban' : 'Ban'}
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
