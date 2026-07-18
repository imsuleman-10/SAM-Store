import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    const formData = await request.formData();
    // Support either 'image' or 'file' key
    const file = formData.get('image') || formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Image file is required.' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin is missing.' }, { status: 500 });
    }

    const filename = file.name || `image-${Date.now()}.jpg`;
    const folder = formData.get('folder') || 'uploads';
    
    // Determine the target bucket
    const validBuckets = ['products', 'hero_slides', 'staffs', 'customers', 'admin'];
    const bucketName = validBuckets.includes(folder) ? folder : 'images';
    
    // For specific buckets, we can just put them at the root, or keep the folder in the path if needed.
    // The user's request separates them by bucket. So we upload to the root of the designated bucket.
    const path = validBuckets.includes(folder) 
      ? `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-]/g, '_')}`
      : `${folder}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-]/g, '_')}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(path, buffer, { contentType: file.type || 'image/jpeg', upsert: false });

    if (error) {
      return NextResponse.json({ error: error.message || 'Supabase upload failed.' }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(path);
    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
  }
}
