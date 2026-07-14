const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const products = [
  {
    name: 'dermive',
    // Official Jenpharm CDN image (found from jenpharm.com og:image)
    url: 'https://cdn.shopify.com/s/files/1/0288/8459/8844/files/b-a-images-680x690_1_3c09a699-7b6e-441d-977b-07e64d3be10d.jpg?v=1781511238',
    file: 'dermive_wash_authentic.jpg'
  },
  {
    name: 'roots',
    // ChemistDirect CDN image
    url: 'http://chemistdirect.pk/cdn/shop/files/WhatsApp_Image_2021-07-15_at_12.10.54_PM_5ce476bf-2767-40cf-9259-6c6e6d8787ea.jpg?v=1701683481',
    file: 'roots_serum_authentic.jpg'
  },
  {
    name: 'markaway',
    // Shopizem CDN image
    url: 'http://shopizem.com/cdn/shop/files/WhatsApp_Image_2024-03-16_at_2.23.58_PM_1.jpg?v=1711742919',
    file: 'markaway_serum_authentic.jpg'
  },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        const size = fs.statSync(dest).size;
        console.log(`Downloaded ${path.basename(dest)}: ${size} bytes`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function run() {
  const dir = path.join(__dirname, '..', 'public', 'images', 'products');
  for (const p of products) {
    const dest = path.join(dir, p.file);
    try {
      await download(p.url, dest);
    } catch(e) {
      console.error(`Failed ${p.name}:`, e.message);
    }
  }
  console.log('\nDone!');
}

run();
