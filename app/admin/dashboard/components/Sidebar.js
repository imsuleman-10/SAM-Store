import React from 'react';
import { SideItem } from './UI';

const SIDEBAR_ITEMS = [
  { key: 'overview', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>, label: 'Overview' },
  { key: 'orders', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>, label: 'Orders' },
  { key: 'products', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>, label: 'Products' },
  { key: 'users', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>, label: 'Users' },
  { key: 'subscribers', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: 'Subscribers' },
  { key: 'staff', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label: 'Staff' },
  { key: 'hero', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: 'Hero Banner' },
  { key: 'media', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, label: 'Media Library' },
  { key: 'settings', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>, label: 'Settings' },
];

export function Sidebar({ state }) {
  const { collapsed, setCollapsed, storeLogo, tab, setTab, handleLogout } = state;
  return (
    <>
      
      <aside className={`flex flex-col bg-white border-r border-gray-100 transition-all duration-300 shrink-0 shadow-sm ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}>
        {/* Brand */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={`flex h-16 w-full items-center border-b border-gray-100 px-4 hover:bg-gray-50 transition ${collapsed ? 'justify-center' : 'gap-3'}`}
          title="Toggle sidebar"
        >
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm overflow-hidden ${storeLogo ? 'bg-white border border-gray-100' : 'bg-gray-900'}`}>
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
            className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition text-sm font-medium ${collapsed ? 'justify-center px-0' : 'px-3'}`}
            title="Logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="shrink-0"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
