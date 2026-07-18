'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const COURIER_OPTIONS = ['', 'TCS', 'Leopards', 'M&P', 'Call Courier', 'BlueEx', 'Trax', 'PostEx', 'Stallion', 'Other'];
const CATEGORIES = ['face-care', 'beard-care', 'hair-care', 'body-care', 'lip-care', 'eye-care', 'fragrances', 'tools'];

const STATUS_META = {
  pending:   { label: 'Pending',   dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmed', dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  shipped:   { label: 'Shipped',   dot: 'bg-violet-400', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  delivered: { label: 'Delivered', dot: 'bg-emerald-400',badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', dot: 'bg-rose-400',   badge: 'bg-rose-50 text-rose-700 border-rose-200' },
};

function getTrackingMeta(items) {
  if (!items || !Array.isArray(items)) return {};
  return items.find(i => i?.is_tracking_meta) || {};
}
function cleanItems(items) {
  if (!items || !Array.isArray(items)) return [];
  return items.filter(i => i && !i.is_tracking_meta);
}
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatCurrency(n) { return `Rs ${Number(n || 0).toLocaleString()}`; }
function sendWhatsApp(phone, msg) {
  const c = phone.replace(/\D/g, '');
  const num = c.startsWith('0') ? '92' + c.slice(1) : c;
  window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
}

function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 rounded-none px-4 py-3 text-sm font-medium shadow-xl border pointer-events-auto transition-all duration-300 ${
          t.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          t.type === 'error'   ? 'bg-rose-50 text-rose-800 border-rose-200' :
                                 'bg-white text-gray-800 border-gray-200'
        }`}>
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, icon, gradient, badge, badgeColor }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} shadow-sm`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-none bg-white/20 text-white">
          {icon}
        </div>
        {badge != null && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeColor || 'bg-white/20 text-white'}`}>{badge}</span>
        )}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-white/60 truncate">{sub}</p>}
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-8 h-20 w-20 rounded-full bg-white/5" />
    </div>
  );
}

function SideItem({ icon, label, active, onClick, badge, collapsed }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-sm font-medium transition-all duration-150 relative ${
        active
          ? 'bg-gray-100 text-gray-900 shadow-sm'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      } ${collapsed ? 'justify-center' : ''}`}
    >
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-black" />}
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
      {!collapsed && badge != null && badge > 0 && (
        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{badge}</span>
      )}
    </button>
  );
}

