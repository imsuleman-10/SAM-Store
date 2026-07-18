const fs = require('fs');
const path = require('path');

// Read the original file
const original = fs.readFileSync('app/admin/dashboard/page.js', 'utf8');
const lines = original.split('\n');

// Extract the logic section (before render)
const renderStart = lines.findIndex(l => l.includes('// ─── Render'));
const logicSection = lines.slice(0, renderStart + 1).join('\n');

// ── 1. Create the components directory
fs.mkdirSync('app/admin/dashboard/components', { recursive: true });

// ── 2. Write the new professional page.js
const newPage = `'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ─── Constants ────────────────────────────────────────────────────────────────
const COURIER_OPTIONS = ['', 'TCS', 'Leopards', 'M&P', 'Call Courier', 'BlueEx', 'Trax', 'PostEx', 'Stallion', 'Other'];
const CATEGORIES = ['face-care', 'beard-care', 'hair-care', 'body-care', 'lip-care', 'eye-care', 'fragrances', 'tools'];

const DEFAULT_HERO_SLIDES = [
  { image: '/images/products/dermive_hero_desktop.png', heading: 'Dermatologist-Backed Skincare Solutions', sub: 'DermiVe Moisturizing Wash' },
  { image: '/images/products/roots_hero_desktop.png', heading: 'Transform Your Hair', sub: 'Roots Hair Treatment Serum' },
  { image: '/images/products/relax_hero_desktop.png', heading: 'Reveal Your True Glow', sub: 'Relax Vitamin C Serum' },
  { image: '/images/products/markaway_hero_desktop.png', heading: 'Restore Skin Confidence', sub: 'Markaway Stretch Mark Serum' },
  { image: '/images/products/zafrani_hero_desktop.png', heading: 'Flawless Even Complexion', sub: 'Zafrani Beauty Cream' },
];

const STATUS_META = {
  pending:   { label: 'Pending',   dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 border-amber-200',   ring: 'ring-amber-300' },
  confirmed: { label: 'Confirmed', dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700 border-blue-200',      ring: 'ring-blue-300' },
  shipped:   { label: 'Shipped',   dot: 'bg-violet-400', badge: 'bg-violet-50 text-violet-700 border-violet-200', ring: 'ring-violet-300' },
  delivered: { label: 'Delivered', dot: 'bg-emerald-400',badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', ring: 'ring-emerald-300' },
  cancelled: { label: 'Cancelled', dot: 'bg-rose-400',   badge: 'bg-rose-50 text-rose-700 border-rose-200',      ring: 'ring-rose-300' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTrackingMeta(items) {
  if (!items || !Array.isArray(items)) return {};
  const meta = items.find(i => i?.is_tracking_meta);
  return meta ? { courier_company: meta.courier_company || '', tracking_id: meta.tracking_id || '' } : {};
}
function cleanItems(items) {
  if (!items || !Array.isArray(items)) return [];
  return items.filter(i => i && !i.is_tracking_meta);
}
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatCurrency(n) { return \`Rs \${Number(n || 0).toLocaleString()}\`; }
function sendWhatsApp(phone, msg) {
  const c = phone.replace(/\\D/g, '');
  const num = c.startsWith('0') ? '92' + c.slice(1) : c;
  window.open(\`https://wa.me/\${num}?text=\${encodeURIComponent(msg)}\`, '_blank');
}

// ─── UI Primitives ────────────────────────────────────────────────────────────
function Spinner({ size = 4 }) {
  return (
    <svg className={\`h-\${size} w-\${size} animate-spin text-current\`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        {icon}
      </div>
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function Badge({ children, variant = 'default' }) {
  const styles = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    purple: 'bg-violet-50 text-violet-700 border border-violet-200',
  };
  return (
    <span className={\`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold \${styles[variant]}\`}>
      {children}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={\`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-xl border pointer-events-auto animate-in slide-in-from-right-2 \${
          t.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          t.type === 'error'   ? 'bg-rose-50 text-rose-800 border-rose-200' :
                                 'bg-white text-gray-800 border-gray-200'
        }\`}>
          <span className={\`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold \${
            t.type === 'success' ? 'bg-emerald-200 text-emerald-700' : t.type === 'error' ? 'bg-rose-200 text-rose-700' : 'bg-gray-100 text-gray-600'
          }\`}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'i'}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, gradient, badge, badgeColor }) {
  return (
    <div className={\`relative overflow-hidden rounded-2xl p-5 \${gradient} shadow-sm\`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
          {icon}
        </div>
        {badge != null && (
          <span className={\`rounded-full px-2 py-0.5 text-[10px] font-bold \${badgeColor || 'bg-white/20 text-white'}\`}>{badge}</span>
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

// ─── Sidebar Item ─────────────────────────────────────────────────────────────
function SideItem({ icon, label, active, onClick, badge, collapsed }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={\`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 \${
        active
          ? 'bg-gray-900 text-white shadow-sm'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      } \${collapsed ? 'justify-center' : ''}\`}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
      {!collapsed && badge != null && badge > 0 && (
        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{badge}</span>
      )}
      {collapsed && badge != null && badge > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">{badge}</span>
      )}
    </button>
  );
}

// ─── Table Components ─────────────────────────────────────────────────────────
function Table({ children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}
function Th({ children, right }) {
  return <th className={\`px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 \${right ? 'text-right' : 'text-left'}\`}>{children}</th>;
}
function Td({ children, mono, muted }) {
  return <td className={\`px-5 py-4 \${mono ? 'font-mono text-[11px]' : ''} \${muted ? 'text-gray-400' : 'text-gray-900'}\`}>{children}</td>;
}

// ─── Search Input ─────────────────────────────────────────────────────────────
function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition"
      />
    </div>
  );
}

function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange} className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400 transition cursor-pointer">
      {children}
    </select>
  );
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────
function ProfileTab({ me, setMe, addToast }) {
  const [name, setName] = useState(me?.name || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatar_url: me?.avatar_url }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMe(p => ({ ...p, ...updated }));
        addToast('Profile updated successfully.', 'success');
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

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    addToast('Uploading image…', 'info');
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'admin');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        const patchRes = await fetch('/api/admin/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, avatar_url: data.url }),
        });
        if (patchRes.ok) {
          const updated = await patchRes.json();
          setMe(p => ({ ...p, ...updated }));
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

  const isSuperAdmin = me?.id === 'super_admin';

  return (
    <div className="max-w-lg mx-auto">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-gray-900 to-gray-700 px-8 py-12 flex flex-col items-center gap-4">
          <div className="relative group">
            {me?.avatar_url ? (
              <img src={me.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover ring-4 ring-white/20 shadow-xl" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/10 ring-4 ring-white/20 shadow-xl flex items-center justify-center text-4xl font-bold text-white">
                {(me?.name || me?.email || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            {!isSuperAdmin && (
              <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <span className="text-white text-xs font-semibold">{uploading ? '…' : 'Change'}</span>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>
          <div className="text-center">
            <h2 className="text-white text-xl font-bold">{me?.name || me?.email}</h2>
            <span className={\`inline-block mt-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider \${me?.role === 'admin' ? 'bg-amber-400 text-amber-900' : 'bg-blue-300 text-blue-900'}\`}>
              {me?.role || 'admin'}
            </span>
          </div>
        </div>
        <div className="p-8">
          {isSuperAdmin ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">You are logged in as the <strong>Super Admin</strong> via environment variables.</p>
              <p className="text-xs text-gray-400 mt-2">Profile customization is not available for the super admin account.</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Display Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Email Address</label>
                <input type="text" value={me?.email || ''} readOnly
                  className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
              </div>
              <button type="submit" disabled={saving}
                className="btn btn-primary w-full justify-center py-2.5">
                {saving ? <Spinner /> : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
`;

