import React, { useState } from 'react';
import HeroTab from './HeroTab';
import VideosTab from './VideosTab';
import ResultsTab from './ResultsTab';

export default function CustomizeTab({ state }) {
  const [activeSubTab, setActiveSubTab] = useState('hero');

  const tabs = [
    { id: 'hero', label: 'Hero Banner' },
    { id: 'videos', label: 'Videos' },
    { id: 'results', label: 'Results' }
  ];

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Customize Home Page</h2>
        <p className="text-sm text-gray-400 mt-1">Manage the content that appears on your store's home page.</p>
      </div>

      <div className="mb-6 flex space-x-1 rounded-xl bg-gray-100 p-1 w-full max-w-md">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              activeSubTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {/* We override state.tab to fool the sub-tabs into thinking they are the active tab, just in case they check it */}
        {activeSubTab === 'hero' && <HeroTab state={{...state, tab: 'hero'}} />}
        {activeSubTab === 'videos' && <VideosTab state={{...state, tab: 'videos'}} />}
        {activeSubTab === 'results' && <ResultsTab state={{...state, tab: 'results'}} />}
      </div>
    </div>
  );
}
