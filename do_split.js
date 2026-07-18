const fs = require('fs');

const pageContent = fs.readFileSync('app/admin/dashboard/page.js', 'utf8');

// 1. Extract UI Primitives
const uiStart = pageContent.indexOf('// ─── Constants');
const uiEnd = pageContent.indexOf('// ─── Profile Tab');
let uiCode = pageContent.slice(uiStart, uiEnd);
// Export all functions and consts
uiCode = uiCode.replace(/^function /gm, 'export function ')
               .replace(/^const /gm, 'export const ');

fs.writeFileSync('app/admin/dashboard/components/UI.js', `import React from 'react';\nimport Link from 'next/link';\n\n` + uiCode);

// 2. Extract Profile Tab
const profileStart = pageContent.indexOf('// ─── Profile Tab');
const mainDashStart = pageContent.indexOf('// ─── Main Dashboard');
let profileCode = pageContent.slice(profileStart, mainDashStart);
profileCode = profileCode.replace('function ProfileTab', 'export function ProfileTab');
fs.writeFileSync('app/admin/dashboard/components/ProfileTab.js', `import React, { useState } from 'react';\nimport { Spinner } from './UI';\n\n` + profileCode);

// 3. Setup tabs folder
fs.mkdirSync('app/admin/dashboard/tabs', { recursive: true });

// Read the render section
const renderStart = pageContent.indexOf('// ─── Render');
const renderContent = pageContent.slice(renderStart);

function extractSection(marker) {
  const start = renderContent.indexOf(`{/* ── ${marker} ── */}`);
  if (start === -1) return null;
  // find next marker
  const nextMarkerRegex = /\{\/\* ── .*? ── \*\/\}/g;
  nextMarkerRegex.lastIndex = start + 1;
  const match = nextMarkerRegex.exec(renderContent);
  const end = match ? match.index : renderContent.length;
  return renderContent.slice(start, end).trim();
}

const tabs = ['Overview Tab', 'Orders Tab', 'Products Tab', 'Users Tab', 'Subscribers Tab', 'Staff Tab', 'Settings Tab', 'Hero Slides Tab', 'Media Tab'];

tabs.forEach(tab => {
  const code = extractSection(tab);
  if (!code) return;
  const tabName = tab.replace(' ', ''); // e.g. OverviewTab
  const fileContent = `import React from 'react';
import Link from 'next/link';
import { 
  Badge, EmptyState, Spinner, StatCard, Table, Th, Td, SearchInput, Select,
  COURIER_OPTIONS, CATEGORIES, STATUS_META
} from '../components/UI';

export default function ${tabName}({ state }) {
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
      ${code.replace(/^\{.*?\}$/m, '')} 
    </>
  );
}
`;
  // Clean up the top marker
  const cleaned = fileContent.replace(`{/* ── ${tab} ── */}`, '');
  fs.writeFileSync(`app/admin/dashboard/tabs/${tabName}.js`, cleaned);
});

console.log('Split completed.');
