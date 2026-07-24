// ─── SERVER COMPONENT — no 'use client' ──────────────────────────────────
import { Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import CollectionsShell from './CollectionsShell';

export const revalidate = 0; // Ensure fresh data on every request

export const metadata = {
  title: 'All Collections — Glowvie',
  description: 'Browse all premium skincare, hair care, and beauty products by Glowvie.',
};

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function getProducts() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data;
}

export default async function CollectionsPage() {
  // Fetch all products on the server side
  const products = await getProducts();

  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent mx-auto" />
          <p className="section-label">Loading collections...</p>
        </div>
      </div>
    }>
      <CollectionsShell initialProducts={products} />
    </Suspense>
  );
}
