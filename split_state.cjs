const fs = require('fs');

const content = fs.readFileSync('app/admin/dashboard/page.js', 'utf8');
const lines = content.split('\n');

const dashboardStart = lines.findIndex(l => l.includes('export default function AdminDashboard() {'));
const renderStart = lines.findIndex(l => l.includes('// ─── Render'));

const logicLines = lines.slice(dashboardStart + 1, renderStart);

// Find all top-level declarations in logicLines
const exports = new Set();
for (let line of logicLines) {
  // match "const foo = " or "const [foo, setFoo] = " or "const { foo } = "
  let m = line.match(/^(?:export\s+)?(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=/);
  if (m) exports.add(m[1]);

  let m2 = line.match(/^(?:export\s+)?(?:const|let|var)\s+\[([^\]]+)\]\s*=/);
  if (m2) {
    m2[1].split(',').forEach(x => {
      const name = x.trim();
      if (name) exports.add(name);
    });
  }

  let m3 = line.match(/^(?:export\s+)?(?:const|let|var)\s+\{([^\}]+)\}\s*=/);
  if (m3) {
    m3[1].split(',').forEach(x => {
      // handle "foo: bar" -> "bar" or "foo"
      const parts = x.split(':');
      const name = parts[parts.length - 1].trim();
      if (name) exports.add(name);
    });
  }

  // match "function foo("
  let m4 = line.match(/^(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(/);
  if (m4) exports.add(m4[1]);
}

// Ensure addToast is exported if it exists, wait addToast is a state
const returnStatement = `\n  return {\n    ${Array.from(exports).join(',\n    ')}\n  };\n`;

const hookCode = `import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminState() {
${logicLines.join('\n')}
${returnStatement}
}
`;

fs.mkdirSync('app/admin/dashboard/components', { recursive: true });
fs.writeFileSync('app/admin/dashboard/components/useAdminState.js', hookCode);
console.log('Extracted useAdminState with', exports.size, 'exports.');