// Now append all the logic section (without the first "export default function AdminDashboard() {" line)
const dashboardStart = lines.findIndex(l => l.includes('export default function AdminDashboard()'));
const logicLines = lines.slice(dashboardStart + 1, renderStart);
const logicCode = logicLines.join('\n');

// Now write the render section
const renderCode = `
  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
      <Toast toasts={toasts} />

      {/* ── Sidebar ── */}
      <aside className={\`flex flex-col bg-white border-r border-gray-100 transition-all duration-300 shrink-0 shadow-sm \${collapsed ? 'w-[68px]' : 'w-[240px]'}\`}>
        {/* Brand */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={\`flex h-16 w-full items-center border-b border-gray-100 px-4 hover:bg-gray-50 transition \${collapsed ? 'justify-center' : 'gap-3'}\`}
          title="Toggle sidebar"
        >
          <div className={\`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm overflow-hidden \${storeLogo ? 'bg-white border border-gray-100' : 'bg-gray-900'}\`}>
            {storeLogo
              ? <img src={storeLogo} className="h-full w-full object-contain p-0.5" alt="Logo" onError={(e) => { e.target.style.display='none'; setStoreLogo(null); }} />
              : <span className="text-[11px] font-bold text-white tracking-widest">G</span>
            }
          </div>
          {!collapsed && (
            <div className="text-left min-w-0">
              <h2 className="text-sm font-bold text-gray-900 tracking-wide">Glowvie</h2>
              <p className="text-[10px] text-gray-400">Admin Panel</p>
            </div>
          )}
        </button>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {SIDEBAR_ITEMS.map(item => (
            <SideItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={tab === item.key}
              badge={item.badge}
              collapsed={collapsed}
              onClick={() => setTab(item.key)}
            />
          ))}
          
          {/* Profile at bottom of nav */}
          <div className="pt-2 mt-2 border-t border-gray-100">
            <SideItem
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/></svg>}
              label="My Profile"
              active={tab === 'profile'}
              collapsed={collapsed}
              onClick={() => setTab('profile')}
            />
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-100 p-3">
          <button
            onClick={handleLogout}
            className={\`flex w-full items-center gap-3 rounded-xl py-2.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition text-sm font-medium \${collapsed ? 'justify-center px-0' : 'px-3'}\`}
            title="Logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="shrink-0"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ── Top Header ── */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-100 bg-white px-6 shadow-sm">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-gray-900 hidden sm:block">
              {SIDEBAR_ITEMS.find(i => i.key === tab)?.label || tab === 'profile' ? (tab === 'profile' ? 'My Profile' : SIDEBAR_ITEMS.find(i => i.key === tab)?.label) : tab}
            </h1>
            {analytics && tab === 'orders' && (
              <span className="hidden sm:inline text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{analytics.total} total</span>
            )}
          </div>

          {/* Global search */}
          <div ref={globalRef} className="relative hidden md:block ml-2">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Quick search…"
              value={globalSearch}
              onChange={e => { setGlobalSearch(e.target.value); setShowGlobal(true); }}
              onFocus={() => setShowGlobal(true)}
              className="w-52 lg:w-64 rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-xs outline-none focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100 transition"
            />
            {showGlobal && globalResults.length > 0 && (
              <div className="absolute left-0 top-full mt-2 w-80 rounded-xl border border-gray-200 bg-white py-2 shadow-2xl z-50">
                {globalResults.map((r, i) => (
                  <button key={i} onClick={() => { setShowGlobal(false); setGlobalSearch(''); if (r.type === 'order') setTab('orders'); else setTab('products'); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition">
                    <span className={\`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold uppercase \${r.type === 'order' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}\`}>{r.type === 'order' ? 'O' : 'P'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.label}</p>
                      <p className="text-[11px] text-gray-400 truncate">{r.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <Link href="/" target="_blank"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              View Store
            </Link>
            <button onClick={() => setTab('profile')}
              className="flex h-9 w-9 items-center justify-center rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-400 transition shadow-sm">
              {me?.avatar_url
                ? <img src={me.avatar_url} alt="" className="h-full w-full object-cover" />
                : <div className="h-full w-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">{(me?.name || me?.email || 'A').charAt(0).toUpperCase()}</div>
              }
            </button>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-6 py-8">

            {/* ── Stat Cards (shown on overview/orders) ── */}
            {!loading && analytics && (tab === 'overview' || tab === 'orders') && (
              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Pending Orders" value={analytics.pending}
                  sub={analytics.pending > 0 ? \`\${formatCurrency(analytics.pendingRevenue)} pending\` : 'All clear'}
                  gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                  badge={analytics.pending} badgeColor="bg-white/20 text-white"
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                />
                <StatCard label="Total Revenue" value={formatCurrency(analytics.revenue)}
                  sub={\`Avg: \${formatCurrency(analytics.avgOrder)}\`}
                  gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
                />
                <StatCard label="Total Orders" value={analytics.total}
                  sub={\`\${analytics.delivered} delivered · \${analytics.cancelled} cancelled\`}
                  gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>}
                />
                <StatCard label="Registered Users" value={analytics.users}
                  sub={\`Top city: \${analytics.topCity}\`}
                  gradient="bg-gradient-to-br from-violet-500 to-purple-700"
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
                />
              </div>
            )}
            {loading && (tab === 'overview' || tab === 'orders') && (
              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5 animate-pulse h-32 shadow-sm" />)}
              </div>
            )}

            {/* ── Overview Tab ── */}
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
                                <span className={\`h-2 w-2 rounded-full \${meta.dot}\`} />
                                <span className="font-semibold text-gray-700">{meta.label}</span>
                              </div>
                              <span className="text-gray-400">{count} ({Math.round(pct)}%)</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                              <div className={\`h-full rounded-full transition-all duration-700 \${meta.dot}\`} style={{ width: \`\${pct}%\` }} />
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
                      <button key={i} onClick={item.action} className={\`flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition \${item.bg}\`}>
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
                    <button onClick={() => setTab('orders')} className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition">View all →</button>
                  </div>
                  {loading ? <div className="h-32 animate-pulse bg-gray-100 rounded-xl" /> : (
                    <div className="space-y-1">
                      {orders.slice(0, 6).map(o => {
                        const m = STATUS_META[o.status] || STATUS_META.pending;
                        return (
                          <div key={o.id} className="flex items-center gap-4 rounded-xl px-4 py-3 hover:bg-gray-50 transition cursor-pointer" onClick={() => setTab('orders')}>
                            <span className={\`h-2 w-2 rounded-full shrink-0 \${m.dot}\`} />
                            <span className="font-mono text-[11px] text-gray-400 w-20">#{o.id.slice(0,8).toUpperCase()}</span>
                            <span className="flex-1 text-sm font-medium text-gray-800 truncate">{o.customer_name}</span>
                            <span className="text-[11px] text-gray-400 hidden sm:block">{o.customer_city}</span>
                            <span className="text-sm font-bold text-gray-900">{formatCurrency(o.total)}</span>
                            <span className={\`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold \${m.badge}\`}>{m.label}</span>
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

            {/* ── Orders Tab ── */}
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
                  <button onClick={() => { setOrderSearch(''); setOrderFilter('all'); setOrderSort('newest'); }}
                    className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                    Reset
                  </button>
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
                                    <button onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)} className="text-left">
                                      <span className="font-mono text-[11px] font-semibold text-gray-500">#{o.id.slice(0, 8).toUpperCase()}</span>
                                      <p className="text-[10px] text-gray-300 mt-0.5">{formatDate(o.created_at)}</p>
                                    </button>
                                  </td>
                                  <td className="px-5 py-4">
                                    <p className="font-semibold text-gray-900">{o.customer_name}</p>
                                    <p className="text-[11px] text-gray-400">{o.customer_city}</p>
                                  </td>
                                  <td className="px-5 py-4">
                                    <button onClick={() => sendWhatsApp(o.customer_phone, \`Hi \${o.customer_name}, your Glowvie order #\${o.id.slice(0,8).toUpperCase()} is \${o.status}.\`)}
                                      className="text-emerald-600 hover:text-emerald-700 font-mono text-[12px] flex items-center gap-1 hover:underline">
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
                                      <span className={\`h-2 w-2 rounded-full \${m.dot}\`} />
                                      <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                                        className={\`rounded-lg border px-2.5 py-1 text-[11px] font-semibold cursor-pointer outline-none transition \${m.badge}\`}>
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
                                      <button onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                                        className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm">
                                        {expandedOrder === o.id ? 'Hide' : 'Details'}
                                      </button>
                                      <button onClick={() => emailCustomer(o)}
                                        className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[10px] font-medium text-blue-600 hover:bg-blue-100 transition shadow-sm">
                                        Email
                                      </button>
                                      <button onClick={() => handlePrintInvoice(o)}
                                        className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm">
                                        Print
                                      </button>
                                      {o.status === 'cancelled' && (
                                        <button onClick={() => deleteOrder(o.id)}
                                          className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-100 transition shadow-sm">
                                          Del
                                        </button>
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

            {/* ── Products Tab ── */}
            {tab === 'products' && (
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[220px]">
                    <SearchInput value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Search products…" />
                  </div>
                  <Select value={productCategory} onChange={e => setProductCategory(e.target.value)}>
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase())}</option>)}
                  </Select>
                  <Select value={productSort} onChange={e => setProductSort(e.target.value)}>
                    <option value="name">Name A–Z</option>
                    <option value="price-asc">Price Low–High</option>
                    <option value="price-desc">Price High–Low</option>
                    <option value="stock-asc">Stock Low–High</option>
                    <option value="stock-desc">Stock High–Low</option>
                  </Select>
                  {(!me || me.role === 'admin' || me.permissions?.all_products) && (
                    <Link href="/admin/products/new"
                      className="btn btn-primary flex items-center gap-1.5 text-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
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
                                  <button onClick={() => { setEditingStockId(p.id); setEditingStockVal(String(p.stock)); }}
                                    className={\`font-bold px-2.5 py-1 rounded-lg transition hover:bg-gray-100 cursor-pointer text-sm \${p.stock === 0 ? 'text-rose-500' : p.stock < 10 ? 'text-amber-500' : 'text-emerald-600'}\`}
                                    title="Click to edit stock">{p.stock}</button>
                                )}
                              </td>
                              <td className="px-5 py-3 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                                  <Link href={\`/admin/products/\${p.id}/edit\`} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-600 hover:bg-blue-100 transition">Edit</Link>
                                  <button onClick={() => deleteProduct(p.id)} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-100 transition">Delete</button>
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

            {/* ── Users Tab ── */}
            {tab === 'users' && (
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[220px]">
                    <SearchInput value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by email, name, phone…" />
                  </div>
                  <button onClick={() => { setUsersLoading(true); fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || [])).finally(() => setUsersLoading(false)); }}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                    Refresh
                  </button>
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
                                  <p className="text-[10px] text-gray-400 mt-0.5">{u.order_count} order{u.order_count !== 1 ? 's' : ''}{u.latest_order_status ? \` · \${u.latest_order_status}\` : ''}</p>
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
                                className={\`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition \${u.banned ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'}\`}>
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

            {/* ── Subscribers Tab ── */}
            {tab === 'subscribers' && (
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[220px]">
                    <SearchInput value={subscriberSearch} onChange={e => setSubscriberSearch(e.target.value)} placeholder="Search by email…" />
                  </div>
                  <span className="rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-2.5 text-xs font-semibold text-violet-700">
                    {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}
                  </span>
                  <button onClick={exportSubscribersCSV}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export CSV
                  </button>
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

            {/* ── Staff Tab ── */}
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
                      <button type="submit" className="btn btn-primary w-full justify-center py-2.5">
                        Add Staff Member
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* ── Settings Tab ── */}
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
                      <label className="btn btn-secondary cursor-pointer text-sm">
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

                  <button onClick={saveSettings}
                    className="btn btn-primary py-3 w-full justify-center text-base shadow-lg shadow-primary/20">
                    Save All Settings
                  </button>
                </div>
              </div>
            )}

            {/* ── Hero Slides Tab ── */}
            {tab === 'hero' && (() => {
              function downloadImage(url, filename) {
                const a = document.createElement('a');
                a.href = url;
                a.download = filename || 'hero-image.jpg';
                a.target = '_blank';
                a.click();
              }
              return (
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Hero Slides</h2>
                        <p className="text-sm text-gray-400 mt-0.5">{heroSlides.length} slide{heroSlides.length !== 1 ? 's' : ''} — changes auto-save</p>
                      </div>
                      <button onClick={saveAllHeroSlides} disabled={heroSaving}
                        className="btn btn-primary flex items-center gap-2">
                        {heroSaving ? <Spinner /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13"/><polyline points="7 3 7 8 15 8"/></svg>}
                        {heroSaving ? 'Saving…' : 'Save All'}
                      </button>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                      {heroLoading ? (
                        <div className="flex h-48 items-center justify-center gap-2 text-sm text-gray-400"><Spinner /> Loading slides…</div>
                      ) : heroSlides.length === 0 ? (
                        <EmptyState icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} title="No hero slides" sub="Add your first slide using the form" />
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {heroSlides.map((slide, idx) => (
                            <div key={idx} className="flex items-start gap-5 p-5 hover:bg-gray-50/50 transition">
                              <div className="shrink-0 flex flex-col items-center gap-2">
                                <div className="relative group/img">
                                  {slide.image || slide.image_url ? (
                                    <div className="relative">
                                      <img src={slide.image || slide.image_url} className="h-24 w-40 rounded-xl object-cover border border-gray-200 shadow-sm" alt="Slide" />
                                      <button onClick={() => downloadImage(slide.image || slide.image_url, \`hero-slide-\${idx + 1}.png\`)}
                                        className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-900 hover:scale-110 transition opacity-0 group-hover/img:opacity-100 shadow-md" title="Download">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex h-24 w-40 items-center justify-center rounded-xl bg-gray-100 border border-gray-200 text-gray-400">
                                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                    </div>
                                  )}
                                </div>
                                <label className="flex w-40 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                  {slide.image ? 'Replace' : 'Upload'} Image
                                  <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadHeroMedia(f, idx, 'image'); }} />
                                </label>
                              </div>

                              <div className="flex-1 min-w-0 space-y-3">
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Heading</label>
                                  <input type="text" value={slide.heading || ''}
                                    onChange={e => updateHeroSlide(idx, 'heading', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition" placeholder="Main Heading" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Subtitle</label>
                                    <input type="text" value={slide.sub || ''}
                                      onChange={e => updateHeroSlide(idx, 'sub', e.target.value)}
                                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs text-gray-700 outline-none focus:border-gray-400 transition" placeholder="Subtitle" />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Link URL</label>
                                    <input type="text" value={slide.link || ''}
                                      onChange={e => updateHeroSlide(idx, 'link', e.target.value)}
                                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs text-gray-700 outline-none focus:border-gray-400 transition" placeholder="/collections" />
                                  </div>
                                </div>
                              </div>

                              <button onClick={() => deleteHeroSlide(idx)}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-gray-300 hover:bg-rose-50 hover:text-rose-500 transition" title="Delete Slide">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">Add New Slide</h3>
                          <p className="text-xs text-gray-400">Create a new hero banner</p>
                        </div>
                      </div>
                      <form onSubmit={handleAddHeroSlide} className="space-y-4">
                        <div>
                          <label className="mb-2 block text-xs font-semibold text-gray-500">Heading <span className="text-rose-500">*</span></label>
                          <input type="text" name="heading" required
                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition" placeholder="Transform Your Skin" />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold text-gray-500">Subtitle</label>
                          <input type="text" name="sub"
                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition" placeholder="New Collection" />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold text-gray-500">Link URL</label>
                          <input type="text" name="link"
                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition" placeholder="/collections/all" />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold text-gray-500">Image URL</label>
                          <input type="url" name="imageUrl"
                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition" placeholder="https://…or upload after adding" />
                        </div>
                        <button type="submit" className="btn btn-primary w-full justify-center py-2.5">
                          Add Slide
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── Media Tab ── */}
            {tab === 'media' && (() => {
              const MEDIA_FILTERS = [
                { key: 'all',      label: 'All Media',      color: 'bg-gray-900 text-white',         inactive: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' },
                { key: 'admin',    label: 'Admin Uploads',  color: 'bg-indigo-600 text-white',        inactive: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' },
                { key: 'staff',    label: 'Staff Avatars',  color: 'bg-emerald-600 text-white',       inactive: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' },
                { key: 'customer', label: 'Customers',      color: 'bg-blue-600 text-white',          inactive: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' },
                { key: 'product',  label: 'Products',       color: 'bg-orange-500 text-white',        inactive: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' },
                { key: 'external', label: 'External',       color: 'bg-gray-500 text-white',          inactive: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' },
              ];
              const CATEGORY_META = {
                admin:    { label: 'Admin',    bg: 'bg-indigo-500' },
                staff:    { label: 'Staff',    bg: 'bg-emerald-500' },
                customer: { label: 'Customer', bg: 'bg-blue-500' },
                product:  { label: 'Product',  bg: 'bg-orange-500' },
                external: { label: 'External', bg: 'bg-gray-500' },
              };
              const filteredMedia = mediaFilter === 'all' ? mediaItems : mediaItems.filter(item => item.category === mediaFilter);
              return (
                <div>
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Media Library</h2>
                      <p className="text-sm text-gray-400 mt-0.5">{mediaItems.length} files stored across all buckets</p>
                    </div>
                    <label className="btn btn-primary cursor-pointer flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Upload Image
                      <input type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
                    </label>
                  </div>

                  <div className="mb-5 flex flex-wrap gap-2">
                    {MEDIA_FILTERS.map(f => (
                      <button key={f.key} onClick={() => setMediaFilter(f.key)}
                        className={\`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition \${mediaFilter === f.key ? f.color : f.inactive}\`}>
                        {f.label}
                        <span className={\`inline-flex items-center justify-center h-4 min-w-[16px] px-1 text-[9px] font-bold rounded-full \${mediaFilter === f.key ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}\`}>
                          {f.key === 'all' ? mediaItems.length : mediaItems.filter(i => i.category === f.key).length}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
                    {mediaLoading ? (
                      <div className="flex h-48 items-center justify-center gap-2 text-sm text-gray-400"><Spinner /> Loading media…</div>
                    ) : filteredMedia.length === 0 ? (
                      <EmptyState icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>} title="No media found" sub={mediaFilter === 'all' ? 'Upload images to get started' : \`No \${mediaFilter} files found\`} />
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {filteredMedia.map((item, idx) => {
                          const catMeta = CATEGORY_META[item.category] || CATEGORY_META.external;
                          const realIdx = mediaItems.indexOf(item);
                          return (
                            <div key={idx} className="group relative aspect-square rounded-xl border border-gray-200 overflow-hidden bg-gray-50 cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                              {item.url && /\\.(mp4|webm|ogg|mov)$/i.test(item.url) ? (
                                <video src={item.url} className="h-full w-full object-cover" onClick={() => setSelectedMedia(item)} preload="metadata" muted />
                              ) : (
                                <img src={item.url} alt={item.name} className="h-full w-full object-cover" onClick={() => setSelectedMedia(item)} />
                              )}
                              <span className={\`absolute top-1.5 left-1.5 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white rounded-full \${catMeta.bg}\`}>
                                {catMeta.label}
                              </span>
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2 translate-y-full group-hover:translate-y-0 transition-transform">
                                <p className="text-[10px] text-white truncate">{item.name}</p>
                              </div>
                              <button onClick={() => deleteMediaItem(realIdx)}
                                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition"
                                title="Delete">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* ── Profile Tab ── */}
            {tab === 'profile' && <ProfileTab me={me} setMe={setMe} addToast={addToast} />}

          </div>
        </main>
      </div>

      {/* ── Media Detail Modal ── */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setSelectedMedia(null)}>
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-base font-bold text-gray-900">Media Details</h3>
              <button onClick={() => setSelectedMedia(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-5">
              <div className="rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden min-h-[160px]">
                {/\\.(mp4|webm|ogg|mov)$/i.test(selectedMedia.url) ? (
                  <video src={selectedMedia.url} className="max-h-60 w-full" controls />
                ) : (
                  <img src={selectedMedia.url} className="max-h-60 object-contain" alt="" />
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">File Name</p>
                  <p className="text-sm font-medium text-gray-800 break-all">{selectedMedia.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Type</p>
                    <p className="text-sm font-medium text-gray-800">{/\\.(mp4|webm|ogg|mov)$/i.test(selectedMedia.url) ? 'Video' : 'Image'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Source</p>
                    <Badge variant={selectedMedia.source === 'external' ? 'warning' : 'success'}>
                      {selectedMedia.source === 'external' ? 'External' : 'Supabase Storage'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Uploaded At</p>
                  <p className="text-sm font-medium text-gray-800">{selectedMedia.created_at ? new Date(selectedMedia.created_at).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Usage in Website</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {(() => {
                      const u = [];
                      if (storeLogo === selectedMedia.url) u.push('Store Logo');
                      heroSlides.forEach((h, i) => { if (h.image === selectedMedia.url || h.image_url === selectedMedia.url) u.push(\`Hero Banner (Slide \${i + 1})\`); });
                      products.forEach(p => {
                        if (p.image_url === selectedMedia.url) u.push(\`Product Thumbnail: \${p.name}\`);
                        if (p.media_urls?.includes(selectedMedia.url)) u.push(\`Product Media: \${p.name}\`);
                      });
                      if (u.length === 0) return <li className="text-gray-400 italic text-xs">Not used anywhere</li>;
                      return u.map((text, i) => <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />{text}</li>);
                    })()}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Direct URL</p>
                  <div className="flex items-center gap-2">
                    <input type="text" readOnly value={selectedMedia.url} className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 outline-none" />
                    <button onClick={() => { if (navigator?.clipboard) { navigator.clipboard.writeText(selectedMedia.url); addToast('URL copied!', 'success'); } else { prompt('Copy URL:', selectedMedia.url); } }}
                      className="rounded-xl bg-gray-900 text-white px-4 py-2 text-xs font-semibold hover:bg-gray-700 transition whitespace-nowrap">
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

// Write the complete new file
const completeFile = newPage + logicCode + renderCode;
fs.writeFileSync('app/admin/dashboard/page.js', completeFile);

// Cleanup temp files
if (fs.existsSync('extract_state.js')) fs.unlinkSync('extract_state.js');
if (fs.existsSync('app/admin/dashboard/components/useAdminState.js')) {
  fs.unlinkSync('app/admin/dashboard/components/useAdminState.js');
}

console.log('✅ Dashboard UI completely rewritten!');
console.log('📁 File size:', Math.round(fs.statSync('app/admin/dashboard/page.js').size / 1024), 'KB');