function ProfileTab({ staff, setStaff, addToast }) {
  const [name, setName] = useState(staff?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(staff?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/staff/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), avatar_url: avatarUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        setStaff(p => ({ ...p, ...data.staff }));
        addToast('Profile updated.', 'success');
      } else {
        const d = await res.json();
        addToast(d.error || 'Failed to update profile.', 'error');
      }
    } catch {
      addToast('Network error.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function compressImage(file, maxSizeKB) {
    if (file.size <= maxSizeKB * 1024) return file;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const MAX_SIZE = 800;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.9;
          const compress = () => {
            canvas.toBlob((blob) => {
              if (blob.size <= maxSizeKB * 1024 || quality <= 0.1) {
                const newName = file.name.replace(/\.[^/.]+$/, ".jpg");
                resolve(new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() }));
              } else {
                quality -= 0.1;
                compress();
              }
            }, 'image/jpeg', quality);
          };
          compress();
        };
      };
    });
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    addToast('Compressing & Uploading image…', 'info');
    try {
      const compressedFile = await compressImage(file, 150);
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('folder', 'staff');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setAvatarUrl(data.url);
        const patchRes = await fetch('/api/staff/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), avatar_url: data.url }),
        });
        if (patchRes.ok) {
          const patchData = await patchRes.json();
          setStaff(p => ({ ...p, ...patchData.staff }));
          addToast('Avatar updated.', 'success');
        }
      } else {
        addToast(data.error || 'Upload failed.', 'error');
      }
    } catch {
      addToast('Upload error.', 'error');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-10 flex flex-col items-center gap-4">
          <div className="relative group">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover ring-4 ring-white/30 shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/20 ring-4 ring-white/30 shadow-lg flex items-center justify-center text-4xl font-bold text-white">
                {(name || staff?.email || 'S').charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <span className="text-white text-xs font-semibold">{uploading ? '…' : 'Change'}</span>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
          <div className="text-center">
            <h2 className="text-white text-xl font-semibold">{name || staff?.email}</h2>
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-200 text-emerald-800">
              Staff
            </span>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Display Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-none border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address</label>
              <input type="text" value={staff?.email || ''} readOnly
                className="w-full rounded-none border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
              <p className="mt-1 text-[10px] text-gray-400">Email cannot be changed here.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Role</label>
              <input type="text" value="Staff" readOnly
                className="w-full rounded-none border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-400 cursor-not-allowed capitalize" />
            </div>
            <button type="submit" disabled={saving}
              className="btn btn-primary btn-sm">
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function StaffDashboard() {
  const router = useRouter();
  const [staff, setStaff] = useState(null);
  const [tab, setTab] = useState('orders');
  const [collapsed, setCollapsed] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [editingStockId, setEditingStockId] = useState(null);
  const [editingStockVal, setEditingStockVal] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSort, setOrderSort] = useState('newest');
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('all');
  const [productSort, setProductSort] = useState('name');
  const [toasts, setToasts] = useState([]);
  const [storeLogo, setStoreLogo] = useState(null);
  const globalRef = useRef(null);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => {
    // Try public-settings first, then admin/settings as fallback
    fetch('/api/public-settings')
      .then(r => r.ok ? r.json() : { settings: {} })
      .then(d => {
        if (d.settings?.store_logo) {
          setStoreLogo(d.settings.store_logo);
        } else {
          return fetch('/api/staff/me')
            .then(r => r.ok ? r.json() : {})
            .then(() => fetch('/api/public-settings'))
            .then(r => r.ok ? r.json() : { settings: {} })
            .then(d2 => { if (d2.settings?.store_logo) setStoreLogo(d2.settings.store_logo); });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/staff/me')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setStaff(data.staff);
        if (data.staff.first_login) {
          router.push('/staff/setup');
        }
      })
      .catch(() => router.push('/staff/login'));
  }, [router]);

  async function loadData() {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
      ]);
      setProducts((pRes.ok ? await pRes.json() : {}).products || []);
      setOrders((oRes.ok ? await oRes.json() : {}).orders || []);
    } catch (e) {
      console.error('Failed to fetch data', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (staff && !staff.first_login) loadData(); }, [staff]);

  async function updateOrderStatus(id, status) {
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    loadData();
  }
  async function updateOrderTracking(id, courier_company, tracking_id) {
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courier_company, tracking_id }) });
    loadData();
  }
  async function updateStock(productId, stock) {
    await fetch(`/api/products/${productId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stock }) });
    loadData();
  }
  async function handleLogout() {
    await fetch('/api/staff/logout', { method: 'POST' });
    router.push('/staff/login');
  }

  async function emailCustomer(order) {
    if (!order.customer_email) { addToast('No email on this order.', 'error'); return; }
    const msg = prompt(`Message to ${order.customer_name} (${order.customer_email}):`);
    if (!msg) return;
    const res = await fetch('/api/admin/email-customer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: order.id, email: order.customer_email, message: msg }) });
    if (res.ok) { addToast('Email sent!'); } else { const d = await res.json(); addToast(d.error || 'Failed.', 'error'); }
  }

  function handlePrintInvoice(order) {
    const items = cleanItems(order.items);
    const tracking = getTrackingMeta(order.items);
    const pw = window.open('', '_blank', 'width=900,height=1000');
    const orderId = order.id.slice(0, 8).toUpperCase();
    const date = formatDate(order.created_at);
    const total = formatCurrency(order.total);
    const subtotal = formatCurrency(items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0));
    const logoHtml = storeLogo ? `<img src="${storeLogo}" style="max-height:40px;max-width:160px;object-fit:contain" alt="Logo" />` : `<div class="logo">${storeLogo ? '' : 'Glowvie'}</div>`;
    pw.document.write(`<!DOCTYPE html><html><head><title>Invoice #${orderId}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { margin: 12mm 15mm; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; font-size: 11px; line-height: 1.6; background: #fafafa; padding: 30px; }
  .wrap { max-width: 780px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 1px 20px rgba(0,0,0,0.06); overflow: hidden; }
  .inner { padding: 40px 45px 35px; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 25px; border-bottom: 2px solid #1a1a2e; margin-bottom: 28px; }
  .logo { font-size: 26px; font-weight: 800; letter-spacing: 2.5px; color: #1a1a2e; }
  .logo-sub { font-size: 9px; font-weight: 500; letter-spacing: 3px; color: #888; text-transform: uppercase; margin-top: 4px; }
  .title-col { text-align: right; }
  .title-col h1 { font-size: 32px; font-weight: 200; letter-spacing: 4px; color: #1a1a2e; }
  .title-col .ref { font-size: 10px; color: #999; font-family: monospace; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-bottom: 30px; padding: 20px 0; border-bottom: 1px solid #eee; }
  .info-box h4 { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #aaa; margin-bottom: 8px; }
  .info-box p { margin: 2px 0; font-size: 12px; color: #1a1a2e; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead th { background: #1a1a2e; color: #fff; padding: 10px 14px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; text-align: left; }
  thead th:last-child, thead th:nth-child(3) { text-align: right; }
  tbody td { padding: 11px 14px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
  tbody td:last-child, tbody td:nth-child(3) { text-align: right; font-weight: 600; }
  .totals { display: flex; justify-content: flex-end; padding-top: 16px; border-top: 2px solid #1a1a2e; margin-bottom: 20px; }
  .totals-table { width: 280px; }
  .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
  .row.grand { font-size: 18px; font-weight: 800; border-top: 2px solid #1a1a2e; padding-top: 8px; margin-top: 6px; }
  .footer-section { border-top: 1px solid #eee; padding-top: 18px; display: flex; justify-content: space-between; font-size: 9px; color: #bbb; }
  .thanks { font-size: 12px; color: #1a1a2e; font-weight: 600; }
</style></head><body>
<div class="wrap"><div class="inner">
<div class="top">
  <div>${logoHtml}<div class="logo-sub">Premium Skincare &amp; Grooming</div></div>
  <div class="title-col"><h1>INVOICE</h1><div class="ref">#${orderId}</div></div>
</div>
<div class="info-grid">
  <div class="info-box"><h4>Bill To</h4><p><strong>${order.customer_name}</strong></p><p>${order.customer_address}</p><p>${order.customer_city}</p><p>${order.customer_phone}</p></div>
  <div class="info-box"><h4>Order Details</h4><p>Date: <strong>${date}</strong></p><p>Payment: <strong>Cash on Delivery</strong></p><p>Status: <strong>${order.status}</strong></p></div>
  <div class="info-box"><h4>Shipping Address</h4><p><strong>${order.customer_name}</strong></p><p>${order.customer_address}</p><p>${order.customer_city}</p><p>${order.customer_phone}</p></div>
</div>
<table>
  <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
  <tbody>${items.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td style="text-align:right">${formatCurrency(i.price)}</td><td>${formatCurrency(Number(i.price)*Number(i.qty))}</td></tr>`).join('')}</tbody>
</table>
<div class="totals"><div class="totals-table">
  <div class="row"><span>Subtotal</span><span>${subtotal}</span></div>
  <div class="row"><span>Shipping</span><span>Free</span></div>
  <div class="row grand"><span>Total Due</span><span>${total}</span></div>
</div></div>
<div class="footer-section"><div><div class="thanks">Thank you for your order!</div><div style="margin-top:4px">For queries, contact our support team</div></div></div>
</div></div>
<script>window.print(); window.onafterprint = () => window.close();</script></body></html>`);
    pw.document.close();
  }

  const analytics = useMemo(() => {
    if (loading || !orders.length) return null;
    const pending = orders.filter(o => o.status === 'pending').length;
    const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0);
    return { pending, revenue, total: orders.length };
  }, [orders, loading]);

  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (orderFilter !== 'all') list = list.filter(o => o.status === orderFilter);
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      list = list.filter(o => o.id.toLowerCase().includes(q) || (o.customer_name || '').toLowerCase().includes(q) || (o.customer_phone || '').toLowerCase().includes(q) || (o.customer_city || '').toLowerCase().includes(q));
    }
    if (orderSort === 'newest') list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (orderSort === 'oldest') list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    else if (orderSort === 'highest') list.sort((a, b) => Number(b.total) - Number(a.total));
    else if (orderSort === 'lowest') list.sort((a, b) => Number(a.total) - Number(b.total));
    return list;
  }, [orders, orderFilter, orderSearch, orderSort]);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (productCategory !== 'all') list = list.filter(p => p.category === productCategory);
    if (productSearch) { const q = productSearch.toLowerCase(); list = list.filter(p => (p.name || '').toLowerCase().includes(q)); }
    if (productSort === 'name') list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    else if (productSort === 'stock-asc') list.sort((a, b) => Number(a.stock) - Number(b.stock));
    else if (productSort === 'stock-desc') list.sort((a, b) => Number(b.stock) - Number(a.stock));
    return list;
  }, [products, productCategory, productSearch, productSort]);

  const SIDEBAR_ITEMS = [
    { key: 'orders', label: 'Orders', badge: analytics?.pending || 0, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg> },
    { key: 'products', label: 'Products', badge: null, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg> },
    { key: 'profile', label: 'My Profile', badge: null, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];

  if (!staff) return <div className="flex h-screen items-center justify-center text-sm text-gray-400 bg-[#f1f5f9]">Loading...</div>;

  return (
    <div className="flex h-screen bg-[#f1f5f9] text-gray-900 overflow-hidden font-sans">
      <Toast toasts={toasts} />

      <aside className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-200 shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}>
        <button
          onClick={() => setCollapsed(c => !c)}
          className={`flex h-16 w-full items-center border-b border-gray-100 px-4 hover:bg-gray-50 transition ${collapsed ? 'justify-center' : 'gap-3'}`}
          title="Toggle sidebar"
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-none shadow-sm overflow-hidden ${storeLogo ? 'bg-white border border-gray-100' : 'bg-black'}`}>
            {storeLogo ? <img src={storeLogo} className="h-full w-full object-contain p-0.5" alt="Logo" onError={(e) => { e.target.style.display='none'; setStoreLogo(null); }} /> : <span className="text-[11px] font-bold text-white tracking-widest">G</span>}
          </div>
          {!collapsed && (
            <div className="text-left">
              <h2 className="text-sm font-bold text-gray-900 tracking-wide">Glowvie</h2>
              <p className="text-[10px] text-gray-500">Staff Panel</p>
            </div>
          )}
        </button>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {SIDEBAR_ITEMS.map(item => (
            <SideItem key={item.key} icon={item.icon} label={item.label} active={tab === item.key} badge={item.badge} collapsed={collapsed} onClick={() => setTab(item.key)} />
          ))}
        </nav>

        <div className="border-t border-gray-100 p-3 space-y-1">
          <div className={`flex items-center gap-3 py-2 text-sm text-gray-500 ${collapsed ? 'justify-center px-0' : 'px-3'}`}>
            {staff.avatar_url ? (
              <img src={staff.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover shrink-0" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-400 shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            )}
            {!collapsed && <span className="truncate text-xs text-gray-600">{staff.name || staff.email}</span>}
          </div>
          <button onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-none py-2.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition text-sm ${collapsed ? 'justify-center px-0' : 'px-3'}`}
            title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="shrink-0"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-6 shadow-sm">
          <h1 className="text-sm font-semibold text-gray-900 capitalize">
            {SIDEBAR_ITEMS.find(i => i.key === tab)?.label || tab}
          </h1>
          {analytics && tab === 'orders' && (
            <span className="text-[11px] text-gray-400">· {analytics.total} total</span>
          )}
          <div className="flex-1" />
          <Link href="/" target="_blank" className="flex items-center gap-1.5 rounded-none border border-gray-200 px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            View Store
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-6 py-8">
            {analytics && (
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <StatCard label="Pending Orders" value={analytics.pending}
                  sub={analytics.pending > 0 ? 'Awaiting processing' : 'All clear'}
                  gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                  badge={analytics.pending} badgeColor="bg-white/20 text-white"
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                />
                <StatCard label="Total Revenue" value={formatCurrency(analytics.revenue)}
                  sub={`From ${analytics.total} orders`}
                  gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
                />
                <StatCard label="Total Orders" value={analytics.total}
                  sub="All time orders"
                  gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>}
                />
              </div>
            )}
            {loading && (
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                {[...Array(3)].map((_, i) => <div key={i} className="rounded-2xl bg-white p-5 shadow-sm animate-pulse h-32" />)}
              </div>
            )}

            {tab === 'orders' && (
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" placeholder="Search by ID, name, phone, city…" value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
                      className="w-full rounded-none border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition" />
                  </div>
                  <select value={orderFilter} onChange={e => setOrderFilter(e.target.value)}
                    className="rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-indigo-300 transition">
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <select value={orderSort} onChange={e => setOrderSort(e.target.value)}
                    className="rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-indigo-300 transition">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Value</option>
                    <option value="lowest">Lowest Value</option>
                  </select>
                  <button onClick={() => { setOrderSearch(''); setOrderFilter('all'); setOrderSort('newest'); }}
                    className="btn btn-outline btn-sm">Reset</button>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  {loading ? (
                    <div className="flex h-48 items-center justify-center gap-2 text-sm text-gray-400">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Loading orders…
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center gap-3 text-gray-400">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
                      <p className="text-sm">{orderSearch || orderFilter !== 'all' ? 'No orders match.' : 'No orders yet.'}</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-[11px] uppercase tracking-wider text-gray-400">
                              <th className="px-5 py-3.5 font-semibold">Order</th>
                              <th className="px-5 py-3.5 font-semibold">Customer</th>
                              <th className="px-5 py-3.5 font-semibold">Total</th>
                              <th className="px-5 py-3.5 font-semibold">Status</th>
                              <th className="px-5 py-3.5 font-semibold">Courier</th>
                              <th className="px-5 py-3.5 font-semibold">Tracking</th>
                              <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map(o => {
                              const tracking = getTrackingMeta(o.items);
                              const m = STATUS_META[o.status] || STATUS_META.pending;
                              return (
                                <React.Fragment key={o.id}>
                                  <tr className="hover:bg-slate-50/70 transition group">
                                    <td className="px-5 py-4">
                                      <span className="font-mono text-[11px] font-semibold text-gray-500">#{o.id.slice(0, 8).toUpperCase()}</span>
                                      <p className="text-[10px] text-gray-300 mt-0.5">{formatDate(o.created_at)}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                      <p className="font-semibold text-gray-900">{o.customer_name}</p>
                                      <p className="text-[11px] text-gray-400">{o.customer_city} · {o.customer_phone}</p>
                                    </td>
                                    <td className="px-5 py-4 font-bold text-gray-900">{formatCurrency(o.total)}</td>
                                    <td className="px-5 py-4">
                                      <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold outline-none cursor-pointer transition ${m.badge}`}>
                                        {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                      </select>
                                    </td>
                                    <td className="px-5 py-4">
                                      <select value={tracking.courier_company} onChange={e => updateOrderTracking(o.id, e.target.value, tracking.tracking_id)}
                                        className="w-28 rounded-none border border-gray-200 px-2 py-1.5 text-[11px] outline-none focus:border-indigo-300 bg-white">
                                        {COURIER_OPTIONS.map(c => <option key={c || 'none'} value={c}>{c || '— Select —'}</option>)}
                                      </select>
                                    </td>
                                    <td className="px-5 py-4">
                                      <input type="text" value={tracking.tracking_id} onChange={e => updateOrderTracking(o.id, tracking.courier_company, e.target.value)}
                                        placeholder="Tracking ID"
                                        className="w-28 rounded-none border border-gray-200 px-2 py-1.5 text-[11px] outline-none focus:border-indigo-300 bg-white" />
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        {o.customer_phone && (
                                          <button
                                            onClick={() => sendWhatsApp(o.customer_phone, `Hi ${o.customer_name}, your order #${o.id.slice(0,8).toUpperCase()} status is: ${o.status}. Thank you for shopping with us!`)}
                                            title="WhatsApp"
                                            className="flex h-7 w-7 items-center justify-center rounded-none border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                                          >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                          </button>
                                        )}
                                        {o.customer_email && (
                                          <button
                                            onClick={() => emailCustomer(o)}
                                            title="Email"
                                            className="flex h-7 w-7 items-center justify-center rounded-none border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                          >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handlePrintInvoice(o)}
                                          title="Print Invoice"
                                          className="flex h-7 w-7 items-center justify-center rounded-none border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition"
                                        >
                                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                                        </button>
                                        <button onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                                          className="rounded-none border border-gray-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm">
                                          {expandedOrder === o.id ? 'Hide' : 'Items'}
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                  {expandedOrder === o.id && (
                                    <tr>
                                      <td colSpan={7} className="bg-indigo-50/40 px-5 py-4 border-b border-indigo-100">
                                        <div className="space-y-3">
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Order Items {o.customer_address && <span className="text-gray-400 font-normal">· {o.customer_address}</span>}</p>
                                          <div className="flex flex-wrap gap-2">
                                            {cleanItems(o.items).map((item, idx) => (
                                              <div key={idx} className="flex items-center gap-3 rounded-none border border-indigo-100 bg-white px-4 py-2.5 shadow-sm">
                                                {item.image_url && <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded-none object-cover" />}
                                                <div>
                                                  <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                                                  <p className="text-[11px] text-gray-400">Qty: {item.qty} · {formatCurrency(item.price)}</p>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400 bg-gray-50/50">
                        Showing <span className="font-semibold text-gray-600">{filteredOrders.length}</span> of <span className="font-semibold text-gray-600">{orders.length}</span> orders
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {tab === 'products' && (
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" placeholder="Search products…" value={productSearch} onChange={e => setProductSearch(e.target.value)}
                      className="w-full rounded-none border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition" />
                  </div>
                  <select value={productCategory} onChange={e => setProductCategory(e.target.value)}
                    className="rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-indigo-300 transition">
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </select>
                  <select value={productSort} onChange={e => setProductSort(e.target.value)}
                    className="rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-indigo-300 transition">
                    <option value="name">Name A–Z</option>
                    <option value="stock-asc">Stock Low–High</option>
                    <option value="stock-desc">Stock High–Low</option>
                  </select>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  {loading ? <div className="h-48 animate-pulse bg-gray-50 m-4 rounded-none" /> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-[11px] uppercase tracking-wider text-gray-400">
                            <th className="px-5 py-3.5 font-semibold w-14">Image</th>
                            <th className="px-5 py-3.5 font-semibold">Name</th>
                            <th className="px-5 py-3.5 font-semibold">Category</th>
                            <th className="px-5 py-3.5 font-semibold">Price</th>
                            <th className="px-5 py-3.5 font-semibold">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredProducts.map(p => {
                            const media = p.media_urls?.length ? p.media_urls[0] : p.image_url;
                            const isVideo = media && /\.(mp4|webm|ogg|mov)$/i.test(media);
                            return (
                              <tr key={p.id} className="hover:bg-slate-50/70 transition group">
                                <td className="px-5 py-3">
                                  {media ? (isVideo ? (
                                    <div className="h-11 w-11 rounded-none bg-gray-100 flex items-center justify-center">
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                                    </div>
                                  ) : <img src={media} alt={p.name} className="h-11 w-11 rounded-none object-cover shadow-sm" />
                                  ) : (
                                    <div className="h-11 w-11 rounded-none bg-gray-100 flex items-center justify-center">
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                    </div>
                                  )}
                                </td>
                                <td className="px-5 py-3 font-semibold text-gray-900">{p.name}</td>
                                <td className="px-5 py-3">
                                  {p.category ? <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-600 capitalize">{p.category.replace(/-/g, ' ')}</span> : <span className="text-gray-300">—</span>}
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
                                      className="w-16 rounded-none border border-indigo-300 px-2 py-1 text-sm text-center outline-none" autoFocus />
                                  ) : (
                                    <button onClick={() => { setEditingStockId(p.id); setEditingStockVal(String(p.stock)); }}
                                      className={`font-bold px-2 py-1 rounded-none transition hover:bg-gray-100 cursor-pointer ${p.stock === 0 ? 'text-rose-500' : p.stock < 10 ? 'text-amber-500' : 'text-emerald-600'}`}
                                      title="Click to edit stock">{p.stock}</button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          {filteredProducts.length === 0 && (
                            <tr><td colSpan={5} className="py-16 text-center text-sm text-gray-400">{productSearch || productCategory !== 'all' ? 'No products match.' : 'No products yet.'}</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'profile' && (
              <ProfileTab staff={staff} setStaff={setStaff} addToast={addToast} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
