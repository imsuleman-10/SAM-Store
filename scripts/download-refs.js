const fs = require('fs');
const https = require('https');
const path = require('path');

const targets = [
  {
    name: 'dermive',
    url: 'https://aakirxxeskfynblmgwzf.supabase.co/storage/v1/object/public/images/products/1784031104998-product-image-5.webp'
  },
  {
    name: 'roots',
    url: 'https://aakirxxeskfynblmgwzf.supabase.co/storage/v1/object/public/images/products/1784031426146-hair4.webp'
  },
  {
    name: 'relax',
    url: 'https://aakirxxeskfynblmgwzf.supabase.co/storage/v1/object/public/images/products/1784031515265-product-image-3%20(1).webp'
  },
  {
    name: 'markaway',
    url: 'https://aakirxxeskfynblmgwzf.supabase.co/storage/v1/object/public/images/products/1784031612660-product-image-3%20(2).webp'
  },
  {
    name: 'zafrani',
    url: 'https://aakirxxeskfynblmgwzf.supabase.co/storage/v1/object/public/images/products/1784031651850-product-image-2%20(3).webp'
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function run() {
  const dir = path.join(__dirname, '..', 'public', 'images', 'temp_refs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const t of targets) {
    const p = path.join(dir, `${t.name}.webp`);
    try {
      await download(t.url, p);
      console.log(`Downloaded ${t.name} to ${p}`);
    } catch(e) {
      console.error(e);
    }
  }
}
run();
