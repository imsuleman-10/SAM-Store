import React from 'react';
import Link from 'next/link';

// ─── Button Component (industry-standard sizing + hover) ─────────────────────
/**
 * variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
 * size:    'sm' | 'md' | 'lg'
 */
export function Btn({ children, variant = 'secondary', size = 'sm', onClick, disabled, type = 'button', className = '', title }) {
  const base = 'inline-flex items-center justify-center gap-1.5 font-medium border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizes = {
    sm:  'px-4 py-2 text-[10px]',
    md:  'px-6 py-2.5 text-xs',
    lg:  'px-8 py-3 text-sm',
  };

  const variants = {
    primary:   'bg-white text-gray-900 border-gray-900 hover:bg-gray-900 hover:text-white uppercase tracking-[0.15em] font-bold rounded-none',
    secondary: 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 focus:ring-gray-200 shadow-sm rounded-md',
    danger:    'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 hover:border-rose-300 active:bg-rose-200 focus:ring-rose-300 rounded-md',
    ghost:     'bg-transparent text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 focus:ring-gray-200 rounded-md',
    success:   'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 active:bg-emerald-200 focus:ring-emerald-300 rounded-md',
    info:      'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300 active:bg-blue-200 focus:ring-blue-300 rounded-md',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${sizes[size] || sizes.sm} ${variants[variant] || variants.secondary} ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
export const COURIER_OPTIONS = ['', 'TCS', 'Leopards', 'M&P', 'Call Courier', 'BlueEx', 'Trax', 'PostEx', 'Stallion', 'Other'];
export const CATEGORIES = ['face-care', 'beard-care', 'hair-care', 'body-care', 'lip-care', 'eye-care', 'fragrances', 'tools'];

export const DEFAULT_HERO_SLIDES = [
  { image: '/images/products/dermive_hero_desktop.png', heading: 'Dermatologist-Backed Skincare Solutions', sub: 'DermiVe Moisturizing Wash' },
  { image: '/images/products/roots_hero_desktop.png', heading: 'Transform Your Hair', sub: 'Roots Hair Treatment Serum' },
  { image: '/images/products/relax_hero_desktop.png', heading: 'Reveal Your True Glow', sub: 'Relax Vitamin C Serum' },
  { image: '/images/products/markaway_hero_desktop.png', heading: 'Restore Skin Confidence', sub: 'Markaway Stretch Mark Serum' },
  { image: '/images/products/zafrani_hero_desktop.png', heading: 'Flawless Even Complexion', sub: 'Zafrani Beauty Cream' },
];

export const STATUS_META = {
  pending:   { label: 'Pending',   dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 border-amber-200',   ring: 'ring-amber-300' },
  confirmed: { label: 'Confirmed', dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700 border-blue-200',      ring: 'ring-blue-300' },
  shipped:   { label: 'Shipped',   dot: 'bg-violet-400', badge: 'bg-violet-50 text-violet-700 border-violet-200', ring: 'ring-violet-300' },
  delivered: { label: 'Delivered', dot: 'bg-emerald-400',badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', ring: 'ring-emerald-300' },
  cancelled: { label: 'Cancelled', dot: 'bg-rose-400',   badge: 'bg-rose-50 text-rose-700 border-rose-200',      ring: 'ring-rose-300' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getTrackingMeta(items) {
  if (!items || !Array.isArray(items)) return {};
  const meta = items.find(i => i?.is_tracking_meta);
  return meta ? { courier_company: meta.courier_company || '', tracking_id: meta.tracking_id || '' } : {};
}
export function cleanItems(items) {
  if (!items || !Array.isArray(items)) return [];
  return items.filter(i => i && !i.is_tracking_meta);
}
export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function formatCurrency(n) { return `Rs ${Number(n || 0).toLocaleString()}`; }
export function sendWhatsApp(phone, msg) {
  const c = phone.replace(/\D/g, '');
  const num = c.startsWith('0') ? '92' + c.slice(1) : c;
  window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ─── UI Primitives ────────────────────────────────────────────────────────────
export function Spinner({ size = 4 }) {
  return (
    <svg className={`h-${size} w-${size} animate-spin text-current`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

export function EmptyState({ icon, title, sub }) {
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

export function Badge({ children, variant = 'default' }) {
  const styles = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    purple: 'bg-violet-50 text-violet-700 border border-violet-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-xl border pointer-events-auto animate-in slide-in-from-right-2 ${
          t.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          t.type === 'error'   ? 'bg-rose-50 text-rose-800 border-rose-200' :
                                 'bg-white text-gray-800 border-gray-200'
        }`}>
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
            t.type === 'success' ? 'bg-emerald-200 text-emerald-700' : t.type === 'error' ? 'bg-rose-200 text-rose-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'i'}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, gradient, badge, badgeColor }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} shadow-sm`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
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

// ─── Sidebar Item ─────────────────────────────────────────────────────────────
export function SideItem({ icon, label, active, onClick, badge, collapsed }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-gray-100 text-gray-900 shadow-sm'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      } ${collapsed ? 'justify-center' : ''}`}
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
export function Table({ children }) {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}
export function Th({ children, right }) {
  return <th className={`px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 ${right ? 'text-right' : 'text-left'}`}>{children}</th>;
}
export function Td({ children, mono, muted }) {
  return <td className={`px-5 py-4 ${mono ? 'font-mono text-[11px]' : ''} ${muted ? 'text-gray-400' : 'text-gray-900'}`}>{children}</td>;
}

// ─── Search Input ─────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder }) {
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

export function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange} className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400 transition cursor-pointer">
      {children}
    </select>
  );
}

