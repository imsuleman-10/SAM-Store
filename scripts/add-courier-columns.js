const { Client } = require('pg');

async function run() {
  const connectionString = 'postgres://postgres:Mughal123@@db.aakirxxeskfynblmgwzf.supabase.co:5432/postgres';
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    console.log('Connected to PostgreSQL...');
    
    const query = `
      ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier_company text;
      ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_id text;
    `;
    
    await client.query(query);
    console.log('Successfully added courier_company and tracking_id columns to orders table.');
  } catch (err) {
    console.error('Error altering table:', err);
  } finally {
    await client.end();
  }
}

run();
