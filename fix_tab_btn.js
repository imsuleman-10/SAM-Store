const fs = require('fs');
const path = require('path');

const tabsDir = 'app/admin/dashboard/tabs';
const tabs = fs.readdirSync(tabsDir);

// Update imports to add Btn
const oldImport = `import { 
  Badge, EmptyState, Spinner, StatCard, Table, Th, Td, SearchInput, Select,
  COURIER_OPTIONS, CATEGORIES, STATUS_META,
  formatCurrency, formatDate, cleanItems, getTrackingMeta, sendWhatsApp
} from '../components/UI';`;

const newImport = `import { 
  Badge, EmptyState, Spinner, StatCard, Table, Th, Td, SearchInput, Select,
  COURIER_OPTIONS, CATEGORIES, STATUS_META, Btn,
  formatCurrency, formatDate, cleanItems, getTrackingMeta, sendWhatsApp
} from '../components/UI';`;

// Replace raw action-button patterns with Btn component
function fixButtons(content) {
  // Reset / secondary buttons
  content = content.replace(
    /className="rounded-xl border border-gray-200 px-3\.5 py-2\.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"/g,
    'className=""'
  );

  // Table action buttons - Details/View
  content = content.replace(
    /<button\s+onClick=\{([^}]+setExpandedOrder[^}]*)\}\s+className="rounded-lg border border-gray-200 bg-white px-2\.5 py-1\.5 text-\[10px\] font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm">/g,
    '<Btn onClick={() => $1} variant="secondary" size="sm">'
  );

  // Email buttons
  content = content.replace(
    /className="rounded-lg border border-blue-200 bg-blue-50 px-2\.5 py-1\.5 text-\[10px\] font-medium text-blue-600 hover:bg-blue-100 transition shadow-sm"/g,
    'className=""'
  );

  // Print buttons
  content = content.replace(
    /className="rounded-lg border border-gray-200 bg-white px-2\.5 py-1\.5 text-\[10px\] font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm"/g,
    'className=""'
  );

  // Delete buttons
  content = content.replace(
    /className="rounded-lg border border-rose-200 bg-rose-50 px-2\.5 py-1\.5 text-\[10px\] font-semibold text-rose-600 hover:bg-rose-100 transition shadow-sm"/g,
    'className=""'
  );

  return content;
}

let fixed = 0;
tabs.forEach(tab => {
  const filePath = path.join(tabsDir, tab);
  let content = fs.readFileSync(filePath, 'utf8');
  const before = content;
  if (content.includes(oldImport)) {
    content = content.replace(oldImport, newImport);
    fixed++;
  }
  if (content !== before) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed imports: ' + tab);
  } else {
    console.log('Skipped: ' + tab);
  }
});

console.log('\nDone importing Btn in ' + fixed + ' files.');
