// Script to upload before/after result images to Supabase Storage
// Run with: node scripts/upload-results.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE env vars in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = 'images';

const IMAGES = [
  {
    localPath: 'C:\\Users\\Suleman Mughal\\.gemini\\antigravity-ide\\brain\\e213cabc-9e3c-44d0-9277-d2e531060505\\dermive_before_1784280884872.png',
    storagePath: 'results/dermive-before.png',
    key: 'dermive_before',
  },
  {
    localPath: 'C:\\Users\\Suleman Mughal\\.gemini\\antigravity-ide\\brain\\e213cabc-9e3c-44d0-9277-d2e531060505\\dermive_after_1784280933418.png',
    storagePath: 'results/dermive-after.png',
    key: 'dermive_after',
  },
  {
    localPath: 'C:\\Users\\Suleman Mughal\\.gemini\\antigravity-ide\\brain\\e213cabc-9e3c-44d0-9277-d2e531060505\\roots_before_1784280955687.png',
    storagePath: 'results/roots-before.png',
    key: 'roots_before',
  },
  {
    localPath: 'C:\\Users\\Suleman Mughal\\.gemini\\antigravity-ide\\brain\\e213cabc-9e3c-44d0-9277-d2e531060505\\roots_after_1784281059990.png',
    storagePath: 'results/roots-after.png',
    key: 'roots_after',
  },
  {
    localPath: 'C:\\Users\\Suleman Mughal\\.gemini\\antigravity-ide\\brain\\e213cabc-9e3c-44d0-9277-d2e531060505\\markaway_before_1784281120720.png',
    storagePath: 'results/markaway-before.png',
    key: 'markaway_before',
  },
  {
    localPath: 'C:\\Users\\Suleman Mughal\\.gemini\\antigravity-ide\\brain\\e213cabc-9e3c-44d0-9277-d2e531060505\\markaway_after_1784281208663.png',
    storagePath: 'results/markaway-after.png',
    key: 'markaway_after',
  },
];

async function uploadAll() {
  const urls = {};

  for (const img of IMAGES) {
    console.log(`Uploading ${img.key}...`);

    if (!fs.existsSync(img.localPath)) {
      console.error(`  File not found: ${img.localPath}`);
      continue;
    }

    const buffer = fs.readFileSync(img.localPath);

    // Remove existing file if present (upsert)
    await supabase.storage.from(BUCKET).remove([img.storagePath]);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(img.storagePath, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.error(`  Error uploading ${img.key}:`, error.message);
      continue;
    }

    const { data: publicData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(img.storagePath);

    urls[img.key] = publicData.publicUrl;
    console.log(`  ✓ ${img.key}: ${publicData.publicUrl}`);
  }

  console.log('\n=== UPLOAD COMPLETE ===\n');
  console.log('URLs:');
  Object.entries(urls).forEach(([k, v]) => console.log(`  ${k}: "${v}"`));
  console.log('\nCopy these URLs into RESULTS array in app/page.js');

  // Write URLs to a temp file for easy copy
  fs.writeFileSync(
    path.join(__dirname, 'result-urls.json'),
    JSON.stringify(urls, null, 2)
  );
  console.log('\nURLs saved to scripts/result-urls.json');
}

uploadAll().catch(console.error);
