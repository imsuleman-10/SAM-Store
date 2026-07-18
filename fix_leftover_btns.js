const fs = require('fs');
const path = require('path');

const tabsDir = 'app/admin/dashboard/tabs';

const replacements = {
  'UsersTab.js': [
    {
      regex: /<button onClick=\{\(\) => \{ setUsersLoading\(true\); fetch\('\/api\/admin\/users'\)\.then\(r => r\.json\(\)\)\.then\(d => setUsers\(d\.users \|\| \[\]\)\)\.finally\(\(\) => setUsersLoading\(false\)\); \}\}\n\s*className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all duration-150 shadow-sm">\n\s*<svg[^>]+>.*?<\/svg>\n\s*Refresh\n\s*<\/button>/s,
      replace: `<Btn onClick={() => { setUsersLoading(true); fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || [])).finally(() => setUsersLoading(false)); }} variant="secondary" size="sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                    Refresh
                  </Btn>`
    },
    {
      regex: /<button onClick=\{\(\) => handleBanUser\(u\.id, u\.banned \? 'unban' : 'ban'\)\}\n\s*className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1\.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 hover:border-rose-300 active:bg-rose-200 transition-all duration-150">\n\s*(.*?)\n\s*<\/button>/s,
      replace: `<Btn onClick={() => handleBanUser(u.id, u.banned ? 'unban' : 'ban')} variant="danger" size="sm">
                                  $1
                                </Btn>`
    }
  ],
  'SubscribersTab.js': [
    {
      regex: /<button onClick=\{\(\) => deleteSubscriber\(s\.email\)\}\n\s*className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1\.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 hover:border-rose-300 active:bg-rose-200 transition-all duration-150">\n\s*(.*?)\n\s*<\/button>/s,
      replace: `<Btn onClick={() => deleteSubscriber(s.email)} variant="danger" size="sm">
                                  $1
                                </Btn>`
    }
  ],
  'StaffTab.js': [
    {
      regex: /<button onClick=\{\(\) => handleManagerAction\(s\.id, 'reset'\)\}\n\s*className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1\.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all duration-150 shadow-sm">\n\s*(.*?)\n\s*<\/button>/s,
      replace: `<Btn onClick={() => handleManagerAction(s.id, 'reset')} variant="secondary" size="sm">
                                      $1
                                    </Btn>`
    },
    {
      regex: /<button onClick=\{\(\) => handleDeleteManager\(s\.id\)\}\n\s*className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1\.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 hover:border-rose-300 active:bg-rose-200 transition-all duration-150">\n\s*(.*?)\n\s*<\/button>/s,
      replace: `<Btn onClick={() => handleDeleteManager(s.id)} variant="danger" size="sm">
                                    $1
                                  </Btn>`
    }
  ],
  'ProductsTab.js': [
    {
      regex: /<button onClick=\{\(\) => \{ setEditingStockId\(p\.id\); setEditingStockVal\(String\(p\.stock\)\); \}\}\n\s*className=\{`font-bold px-2\.5 py-1 rounded-lg transition hover:bg-gray-100 cursor-pointer text-sm \$\{p\.stock === 0 \? 'text-rose-500' : p\.stock < 10 \? 'text-amber-500' : 'text-emerald-600'\}`\}\n\s*title="Click to edit stock">\{p\.stock\}<\/button>/s,
      replace: `<Btn onClick={() => { setEditingStockId(p.id); setEditingStockVal(String(p.stock)); }}
                                    variant="ghost" size="sm" className={\`\${p.stock === 0 ? '!text-rose-500' : p.stock < 10 ? '!text-amber-500' : '!text-emerald-600'}\`}
                                    title="Click to edit stock">{p.stock}</Btn>`
    }
  ],
  'OverviewTab.js': [
    {
      regex: /<button onClick=\{\(\) => setTab\('orders'\)\} className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition">View all →<\/button>/g,
      replace: `<Btn onClick={() => setTab('orders')} variant="ghost" size="sm" className="!text-gray-500 hover:!text-gray-900">View all →</Btn>`
    }
  ],
  'OrdersTab.js': [
    {
      regex: /<button onClick=\{\(\) => setExpandedOrder\(expandedOrder === o\.id \? null : o\.id\)\} className="text-left">\n\s*<span className="font-mono text-\[11px\] font-semibold text-gray-500">#\{o\.id\.slice\(0, 8\)\.toUpperCase\(\)\}<\/span>\n\s*<p className="text-\[10px\] text-gray-300 mt-0\.5">\{formatDate\(o\.created_at\)\}<\/p>\n\s*<\/button>/s,
      replace: `<button onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)} className="text-left rounded hover:bg-gray-100/50 p-1 -ml-1 transition-colors">
                                      <span className="font-mono text-[11px] font-semibold text-gray-500">#{o.id.slice(0, 8).toUpperCase()}</span>
                                      <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(o.created_at)}</p>
                                    </button>`
    },
    {
      regex: /<button onClick=\{\(\) => sendWhatsApp\(o\.customer_phone, `Hi \$\{o\.customer_name\}, your Glowvie order #\$\{o\.id\.slice\(0,8\)\.toUpperCase\(\)\} is \$\{o\.status\}\.`\)\}\n\s*className="text-emerald-600 hover:text-emerald-700 font-mono text-\[12px\] flex items-center gap-1 hover:underline">\n\s*<svg[^>]+>.*?<\/svg>\n\s*\{o\.customer_phone\}\n\s*<\/button>/s,
      replace: `<button onClick={() => sendWhatsApp(o.customer_phone, \`Hi \${o.customer_name}, your Glowvie order #\${o.id.slice(0,8).toUpperCase()} is \${o.status}.\`)}
                                      className="text-emerald-600 hover:text-emerald-700 font-mono text-[12px] flex items-center gap-1 hover:underline rounded p-0.5 -ml-0.5 transition-colors">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                      {o.customer_phone}
                                    </button>`
    }
  ],
  'MediaTab.js': [
    {
      regex: /<button key=\{f\.key\} onClick=\{\(\) => setMediaFilter\(f\.key\)\}\n\s*className=\{`rounded-xl px-4 py-2 text-sm font-medium transition-all \$\{mediaFilter === f\.key \? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'\}`\}>\n\s*\{f\.label\}\n\s*<\/button>/g,
      replace: `<Btn key={f.key} onClick={() => setMediaFilter(f.key)} variant={mediaFilter === f.key ? 'primary' : 'secondary'} size="md">
                        {f.label}
                      </Btn>`
    },
    {
      regex: /<button onClick=\{\(\) => deleteMediaItem\(realIdx\)\}\n\s*className="absolute right-2 top-2 rounded-full bg-rose-500 p-2 text-white opacity-0 shadow-lg transition group-hover:opacity-100 hover:bg-rose-600 hover:scale-110">\n\s*<svg[^>]+>.*?<\/svg>\n\s*<\/button>/s,
      replace: `<button onClick={(e) => { e.stopPropagation(); deleteMediaItem(realIdx); }}\n                                className="absolute right-2 top-2 rounded-full bg-rose-500 p-2 text-white opacity-0 shadow-lg transition-all hover:bg-rose-600 hover:scale-110 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1">\n                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>\n                              </button>`
    }
  ],
  'HeroSlidesTab.js': [
    {
      regex: /<button onClick=\{\(\) => downloadImage\(slide\.image \|\| slide\.image_url, `hero-slide-\$\{idx \+ 1\}\.png`\)\}\n\s*className="rounded-full bg-black\/30 p-2 text-white backdrop-blur-sm transition hover:bg-black\/50 hover:scale-110">\n\s*<svg[^>]+>.*?<\/svg>\n\s*<\/button>/s,
      replace: `<button onClick={(e) => { e.stopPropagation(); downloadImage(slide.image || slide.image_url, \`hero-slide-\${idx + 1}.png\`); }}\n                                        className="rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/50 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1">\n                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>\n                                      </button>`
    },
    {
      regex: /<button onClick=\{\(\) => deleteHeroSlide\(idx\)\}\n\s*className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1\.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 hover:border-rose-300 active:bg-rose-200 transition-all duration-150">\n\s*(.*?)\n\s*<\/button>/s,
      replace: `<Btn onClick={() => deleteHeroSlide(idx)} variant="danger" size="sm">
                                $1
                              </Btn>`
    }
  ]
};

let totalFixed = 0;
for (const [filename, rules] of Object.entries(replacements)) {
  const filePath = path.join(tabsDir, filename);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  const before = content;
  
  rules.forEach(r => {
    content = content.replace(r.regex, r.replace);
  });
  
  if (content !== before) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed remaining raw buttons in: ' + filename);
    totalFixed++;
  }
}
console.log('Total files cleaned up: ' + totalFixed);
