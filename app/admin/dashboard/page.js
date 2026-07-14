'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STATUS_COLORS = {
  pending:   'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped:   'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminDashboard() {
  // Orders tab loads FIRST — most important
  const [tab, setTab] = useState('orders');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const router = useRouter();

  async function loadData() {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
      ]);
      const pData = pRes.ok ? await pRes.json() : { products: [] };
      const oData = oRes.ok ? await oRes.json() : { orders: [] };
      setProducts(pData.products || []);
      setOrders(oData.orders || []);
    } catch (e) {
      console.error('Failed to fetch data', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (tab === 'settings') {
      setSettingsLoading(true);
      fetch('/api/admin/settings')
        .then(r => r.ok ? r.json() : { settings: {} })
        .then(d => setSettings(d.settings || {}))
        .finally(() => setSettingsLoading(false));
    }
  }, [tab]);

  async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    loadData();
  }

  async function updateOrderStatus(id, status) {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadData();
  }

  async function deleteOrder(id) {
    if (!confirm('Are you sure you want to permanently delete this cancelled order? This action cannot be undone.')) return;
    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadData();
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to delete order.');
    }
  }

  async function emailCustomer(order) {
    if (!order.customer_email) {
      alert("This order does not have an email address associated with it.");
      return;
    }
    const msg = prompt(`Enter message to send to ${order.customer_name} (${order.customer_email}):`);
    if (!msg) return;

    setLoading(true);
    const res = await fetch('/api/admin/email-customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        email: order.customer_email,
        message: msg
      })
    });
    setLoading(false);
    
    if (res.ok) {
      alert('Email sent successfully!');
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to send email.');
    }
  }

  async function saveSettings() {
    setSettingsSaved(false);
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  // ── Stat cards ─────────────────────────────────────────────
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const todayRevenue  = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total), 0);
  const totalProducts = products.length;

  const TABS = [
    { key: 'orders',   label: 'Orders',   count: orders.length },
    { key: 'products', label: 'Products', count: products.length },
    { key: 'settings', label: 'Settings', count: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Topbar ─── */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-black">
              <span className="text-[10px] font-bold text-white tracking-wider">S&C</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">SAM&CO Admin</h1>
              <p className="text-[11px] text-gray-400">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              View Store
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* ── Stat cards ─── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: 'Pending Orders',
              value: loading ? '…' : pendingOrders,
              sub: 'Need attention',
              color: 'text-amber-600',
              bg: 'bg-amber-50',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              ),
            },
            {
              label: 'Total Revenue',
              value: loading ? '…' : `Rs ${todayRevenue.toLocaleString()}`,
              sub: 'All confirmed orders',
              color: 'text-green-600',
              bg: 'bg-green-50',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
              ),
            },
            {
              label: 'Total Products',
              value: loading ? '…' : totalProducts,
              sub: 'In catalogue',
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                </svg>
              ),
            },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">{s.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
                <p className="text-[11px] text-gray-400">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ─── */}
        <div className="mb-6 flex items-center gap-1 border-b border-gray-200">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition ${
                tab === t.key
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {t.label}
              {t.count !== null && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  tab === t.key ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {loading ? '…' : t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════ ORDERS TAB ══════ */}
        {tab === 'orders' && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex h-48 items-center justify-center text-sm text-gray-400">Loading orders…</div>
            ) : orders.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.4"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1" ry="1"/></svg>
                <p className="text-sm text-gray-400">No orders have been placed yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="px-5 py-3.5">Order ID</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Phone</th>
                    <th className="px-5 py-3.5">City</th>
                    <th className="px-5 py-3.5">Total</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Details</th>
                    <th className="px-5 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(o => (
                    <>
                      <tr key={o.id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-4 font-mono text-[11px] text-gray-400">
                          #{o.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-900">{o.customer_name}</td>
                        <td className="px-5 py-4 text-gray-600">{o.customer_phone}</td>
                        <td className="px-5 py-4 text-gray-600">{o.customer_city}</td>
                        <td className="px-5 py-4 font-semibold text-gray-900">
                          Rs {Number(o.total).toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={o.status}
                            onChange={e => updateOrderStatus(o.id, e.target.value)}
                            className={`rounded-full border-0 px-3 py-1 text-[11px] font-semibold outline-none cursor-pointer ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                            className="text-[11px] font-medium text-blue-600 hover:underline"
                          >
                            {expandedOrder === o.id ? 'Hide ▲' : 'Items ▼'}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2 items-center">
                            {o.customer_email && (
                              <button
                                onClick={() => emailCustomer(o)}
                                className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-100 transition"
                              >
                                Email
                              </button>
                            )}
                            {o.status === 'cancelled' && (
                              <button
                                onClick={() => deleteOrder(o.id)}
                                className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100 transition"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedOrder === o.id && (
                        <tr key={o.id + '_expanded'}>
                          <td colSpan={8} className="bg-gray-50 px-5 py-4">
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                              Order Items — {o.customer_address}
                            </p>
                            <div className="flex flex-wrap gap-3">
                              {(o.items || []).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                                  {item.image_url && (
                                    <img src={item.image_url} alt={item.name} className="h-8 w-8 rounded object-cover" />
                                  )}
                                  <div>
                                    <p className="text-xs font-medium text-gray-800">{item.name}</p>
                                    <p className="text-[10px] text-gray-400">Qty: {item.qty} · Rs {Number(item.price).toLocaleString()}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ══════ PRODUCTS TAB ══════ */}
        {tab === 'products' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">{products.length} product{products.length !== 1 ? 's' : ''} in catalogue</p>
              <Link
                href="/admin/products/new"
                className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Product
              </Link>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex h-48 items-center justify-center text-sm text-gray-400">Loading products…</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400">
                    <tr>
                      <th className="px-5 py-3.5 w-14">Image</th>
                      <th className="px-5 py-3.5">Name</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Price</th>
                      <th className="px-5 py-3.5">Stock</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map(p => {
                      const media = p.media_urls?.length ? p.media_urls[0] : p.image_url;
                      const isVideo = media && /\.(mp4|webm|ogg|mov)$/i.test(media);
                      return (
                        <tr key={p.id} className="hover:bg-gray-50 transition">
                          <td className="px-5 py-3">
                            {media ? (
                              isVideo ? (
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                              </div>
                              ) : (
                                <img src={media} alt={p.name} className="h-11 w-11 rounded-lg object-cover" />
                              )
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                          <td className="px-5 py-3">
                            {p.category ? (
                              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600 capitalize">
                                {p.category}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3 font-semibold text-gray-900">
                            Rs {Number(p.price).toLocaleString()}
                            {p.compare_at_price && (
                              <span className="ml-2 text-[11px] font-normal text-gray-400 line-through">
                                Rs {Number(p.compare_at_price).toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-gray-600">
                            <span className={`font-medium ${p.stock === 0 ? 'text-red-500' : p.stock < 10 ? 'text-amber-500' : 'text-gray-900'}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <Link
                                href={`/admin/products/${p.id}/edit`}
                                className="text-xs font-medium text-blue-600 hover:underline"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => deleteProduct(p.id)}
                                className="text-xs font-medium text-red-500 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-sm text-gray-400">
                          No products in the catalogue yet. Add your first product to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ══════ SETTINGS TAB ══════ */}
        {tab === 'settings' && (
          <div className="max-w-lg">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-1 text-base font-semibold text-gray-900">API Keys & Settings</h2>
              <p className="mb-6 text-xs text-gray-400">These keys are stored securely and used for AI and image features.</p>

              {settingsLoading ? (
                <p className="text-sm text-gray-400">Loading…</p>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-500">AI API Key (OpenAI)</label>
                    <input
                      value={settings.ai_api_key || ''}
                      onChange={e => setSettings(p => ({ ...p, ai_api_key: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-black transition"
                      placeholder="sk-…"
                      type="password"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-500">ImgBB API Key</label>
                    <input
                      value={settings.imgbb_api_key || ''}
                      onChange={e => setSettings(p => ({ ...p, imgbb_api_key: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-black transition"
                      placeholder="Enter ImgBB key"
                      type="password"
                    />
                  </div>
                  <button
                    onClick={saveSettings}
                    className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition"
                  >
                    {settingsSaved ? 'Changes Saved' : 'Save Settings'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
