import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminState() {
  const router = useRouter();
  const [tab, setTab] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [me, setMe] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [managerScope, setManagerScope] = useState('all');
  const [managerProducts, setManagerProducts] = useState([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [editingStockId, setEditingStockId] = useState(null);
  const [editingStockVal, setEditingStockVal] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSort, setOrderSort] = useState('newest');
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('all');
  const [productSort, setProductSort] = useState('name');
  const [userSearch, setUserSearch] = useState('');
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [showGlobal, setShowGlobal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroLoading, setHeroLoading] = useState(false);
  const heroSlidesRef = useRef([]);
  // Keep ref in sync with state
  useEffect(() => { heroSlidesRef.current = heroSlides; }, [heroSlides]);
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaFilter, setMediaFilter] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState(null);
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
          // Fallback: load from admin settings
          return fetch('/api/admin/settings')
            .then(r => r.ok ? r.json() : { settings: {} })
            .then(d2 => { if (d2.settings?.store_logo) setStoreLogo(d2.settings.store_logo); });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => { if (globalRef.current && !globalRef.current.contains(e.target)) setShowGlobal(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [pRes, oRes, uRes, meRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/admin/users'),
        fetch('/api/admin/me'),
      ]);
      
      const myMe = meRes.ok ? await meRes.json() : null;
      if (myMe) setMe(myMe);

      let allProducts = (pRes.ok ? await pRes.json() : {}).products || [];
      if (myMe?.role === 'manager' && !myMe?.permissions?.all_products) {
         allProducts = allProducts.filter(p => myMe.permissions?.allowed_products?.includes(Number(p.id)) || myMe.permissions?.allowed_products?.includes(p.id));
      }
      setProducts(allProducts);

      setOrders((oRes.ok ? await oRes.json() : {}).orders || []);
      setUsers((uRes.ok ? await uRes.json() : {}).users || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
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
    if (tab === 'users') {
      setUsersLoading(true);
      fetch('/api/admin/users')
        .then(r => r.ok ? r.json() : { users: [] })
        .then(d => setUsers(d.users || []))
        .finally(() => setUsersLoading(false));
    }
    if (tab === 'subscribers') {
      setSubscribersLoading(true);
      fetch('/api/admin/subscribers')
        .then(r => r.ok ? r.json() : { subscribers: [] })
        .then(d => setSubscribers(d.subscribers || []))
        .finally(() => setSubscribersLoading(false));
    }
    if (tab === 'staff') {
      setStaffLoading(true);
      fetch('/api/admin/staff')
        .then(r => r.ok ? r.json() : { staff: [] })
        .then(d => setStaff(d.staff || []))
        .finally(() => setStaffLoading(false));
    }
    if (tab === 'hero') {
      setHeroLoading(true);
      fetch('/api/admin/hero-slides', { credentials: 'include' })
        .then(async r => {
          if (r.ok) return r.json();
          const errData = await r.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to fetch: ${r.status}`);
        })
        .then(d => {
          const mapped = (d.slides || []).map(s => ({ ...s, image: s.image_url, sub: s.subtitle, link: s.link_url }));
          setHeroSlides(mapped);
          heroSlidesRef.current = mapped;
        })
        .catch(err => { console.error(err); setHeroSlides([]); heroSlidesRef.current = []; addToast(err.message, 'error'); })
        .finally(() => setHeroLoading(false));
    }
    if (tab === 'media') {
      loadMediaItems();
    }
  }, [tab, me?.role]);

  async function deleteProduct(id) {
    if (!confirm('Delete this product permanently?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    loadData();
    addToast('Product deleted.');
  }
  async function updateOrderStatus(id, status) {
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    loadData();
    addToast(`Order marked as ${status}.`);
  }
  async function updateOrderTracking(id, courier_company, tracking_id) {
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courier_company, tracking_id }) });
    loadData();
  }
  async function deleteOrder(id) {
    if (!confirm('Delete this cancelled order permanently?')) return;
    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    if (res.ok) { loadData(); addToast('Order deleted.'); }
    else { const d = await res.json(); addToast(d.error || 'Failed to delete.', 'error'); }
  }
  async function emailCustomer(order) {
    if (!order.customer_email) { addToast('No email on this order.', 'error'); return; }
    const msg = prompt(`Message to ${order.customer_name} (${order.customer_email}):`);
    if (!msg) return;
    const res = await fetch('/api/admin/email-customer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: order.id, email: order.customer_email, message: msg }) });
    if (res.ok) { addToast('Email sent!'); } else { const d = await res.json(); addToast(d.error || 'Failed.', 'error'); }
  }
  async function saveSettings() {
    const res = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
    if (res.ok) { addToast('Settings saved successfully!'); }
    else { const d = await res.json(); addToast(d.error || 'Save failed.', 'error'); }
  }
  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    addToast('Uploading logo…', 'info');
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'admin');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setSettings(p => ({ ...p, store_logo: data.url }));
        addToast('Logo uploaded. Click "Save All Settings" to confirm.', 'success');
      } else {
        addToast(data.error || 'Upload failed.', 'error');
      }
    } catch {
      addToast('Upload error.', 'error');
    }
  }
  async function updateStock(productId, stock) {
    await fetch(`/api/products/${productId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stock }) });
    loadData();
  }
  async function handleBanUser(userId, action) {
    if (!confirm(action === 'ban' ? 'Ban this user?' : 'Unban this user?')) return;
    const res = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, action }) });
    if (res.ok) {
      const d = await res.json(); addToast(d.message || 'Done.');
      setUsersLoading(true);
      fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || [])).finally(() => setUsersLoading(false));
    } else { const d = await res.json(); addToast(d.error || 'Action failed.', 'error'); }
  }
  async function deleteSubscriber(email) {
    if (!confirm(`Remove ${email} from subscribers?`)) return;
    const res = await fetch('/api/admin/subscribers', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    if (res.ok) { setSubscribers(p => p.filter(s => s.email !== email)); addToast('Subscriber removed.'); }
    else { addToast('Failed to remove.', 'error'); }
  }
  function exportSubscribersCSV() {
    const csv = ['Email,Status,Joined', ...subscribers.map(s => `${s.email},${s.status},${formatDate(s.created_at)}`)].join('\\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv); a.download = 'subscribers.csv'; a.click();
  }

  async function handleAddManager(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = fd.get('email');
    const password = fd.get('password');
    const name = fd.get('name') || '';
    if (!email || !password) return addToast('Email and password required', 'error');

    const res = await fetch('/api/admin/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) });
    if (res.ok) { 
      addToast('Staff member added'); 
      e.target.reset(); 
      fetch('/api/admin/staff').then(r => r.json()).then(d => setStaff(d.staff || [])); 
    }
    else { const d = await res.json(); addToast(d.error || 'Failed to add staff', 'error'); }
  }

  async function handleManagerAction(id, action) {
    if (!confirm(action === 'reset' ? 'Reset setup for this staff member? They will need to set up their profile again.' : 'Confirm action?')) return;
    const body = action === 'reset' ? { id, reset_setup: true } : { id };
    const res = await fetch('/api/admin/staff', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { addToast('Staff updated'); fetch('/api/admin/staff').then(r => r.json()).then(d => setStaff(d.staff || [])); }
    else { const d = await res.json(); addToast(d.error || 'Update failed', 'error'); }
  }

  async function handleDeleteManager(id) {
    if (!confirm('Delete this staff member permanently?')) return;
    const res = await fetch('/api/admin/staff', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    if (res.ok) { addToast('Staff deleted'); setStaff(p => p.filter(s => s.id !== id)); }
    else { const d = await res.json(); addToast(d.error || 'Failed to delete', 'error'); }
  }

  function updateHeroSlide(idx, field, value) {
    setHeroSlides(p => {
      const updated = [...p];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
    const slide = heroSlidesRef.current[idx];
    if (slide?.id) {
      const dbField = field === 'sub' ? 'subtitle' : field === 'image' ? 'image_url' : field === 'link' ? 'link_url' : field;
      fetch(`/api/admin/hero-slides/${slide.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [dbField]: value }), credentials: 'include' })
        .catch(() => addToast('Auto-save failed', 'error'));
    }
  }

  async function uploadHeroMedia(file, idx, type) {
    if (!file) return;
    addToast('Uploading…', 'info');
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'hero_slides');
      const res = await fetch('/api/admin/media', { method: 'POST', body: formData, credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.url) {
        const field = type === 'video' ? 'videoUrl' : 'image';
        updateHeroSlide(idx, field, data.url);
        addToast('Uploaded!', 'success');
      } else {
        addToast(data.error || 'Upload failed.', 'error');
      }
    } catch {
      addToast('Upload error.', 'error');
    }
  }

  async function saveAllHeroSlides() {
    setHeroSaving(true);
    try {
      // Reload slides from DB to confirm all auto-saves persisted
      const res = await fetch('/api/admin/hero-slides', { credentials: 'include' });
      if (res.ok) {
        const d = await res.json();
        const mapped = (d.slides || []).map(s => ({ ...s, image: s.image_url, sub: s.subtitle, link: s.link_url }));
        setHeroSlides(mapped);
        heroSlidesRef.current = mapped;
        addToast('All changes saved!', 'success');
      } else {
        addToast('Failed to verify saves.', 'error');
      }
    } catch {
      addToast('Save verification failed.', 'error');
    } finally {
      setHeroSaving(false);
    }
  }

  async function deleteHeroSlide(idx) {
    if (!confirm('Delete this slide?')) return;
    const slide = heroSlidesRef.current[idx];
    if (slide?.id) {
      const res = await fetch(`/api/admin/hero-slides/${slide.id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) { addToast('Failed to delete.', 'error'); return; }
    }
    setHeroSlides(p => p.filter((_, i) => i !== idx));
    addToast('Slide deleted.', 'success');
  }

  async function moveHeroSlide(idx, dir) {
    const currentSlides = heroSlidesRef.current;
    const updated = [...currentSlides];
    const target = idx + dir;
    if (target < 0 || target >= updated.length) return;
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    setHeroSlides(updated);
    const slideIds = updated.map(s => s.id);
    if (slideIds.some(id => !id)) return; // Don't persist if any slide has no id
    const res = await fetch('/api/admin/hero-slides/reorder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slideIds }), credentials: 'include' });
    if (!res.ok) { addToast('Failed to reorder.', 'error'); }
    else { addToast('Reordered.', 'success'); }
  }

  async function downloadImage(url, filename) {
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      addToast('Image downloaded!', 'success');
    } catch (err) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Opening image in new tab to save...', 'info');
    }
  }

  async function handleAddHeroSlide(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const slideData = {
      image_url: fd.get('image') || '',
      heading: fd.get('heading') || '',
      subtitle: fd.get('sub') || '',
      link_url: fd.get('link') || '',
      video_url: fd.get('videoUrl') || '',
    };
    if (!slideData.image_url || !slideData.heading) {
      addToast('Image and heading required', 'error'); return;
    }
    const res = await fetch('/api/admin/hero-slides', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(slideData), credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      const newSlide = { ...data.slide, image: data.slide.image_url, sub: data.slide.subtitle, link: data.slide.link_url };
      setHeroSlides(p => {
        const updated = [...p, newSlide];
        heroSlidesRef.current = updated;
        return updated;
      });
      e.target.reset();
      addToast('Slide added.', 'success');
    } else {
      const d = await res.json();
      addToast(d.error || 'Failed to add.', 'error');
    }
  }

  async function loadMediaItems() {
    setMediaLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      setMediaItems(data.images || []);
    } catch { setMediaItems([]); }
    finally { setMediaLoading(false); }
  }

  async function handleMediaUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    addToast('Uploading…', 'info');
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'admin');
      const res = await fetch('/api/admin/media', { method: 'POST', body: formData });
      if (res.ok) { addToast('Uploaded!', 'success'); loadMediaItems(); }
      else { const d = await res.json(); addToast(d.error || 'Upload failed.', 'error'); }
    } catch { addToast('Upload error.', 'error'); }
  }

  async function deleteMediaItem(idx) {
    const item = mediaItems[idx];
    if (!item || !item.name) return;
    if (!confirm(`Delete ${item.name}?`)) return;
    const res = await fetch('/api/admin/media', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: item.name, folder: item.folder, bucket: item.bucket }) });
    if (res.ok) { setMediaItems(p => p.filter((_, i) => i !== idx)); addToast('Deleted.', 'success'); }
    else { addToast('Failed to delete.', 'error'); }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  function handlePrintInvoice(order) {
    const items = cleanItems(order.items);
    const tracking = getTrackingMeta(order.items);
    const pw = window.open('', '_blank', 'width=900,height=1000');
    const orderId = order.id.slice(0, 8).toUpperCase();
    const date = formatDate(order.created_at);
    const total = formatCurrency(order.total);
    const subtotal = formatCurrency(items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0));
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
  tbody tr:nth-child(even) td { background: #fafafa; }
  .totals { display: flex; justify-content: flex-end; padding-top: 16px; border-top: 2px solid #1a1a2e; margin-bottom: 20px; }
  .totals-table { width: 280px; }
  .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
  .row.grand { font-size: 18px; font-weight: 800; border-top: 2px solid #1a1a2e; padding-top: 8px; margin-top: 6px; }
  .footer-section { border-top: 1px solid #eee; padding-top: 18px; display: flex; justify-content: space-between; font-size: 9px; color: #bbb; }
  .thanks { font-size: 12px; color: #1a1a2e; font-weight: 600; }
</style></head><body>
<div class="wrap"><div class="inner">
<div class="top">
  <div><div class="logo">Glowvie</div><div class="logo-sub">Premium Skincare & Grooming</div></div>
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
<div class="footer-section"><div><div class="thanks">Thank you for your order!</div><div style="margin-top:4px">For queries, contact Glowvie support</div></div><div style="text-align:right;font-weight:600;color:#1a1a2e">Glowvie</div></div>
</div></div>
<script>window.print(); window.onafterprint = () => window.close();</script></body></html>`);
    pw.document.close();
  }

  const analytics = useMemo(() => {
    if (loading) return null;
    const active = orders.filter(o => o.status !== 'cancelled');
    const pending = orders.filter(o => o.status === 'pending');
    const revenue = active.reduce((s, o) => s + Number(o.total), 0);
    const delivered = orders.filter(o => o.status === 'delivered');
    const avgOrder = delivered.length > 0 ? (delivered.reduce((s, o) => s + Number(o.total), 0) / delivered.length) : 0;
    const pendingRevenue = pending.reduce((s, o) => s + Number(o.total), 0);
    const topCity = orders.length > 0
      ? [...new Set(orders.map(o => o.customer_city))].sort((a, b) => orders.filter(o => o.customer_city === b).length - orders.filter(o => o.customer_city === a).length)[0]
      : '—';
    return { active, pending, revenue, delivered, avgOrder, pendingRevenue, topCity };
  }, [loading, orders]);

  // ── Filtered / derived computations ────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (orderFilter !== 'all') list = list.filter(o => o.status === orderFilter);
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      list = list.filter(o =>
        o.id?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_phone?.toLowerCase().includes(q)
      );
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
    if (productSearch) {
      const q = productSearch.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    }
    if (productSort === 'name') list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    else if (productSort === 'price_asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (productSort === 'price_desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    else if (productSort === 'stock_asc') list.sort((a, b) => Number(a.stock) - Number(b.stock));
    return list;
  }, [products, productCategory, productSearch, productSort]);

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const q = userSearch.toLowerCase();
    return users.filter(u =>
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const filteredSubscribers = useMemo(() => {
    if (!subscriberSearch) return subscribers;
    const q = subscriberSearch.toLowerCase();
    return subscribers.filter(s => s.email?.toLowerCase().includes(q));
  }, [subscribers, subscriberSearch]);

  const globalResults = useMemo(() => {
    if (!globalSearch || globalSearch.length < 2) return [];
    const q = globalSearch.toLowerCase();
    const results = [];
    orders.filter(o =>
      o.id?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q)
    ).slice(0, 3).forEach(o => results.push({ type: 'order', label: `Order #${o.id.slice(0,8)} – ${o.customer_name}`, id: o.id }));
    products.filter(p => p.name?.toLowerCase().includes(q)).slice(0, 3).forEach(p =>
      results.push({ type: 'product', label: p.name, id: p.id })
    );
    users.filter(u => u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q)).slice(0, 3).forEach(u =>
      results.push({ type: 'user', label: u.full_name || u.email, id: u.id })
    );
    return results;
  }, [globalSearch, orders, products, users]);

  return {
    loading,
    analytics,
    orders,
    products,
    subscribers,
    users,
    staff,
    settings,
    heroSlides,
    mediaItems,
    tab,
    setTab,
    storeLogo,
    setStoreLogo,
    orderFilter,
    setOrderFilter,
    orderSearch,
    setOrderSearch,
    orderSort,
    setOrderSort,
    filteredOrders,
    expandedOrder,
    setExpandedOrder,
    updateOrderStatus,
    updateOrderTracking,
    emailCustomer,
    handlePrintInvoice,
    deleteOrder,
    productSearch,
    setProductSearch,
    productCategory,
    setProductCategory,
    productSort,
    setProductSort,
    filteredProducts,
    editingStockId,
    setEditingStockId,
    editingStockVal,
    setEditingStockVal,
    updateStock,
    deleteProduct,
    userSearch,
    setUserSearch,
    usersLoading,
    setUsersLoading,
    setUsers,
    filteredUsers,
    handleBanUser,
    subscriberSearch,
    setSubscriberSearch,
    subscribersLoading,
    filteredSubscribers,
    exportSubscribersCSV,
    deleteSubscriber,
    staffLoading,
    handleManagerAction,
    handleDeleteManager,
    handleAddManager,
    settingsLoading,
    setSettings,
    saveSettings,
    handleLogoUpload,
    heroLoading,
    heroSaving,
    saveAllHeroSlides,
    uploadHeroMedia,
    updateHeroSlide,
    deleteHeroSlide,
    handleAddHeroSlide,
    mediaLoading,
    mediaFilter,
    setMediaFilter,
    handleMediaUpload,
    deleteMediaItem,
    setSelectedMedia,
    me,
    setMe,
    addToast,
    collapsed,
    setCollapsed,
    handleLogout,
    globalRef,
    globalSearch,
    setGlobalSearch,
    setShowGlobal,
    showGlobal,
    globalResults,
    selectedMedia,
    toasts
  };
}
