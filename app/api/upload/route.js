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
    // 2-bucket structure: all images go to 'images' bucket under specific subfolder
    const VALID_FOLDERS = ['customers', 'admin', 'staffs', 'hero_slides', 'products', 'results'];
    const targetFolder = VALID_FOLDERS.includes(folder) ? folder : 'admin';
    const bucketName = 'images';
    const path = `${targetFolder}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-]/g, '_')}`;

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
