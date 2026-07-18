const fs = require('fs');
const path = require('path');

const tabsDir = 'app/admin/dashboard/tabs';
const tabs = fs.readdirSync(tabsDir);

const replacements = [
  // Primary (sm)
  {
    regex: /<button([^>]+)className="inline-flex items-center gap-1\.5 rounded-lg border border-gray-900 bg-gray-900 px-3 py-1\.5 text-xs font-medium text-white shadow-sm hover:bg-gray-700 active:bg-gray-800 transition-all duration-150"[^>]*>([\s\S]*?)<\/button>/g,
    replace: '<Btn$1variant="primary" size="sm">$2</Btn>'
  },
  // Primary (lg, full width)
  {
    regex: /<button([^>]+)className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-900 bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 active:bg-gray-800 transition-all duration-150"[^>]*>([\s\S]*?)<\/button>/g,
    replace: '<Btn$1variant="primary" size="lg" className="w-full">$2</Btn>'
  },
  // Danger (sm)
  {
    regex: /<button([^>]+)className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1\.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 hover:border-rose-300 active:bg-rose-200 transition-all duration-150"[^>]*>([\s\S]*?)<\/button>/g,
    replace: '<Btn$1variant="danger" size="sm">$2</Btn>'
  },
  // Info (sm)
  {
    regex: /<button([^>]+)className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1\.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 hover:border-blue-300 active:bg-blue-200 transition-all duration-150"[^>]*>([\s\S]*?)<\/button>/g,
    replace: '<Btn$1variant="info" size="sm">$2</Btn>'
  },
  // Secondary (sm, variant 1)
  {
    regex: /<button([^>]+)className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1\.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all duration-150 shadow-sm"[^>]*>([\s\S]*?)<\/button>/g,
    replace: '<Btn$1variant="secondary" size="sm">$2</Btn>'
  },
  // Secondary (sm, variant 2)
  {
    regex: /<button([^>]+)className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1\.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all duration-150 shadow-sm"[^>]*>([\s\S]*?)<\/button>/g,
    replace: '<Btn$1variant="secondary" size="sm">$2</Btn>'
  },
  // Secondary (sm, variant 3)
  {
    regex: /<button([^>]+)className="inline-flex items-center gap-1\.5 rounded-lg border border-gray-200 bg-white px-3 py-1\.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all duration-150 shadow-sm"[^>]*>([\s\S]*?)<\/button>/g,
    replace: '<Btn$1variant="secondary" size="sm">$2</Btn>'
  }
];

let totalFixed = 0;
tabs.forEach(tab => {
  const filePath = path.join(tabsDir, tab);
  let content = fs.readFileSync(filePath, 'utf8');
  const before = content;
  
  replacements.forEach(r => {
    content = content.replace(r.regex, r.replace);
  });
  
  if (content !== before) {
    fs.writeFileSync(filePath, content);
    console.log('Migrated to <Btn>: ' + tab);
    totalFixed++;
  }
});
console.log('Total files migrated to <Btn>: ' + totalFixed);
