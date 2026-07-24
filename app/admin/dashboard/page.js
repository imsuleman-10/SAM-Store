'use client';

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
import MediaTab from './tabs/MediaTab';

import { ProfileTab } from './components/ProfileTab';

export default function AdminDashboard() {
  const state = useAdminState();

  if (!state || !state.isMounted) return null;

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
                {/\.(mp4|webm|ogg|mov)$/i.test(state.selectedMedia.url) ? (
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
