import React from 'react';
import Link from 'next/link';
import { 
  Badge, EmptyState, Spinner, StatCard, Table, Th, Td, SearchInput, Select,
  COURIER_OPTIONS, CATEGORIES, STATUS_META, Btn,
  formatCurrency, formatDate, cleanItems, getTrackingMeta, sendWhatsApp
} from '../components/UI';

export default function ProductsTab({ state }) {
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
      
            {tab === 'products' && (
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[220px]">
                    <SearchInput value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Search products…" />
                  </div>
                  <Select value={productCategory} onChange={e => setProductCategory(e.target.value)}>
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </Select>
                  <Select value={productSort} onChange={e => setProductSort(e.target.value)}>
                    <option value="name">Name A–Z</option>
                    <option value="price_asc">Price Low–High</option>
                    <option value="price_desc">Price High–Low</option>
                    <option value="stock_asc">Stock Low–High</option>
                    <option value="stock_desc">Stock High–Low</option>
                  </Select>
                  {(!me || me.role === 'admin' || me.permissions?.all_products) && (
                    <Link href="/admin/products/new"
                      className="btn btn-sm btn-outline">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      New Product
                    </Link>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  {loading ? <div className="h-48 flex items-center justify-center gap-2 text-sm text-gray-400"><Spinner /> Loading products…</div> : (
                    <>
                      <Table>
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/80">
                            <Th>Image</Th>
                            <Th>Name</Th>
                            <Th>Category</Th>
                            <Th>Price</Th>
                            <Th>Stock</Th>
                            <Th right>Actions</Th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50/70 transition group">
                              <td className="px-5 py-3 w-14">
                                <div className="h-10 w-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                  {p.image_url
                                    ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                                    : <div className="h-full w-full flex items-center justify-center text-gray-300"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
                                  }
                                </div>
                              </td>
                              <td className="px-5 py-3 font-semibold text-gray-900">{p.name}</td>
                              <td className="px-5 py-3">
                                {p.category ? <Badge variant="info">{p.category.replace(/-/g, ' ')}</Badge> : <span className="text-gray-300">—</span>}
                              </td>
                              <td className="px-5 py-3">
                                <span className="font-bold text-gray-900">{formatCurrency(p.price)}</span>
                                {p.compare_at_price && <span className="ml-2 text-[11px] text-gray-400 line-through">{formatCurrency(p.compare_at_price)}</span>}
                              </td>
                              <td className="px-5 py-3">
                                {editingStockId === p.id ? (
                                  <input type="number" value={editingStockVal} onChange={e => setEditingStockVal(e.target.value)}
                                    onBlur={() => { updateStock(p.id, editingStockVal); setEditingStockId(null); }}
                                    onKeyDown={e => { if (e.key === 'Enter') { updateStock(p.id, editingStockVal); setEditingStockId(null); } if (e.key === 'Escape') setEditingStockId(null); }}
                                    className="w-16 rounded-lg border border-blue-300 px-2 py-1 text-sm text-center outline-none" autoFocus />
                                ) : (
                                  <Btn onClick={() => { setEditingStockId(p.id); setEditingStockVal(String(p.stock)); }}
                                    variant="ghost" size="sm" className={`${p.stock === 0 ? '!text-rose-500' : p.stock < 10 ? '!text-amber-500' : '!text-emerald-600'}`}
                                    title="Click to edit stock">{p.stock}</Btn>
                                )}
                              </td>
                              <td className="px-5 py-3 text-right">
                                <div className="flex items-center justify-end gap-2 transition">
                                  <Link href={`/admin/products/${p.id}/edit`} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 hover:border-blue-300 active:bg-blue-200 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1">Edit</Link>
                                  <Btn onClick={() => deleteProduct(p.id)} variant="danger" size="sm">Delete</Btn>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {filteredProducts.length === 0 && (
                            <tr><td colSpan={6}><EmptyState
                              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>}
                              title="No products found"
                              sub={productSearch || productCategory !== 'all' ? 'Try adjusting your filters' : 'Add your first product'}
                            /></td></tr>
                          )}
                        </tbody>
                      </Table>
                      <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400 bg-gray-50/50">
                        {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )} 
    </>
  );
}
