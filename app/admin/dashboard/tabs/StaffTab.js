import React from 'react';
import Link from 'next/link';
import { 
  Badge, EmptyState, Spinner, StatCard, Table, Th, Td, SearchInput, Select,
  COURIER_OPTIONS, CATEGORIES, STATUS_META, Btn,
  formatCurrency, formatDate, cleanItems, getTrackingMeta, sendWhatsApp
} from '../components/UI';

export default function StaffTab({ state }) {
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
      
            {tab === 'staff' && (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    {staffLoading ? (
                      <div className="flex h-48 items-center justify-center gap-2 text-sm text-gray-400"><Spinner /> Loading staff…</div>
                    ) : staff.length === 0 ? (
                      <EmptyState icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} title="No staff members" sub="Add your first staff member below" />
                    ) : (
                      <Table>
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/80">
                            <Th>Staff Member</Th><Th>Email</Th><Th>Status</Th><Th right>Actions</Th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {staff.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50/70 transition group">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  {s.avatar_url ? (
                                    <img src={s.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover border border-gray-200" />
                                  ) : (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400 border border-gray-200">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    </div>
                                  )}
                                  <span className="font-semibold text-gray-900">{s.name || '—'}</span>
                                </div>
                              </td>
                              <Td>{s.email}</Td>
                              <td className="px-5 py-4">
                                <Badge variant={s.first_login ? 'warning' : 'success'}>{s.first_login ? 'Pending Setup' : 'Active'}</Badge>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {!s.first_login && (
                                    <button onClick={() => handleManagerAction(s.id, 'reset')}
                                      className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-600 hover:bg-amber-100 transition">
                                      Reset Setup
                                    </button>
                                  )}
                                  <button onClick={() => handleDeleteManager(s.id)}
                                    className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-100 transition">
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </div>
                </div>

                <div>
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Add Staff Member</h3>
                        <p className="text-xs text-gray-400">Create a new staff account</p>
                      </div>
                    </div>
                    <form onSubmit={handleAddManager} className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-gray-500">Full Name</label>
                        <input type="text" name="name"
                          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition" placeholder="Ahmad Khan" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-gray-500">Email Address</label>
                        <input type="email" name="email" required
                          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition" placeholder="staff@baroque.com" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-gray-500">Password</label>
                        <input type="text" name="password" required
                          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition" placeholder="Strong password" />
                      </div>
                      <Btn type="submit" variant="primary" size="sm">
                        Add Staff Member
                      </Btn>
                    </form>
                  </div>
                </div>
              </div>
            )} 
    </>
  );
}
