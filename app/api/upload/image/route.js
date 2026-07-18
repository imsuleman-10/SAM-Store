import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BUCKET_NAME = 'products';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Image file is required.' }, { status: 400 });
  }

  // Upload to the root of the 'products' bucket
  const filename = file.name || `image-${Date.now()}.jpg`;
  const path = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-]/g, '_')}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(path, buffer, { contentType: file.type || 'image/jpeg', upsert: false });

  if (error) {
    return NextResponse.json({ error: error.message || 'Supabase upload failed.' }, { status: 500 });
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(path);
  return NextResponse.json({ url: publicUrlData.publicUrl });
}
