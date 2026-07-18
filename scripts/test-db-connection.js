const dns = require('dns');

const regions = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-south-1',
  'sa-east-1',
  'ca-central-1'
];

async function checkHost(host) {
  return new Promise((resolve) => {
    dns.lookup(host, (err, address) => {
      if (err) {
        resolve({ host, success: false });
      } else {
        resolve({ host, success: true, address });
      }
    });
  });
}

async function run() {
  const ref = 'aakirxxeskfynblmgwzf';
  
  // Try direct host
  console.log('Checking direct host...');
  const directResult = await checkHost(`db.${ref}.supabase.co`);
  if (directResult.success) {
    console.log(`Found direct host: ${directResult.host} -> ${directResult.address}`);
    return;
  }
  
  console.log('Checking pooler hosts across regions...');
  const promises = regions.map(region => {
    const host = `aws-0-${region}.pooler.supabase.com`;
    return checkHost(host);
  });
  
  const results = await Promise.all(promises);
  const active = results.filter(r => r.success);
  
  if (active.length > 0) {
    console.log('Active pooler hosts found:');
    active.forEach(a => console.log(`- ${a.host} (${a.address})`));
  } else {
    console.log('No pooler hosts could be resolved.');
  }
}

run();
