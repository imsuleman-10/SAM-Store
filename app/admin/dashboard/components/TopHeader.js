import React from 'react';
import Link from 'next/link';

const SIDEBAR_ITEMS = [
  { key: 'overview', label: 'Overview' },
  { key: 'orders', label: 'Orders' },
  { key: 'products', label: 'Products' },
  { key: 'users', label: 'Users' },
  { key: 'subscribers', label: 'Subscribers' },
  { key: 'staff', label: 'Staff' },
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
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold uppercase ${r.type === 'order' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{r.type === 'order' ? 'O' : 'P'}</span>
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
    </>
  );
}
