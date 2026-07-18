import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminSession } from '@/lib/authHelper';

// All folders and buckets we track in the media library
const FOLDERS = [
  // New separated buckets
  { bucket: 'products',    folder: '', category: 'product' },
  { bucket: 'hero_slides', folder: '', category: 'hero' },
  { bucket: 'staffs',      folder: '', category: 'staff' },
  { bucket: 'customers',   folder: '', category: 'customer' },
  { bucket: 'admin',       folder: '', category: 'admin' },
  // Legacy paths
  { bucket: 'images', folder: 'products',    category: 'product'    },
  { bucket: 'images', folder: 'hero_slides', category: 'hero' },
  { bucket: 'images', folder: 'staff',       category: 'staff'      },
  { bucket: 'images', folder: 'customers',   category: 'customer'   },
  { bucket: 'images', folder: 'admin',       category: 'admin'      },
  { bucket: 'videos', folder: 'products',    category: 'product'    },
];

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  // Fetch all folders in parallel
  const folderResults = await Promise.all(
    FOLDERS.map(({ bucket, folder }) =>
      supabaseAdmin.storage.from(bucket).list(folder, {
        limit: 200,
        sortBy: { column: 'created_at', order: 'desc' },
      })
    )
  );

  const storageImages = [];
  folderResults.forEach((res, i) => {
    const { bucket, folder, category } = FOLDERS[i];
    (res.data || [])
      .filter(f => {
        // filter out the '.emptyFolderPlaceholder' file if it exists
        if (f.name === '.emptyFolderPlaceholder') return false;
        // some files might not have mimetype, accept them if they have valid extensions
        const mime = f.metadata?.mimetype || '';
        return mime.startsWith('image/') || mime.startsWith('video/') || f.name.match(/\.(mp4|jpg|jpeg|png|gif|webp)$/i);
      })
      .forEach(f => {
        const path = folder ? `${folder}/${f.name}` : f.name;
        storageImages.push({
          name: f.name,
          folder,
          bucket,
          category,
          url: supabaseAdmin.storage.from(bucket).getPublicUrl(path).data.publicUrl,
          created_at: f.created_at,
          source: 'storage',
        });
      });
  });

  storageImages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Fetch external/legacy URLs from DB (products, hero slides, logo)
  const [productsRes, heroRes, settingsRes] = await Promise.all([
    supabaseAdmin.from('products').select('image_url, media_urls'),
    supabaseAdmin.from('hero_slides').select('image_url'),
    supabaseAdmin.from('store_settings').select('settings_value').eq('settings_key', 'store_logo').single(),
  ]);

  const dbImagesMap = new Map();
  const addExternal = (url, category) => {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) return;
    if (dbImagesMap.has(url)) return;
    if (storageImages.some(si => si.url === url)) return;
    dbImagesMap.set(url, { name: url, folder: 'external', bucket: 'none', category, url, created_at: new Date(0).toISOString(), source: 'external' });
  };

  (productsRes.data || []).forEach(p => {
    addExternal(p.image_url, 'product');
    (p.media_urls || []).forEach(u => addExternal(u, 'product'));
  });
  (heroRes.data || []).forEach(h => addExternal(h.image_url, 'hero'));
  if (settingsRes.data?.settings_value) addExternal(settingsRes.data.settings_value, 'admin');

  return NextResponse.json({ images: [...storageImages, ...Array.from(dbImagesMap.values())] });
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  const formData = await request.formData();
  const file = formData.get('image');
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'Image file required.' }, { status: 400 });

  // Caller must pass 'folder' to specify destination; default to 'admin'
  const folder = formData.get('folder') || 'admin';
  const targetBucket = ['products', 'hero_slides', 'staffs', 'customers', 'admin'].includes(folder) ? folder : 'images';
  const targetFolder = targetBucket === 'images' ? folder : ''; // Use root for the new buckets

  const filename = `${Date.now()}-${(file.name || 'image.jpg').replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
  const path = targetFolder ? `${targetFolder}/${filename}` : filename;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage.from(targetBucket).upload(path, buffer, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  });
  if (error) return NextResponse.json({ error: error.message || 'Upload failed.' }, { status: 500 });

  const { data: urlData } = supabaseAdmin.storage.from(targetBucket).getPublicUrl(path);
  return NextResponse.json({ url: urlData.publicUrl });
}

export async function DELETE(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  const { name, folder, bucket } = await request.json();
  if (!name) return NextResponse.json({ error: 'File name required.' }, { status: 400 });

  if (name.startsWith('http')) {
    return NextResponse.json({ error: 'Cannot delete external image here. Remove it from the product directly.' }, { status: 400 });
  }

  const targetBucket = bucket || 'images'; 
  const targetFolder = folder || '';
  
  const pathToDelete = targetFolder ? `${targetFolder}/${name}` : name;

  const { error } = await supabaseAdmin.storage.from(targetBucket).remove([pathToDelete]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
