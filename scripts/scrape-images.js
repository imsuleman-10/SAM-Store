const https = require('https');
const http = require('http');

function fetchUrl(url) {
  const lib = url.startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    const options = { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } };
    const req = lib.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) { const u = new URL(url); loc = u.origin + loc; }
        return fetchUrl(loc).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function findCdnImages(html, domain) {
  // Extract all shopify CDN image URLs
  const r1 = [...html.matchAll(/https?:\/\/cdn\.shopify\.com\/s\/files\/[^\s"'<>]+\.(jpg|png|webp|jpeg)/gi)].map(m => m[0]);
  const r2 = [...html.matchAll(new RegExp(`https?://${domain}/cdn/shop[^\s"'<>]+\\.(jpg|png|webp|jpeg)`, 'gi'))].map(m => m[0]);
  const r3 = [...html.matchAll(/https?:\/\/[^\s"'<>]+\.(jpg|png|webp|jpeg)/gi)].map(m => m[0]).filter(u => !u.includes('logo') && !u.includes('icon') && !u.includes('banner'));
  const all = [...new Set([...r1, ...r2])];
  // Filter out logo/icon/banner patterns
  return all.filter(u => !u.includes('logo') && !u.includes('icon') && !u.includes('banner') && !u.includes('LOGO')).slice(0, 5);
}

async function run() {
  const checks = [
    {
      label: '3. Relax Vit C Serum 30ml',
      urls: [
        'https://shopizem.com/products/relax-vitamin-c-serum',
        'https://relaxfc.com/product/relax-vitamin-c-serum',
        'https://relaxfc.com/product/vitamin-c-serum',
        'https://action.pk/search?type=product&q=relax+vitamin+c+serum',
      ]
    },
    {
      label: '5. Zafrani Beauty Cream',
      urls: [
        'https://zafrani.store/products/beauty-cream',
        'https://zafrani.store/',
        'https://shopizem.com/products/zafrani-beauty-cream',
        'https://cosmeticaqueen.com/products/zafrani-beauty-cream',
      ]
    },
  ];

  for (const item of checks) {
    console.log(`\n=== ${item.label} ===`);
    for (const url of item.urls) {
      try {
        const html = await fetchUrl(url);
        const u = new URL(url);
        const imgs = findCdnImages(html, u.hostname);
        if (imgs.length > 0) {
          console.log(`  Found at ${url}:`);
          imgs.forEach(i => console.log('  ', i));
          break;
        } else {
          console.log(`  No product images found at ${url}`);
        }
      } catch(e) {
        console.log(`  Error: ${url} - ${e.message}`);
      }
    }
  }
}

run();
