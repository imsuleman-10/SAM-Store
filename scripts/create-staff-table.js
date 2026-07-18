const { Client } = require('pg');

async function run() {
  // URL-encode the @ in the password
  const password = encodeURIComponent('Mughal123@');
  const regions = ['ap-southeast-1', 'ap-south-1', 'us-east-1'];

  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connectionString = `postgres://postgres.aakirxxeskfynblmgwzf:${password}@${host}:6543/postgres?pgbouncer=true`;

    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    try {
      await client.connect();
      console.log(`Connected via region: ${region}`);

      const query = `
        CREATE TABLE IF NOT EXISTS public.staff (
          id uuid primary key default gen_random_uuid(),
          email text unique not null,
          password_hash text not null,
          name text default '',
          avatar_url text default '',
          first_login boolean default true,
          created_at timestamptz default now(),
          updated_at timestamptz default now()
        );
        ALTER TABLE public.staff DISABLE ROW LEVEL SECURITY;
      `;

      await client.query(query);
      console.log('Successfully created staff table.');
      await client.end();
      return;
    } catch (err) {
      console.log(`Region ${region} failed: ${err.message}`);
      try { await client.end(); } catch (e) {}
    }
  }

  console.log('Could not create staff table via direct connection.');
  console.log('Please run this SQL in your Supabase SQL Editor:');
  console.log(`
CREATE TABLE IF NOT EXISTS public.staff (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text default '',
  avatar_url text default '',
  first_login boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
ALTER TABLE public.staff DISABLE ROW LEVEL SECURITY;
  `);
}

run();
