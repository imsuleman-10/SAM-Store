const fs = require('fs');

// Fix all remaining raw button patterns in tabs
const tabsDir = 'app/admin/dashboard/tabs';
const tabs = fs.readdirSync(tabsDir);

const replacements = [
  // Generic rose danger buttons
  [
    /className="rounded-lg border border-rose-200 bg-rose-50 px-[\d.]+\s+py-[\d.]+\s+text-\[[\dx]+\]\s+font-\w+\s+text-rose-\d+\s+hover:bg-rose-\d+\s+transition"/g,
    'className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 hover:border-rose-300 active:bg-rose-200 transition-all duration-150"'
  ],
  // Generic blue info buttons 
  [
    /className="rounded-lg border border-blue-200 bg-blue-50 px-[\d.]+\s+py-[\d.]+\s+text-\[[\dx]+\]\s+font-\w+\s+text-blue-\d+\s+hover:bg-blue-\d+\s+transition"/g,
    'className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 hover:border-blue-300 active:bg-blue-200 transition-all duration-150"'
  ],
  // Generic gray secondary buttons (table action style)
  [
    /className="rounded-lg border border-gray-200 bg-white px-[\d.]+\s+py-[\d.]+\s+text-\[[\dx]+\]\s+font-\w+\s+text-gray-\d+\s+hover:bg-gray-\d+\s+transition(?:\s+shadow-sm)?"/g,
    'className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all duration-150 shadow-sm"'
  ],
  // btn btn-primary
  [
    /className="btn btn-primary[^"]*"/g,
    'className="inline-flex items-center gap-1.5 rounded-lg border border-gray-900 bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-gray-700 active:bg-gray-800 transition-all duration-150"'
  ],
  // Large Save/primary style buttons
  [
    /className="btn btn-primary py-3 w-full justify-center text-base shadow-lg shadow-primary\/20"/g,
    'className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-900 bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 active:bg-gray-800 transition-all duration-150"'
  ],
  // Reset/filter buttons in toolbar
  [
    /className="rounded-xl border border-gray-200 px-3\.5 py-2\.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"/g,
    'className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all duration-150 shadow-sm"'
  ],
  // Export CSV / similar outline secondary buttons
  [
    /className="flex items-center gap-[\d.]+ rounded-xl border border-gray-200 bg-white px-3\.5 py-2\.5 text-xs font-medium text-gray-600 hover:bg-gray[^"]+"/g,
    'className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all duration-150 shadow-sm"'
  ],
];

let totalFixed = 0;
tabs.forEach(tab => {
  const filePath = tabsDir + '/' + tab;
  let content = fs.readFileSync(filePath, 'utf8');
  const before = content;
  replacements.forEach(([pattern, replacement]) => {
    content = content.replace(pattern, replacement);
  });
  if (content !== before) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed: ' + tab);
    totalFixed++;
  } else {
    console.log('No changes: ' + tab);
  }
});
console.log('\nTotal files changed: ' + totalFixed);
