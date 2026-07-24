import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BUCKET_NAME = 'images';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Image file is required.' }, { status: 400 });
  }

  const folder = formData.get('folder') || 'products'; // Default to products if not specified
  const bucketName = 'images';
  
  const filename = file.name || `image-${Date.now()}.jpg`;
  const path = `${folder}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-]/g, '_')}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(path, buffer, { contentType: file.type || 'image/jpeg', upsert: false });

  if (error) {
    return NextResponse.json({ error: error.message || 'Supabase upload failed.' }, { status: 500 });
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(path);
  return NextResponse.json({ url: publicUrlData.publicUrl });
}
