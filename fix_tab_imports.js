const fs = require('fs');
const path = require('path');

const tabsDir = 'app/admin/dashboard/tabs';
const tabs = fs.readdirSync(tabsDir);

const oldImport = `import { 
  Badge, EmptyState, Spinner, StatCard, Table, Th, Td, SearchInput, Select,
  COURIER_OPTIONS, CATEGORIES, STATUS_META
} from '../components/UI';`;

const newImport = `import { 
  Badge, EmptyState, Spinner, StatCard, Table, Th, Td, SearchInput, Select,
  COURIER_OPTIONS, CATEGORIES, STATUS_META,
  formatCurrency, formatDate, cleanItems, getTrackingMeta, sendWhatsApp
} from '../components/UI';`;

let fixed = 0;
tabs.forEach(tab => {
  const filePath = path.join(tabsDir, tab);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(oldImport)) {
    content = content.replace(oldImport, newImport);
    fs.writeFileSync(filePath, content);
    console.log('Fixed: ' + tab);
    fixed++;
  } else {
    console.log('Skipped (no match): ' + tab);
  }
});

console.log('\nDone. Fixed ' + fixed + ' files.');
