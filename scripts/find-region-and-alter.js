const { Client } = require('pg');

const regions = [
  'ap-southeast-1', // Singapore (very common in Pakistan/Asia)
  'ap-south-1',     // Mumbai (also very common)
  'us-east-1',      // N. Virginia (default)
  'eu-central-1',   // Frankfurt
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'sa-east-1',
  'ca-central-1'
];

async function tryRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const connectionString = `postgres://postgres.aakirxxeskfynblmgwzf:Mughal123@@${host}:5432/postgres`;
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000 // 5 seconds timeout
  });

  try {
    await client.connect();
    console.log(`Successfully connected to region: ${region}`);
    
    // Run the migration
    const query = `
      ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier_company text;
      ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_id text;
    `;
    await client.query(query);
    console.log(`Successfully added courier_company and tracking_id columns!`);
    
    await client.end();
    return true;
  } catch (err) {
    // console.log(`Region ${region} failed:`, err.message);
    try { await client.end(); } catch (e) {}
    return false;
  }
}

async function run() {
  console.log('Finding correct Supabase region...');
  for (const region of regions) {
    const success = await tryRegion(region);
    if (success) {
      console.log(`Success! Database updated using region ${region}.`);
      return;
    }
  }
  console.log('Could not connect to any regional pooler.');
}

run();
