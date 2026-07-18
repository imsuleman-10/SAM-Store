const fs = require('fs');

const pageContent = fs.readFileSync('app/admin/dashboard/page.js', 'utf8');

function extractSection(marker) {
  const start = pageContent.indexOf(`{/* ── ${marker} ── */}`);
  if (start === -1) return null;
  const nextMarkerRegex = /\{\/\* ── .*? ── \*\/\}/g;
  nextMarkerRegex.lastIndex = start + 1;
  const match = nextMarkerRegex.exec(pageContent);
  const end = match ? match.index : pageContent.length;
  return pageContent.slice(start, end).trim();
}

const sidebarCode = extractSection('Sidebar');
fs.writeFileSync('app/admin/dashboard/components/Sidebar.js', `import React from 'react';
import { SideItem } from './UI';

const SIDEBAR_ITEMS = [
  { key: 'overview', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>, label: 'Overview' },
  { key: 'orders', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>, label: 'Orders' },
  { key: 'products', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>, label: 'Products' },
  { key: 'users', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>, label: 'Users' },
  { key: 'subscribers', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: 'Subscribers' },
  { key: 'staff', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label: 'Staff' },
  { key: 'hero', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: 'Hero Slides' },
  { key: 'media', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, label: 'Media Library' },
  { key: 'settings', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>, label: 'Settings' },
];

export function Sidebar({ state }) {
  const { collapsed, setCollapsed, storeLogo, tab, setTab, handleLogout } = state;
  return (
    <>
      ${sidebarCode.replace('{/* ── Sidebar ── */}', '')}
    </>
  );
}
`);

const headerCode = extractSection('Top Header');
fs.writeFileSync('app/admin/dashboard/components/TopHeader.js', `import React from 'react';
import Link from 'next/link';

const SIDEBAR_ITEMS = [
  { key: 'overview', label: 'Overview' },
  { key: 'orders', label: 'Orders' },
  { key: 'products', label: 'Products' },
  { key: 'users', label: 'Users' },
  { key: 'subscribers', label: 'Subscribers' },
  { key: 'staff', label: 'Staff' },
  { key: 'hero', label: 'Hero Slides' },
  { key: 'media', label: 'Media Library' },
  { key: 'settings', label: 'Settings' },
];

export function TopHeader({ state }) {
  const { 
    tab, analytics, globalRef, globalSearch, setGlobalSearch, setShowGlobal, showGlobal, 
    globalResults, setTab, me 
  } = state;
  
  return (
    <>
      ${headerCode.replace('{/* ── Top Header ── */}', '')}
    </>
  );
}
`);

const finalPage = `'use client';

import React from 'react';
import { useAdminState } from './components/useAdminState';
import { Toast } from './components/UI';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';

// Tabs
import OverviewTab from './tabs/OverviewTab';
import OrdersTab from './tabs/OrdersTab';
import ProductsTab from './tabs/ProductsTab';
import UsersTab from './tabs/UsersTab';
import SubscribersTab from './tabs/SubscribersTab';
import StaffTab from './tabs/StaffTab';
import SettingsTab from './tabs/SettingsTab';
import HeroSlidesTab from './tabs/HeroSlidesTab';
import MediaTab from './tabs/MediaTab';
import { ProfileTab } from './components/ProfileTab';

export default function AdminDashboard() {
  const state = useAdminState();

  if (!state) return null;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
      <Toast toasts={state.toasts || []} />
      
      <Sidebar state={state} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader state={state} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-6 py-8">
            {state.tab === 'overview' && <OverviewTab state={state} />}
            {state.tab === 'orders' && <OrdersTab state={state} />}
            {state.tab === 'products' && <ProductsTab state={state} />}
            {state.tab === 'users' && <UsersTab state={state} />}
            {state.tab === 'subscribers' && <SubscribersTab state={state} />}
            {state.tab === 'staff' && <StaffTab state={state} />}
            {state.tab === 'settings' && <SettingsTab state={state} />}
            {state.tab === 'hero' && <HeroSlidesTab state={state} />}
            {state.tab === 'media' && <MediaTab state={state} />}
            {state.tab === 'profile' && <ProfileTab me={state.me} setMe={state.setMe} addToast={state.addToast} />}
          </div>
        </main>
      </div>

      {/* Media Detail Modal */}
      {state.selectedMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => state.setSelectedMedia(null)}>
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-base font-bold text-gray-900">Media Details</h3>
              <button onClick={() => state.setSelectedMedia(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-5">
              <div className="rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden min-h-[160px]">
                {/\\.(mp4|webm|ogg|mov)$/i.test(state.selectedMedia.url) ? (
                  <video src={state.selectedMedia.url} className="max-h-60 w-full" controls />
                ) : (
                  <img src={state.selectedMedia.url} className="max-h-60 object-contain" alt="" />
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">File Name</p>
                  <p className="text-sm font-medium text-gray-800 break-all">{state.selectedMedia.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Direct URL</p>
                  <div className="flex items-center gap-2">
                    <input type="text" readOnly value={state.selectedMedia.url} className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 outline-none" />
                    <button onClick={() => { if (navigator?.clipboard) { navigator.clipboard.writeText(state.selectedMedia.url); state.addToast('URL copied!', 'success'); } else { prompt('Copy URL:', state.selectedMedia.url); } }}
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

fs.writeFileSync('app/admin/dashboard/page.js', finalPage);

console.log('Layout split completed and page.js rewritten.');
