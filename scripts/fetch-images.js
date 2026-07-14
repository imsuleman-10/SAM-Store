const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  try {
    // 1. DermiVe Wash
    const dermive = await fetchUrl('https://jenpharm.com/products/dermive-moisturizing-wash');
    const dermiveMatch = dermive.match(/<meta property="og:image" content="([^"]+)"/);
    console.log('DermiVe Image:', dermiveMatch ? dermiveMatch[1] : 'Not found');

    // 2. Roots Hair Treatment Serum (Often by Sukooon)
    const roots = await fetchUrl('https://sukooon.com/collections/hair-care');
    const rootsMatch = roots.match(/<img[^>]+src="([^"]+Roots[^"]+)"/i);
    console.log('Roots Serum Image:', rootsMatch ? rootsMatch[1] : 'Not found');

    // 3. Markaway Stretch Mark Serum
    const markaway = await fetchUrl('https://shopizem.com/products/markaway-stretch-mark-serum');
    const markawayMatch = markaway.match(/<meta property="og:image" content="([^"]+)"/);
    console.log('Markaway Image:', markawayMatch ? markawayMatch[1] : 'Not found');

  } catch(e) {
    console.error(e);
  }
}

run();
