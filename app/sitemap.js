import { supabase } from '@/lib/supabaseClient';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowvie.vercel.app';
  
  // Core static routes
  const routes = [
    { url: '', priority: 1, freq: 'daily' },
    { url: '/collections', priority: 0.9, freq: 'daily' },
    { url: '/about', priority: 0.7, freq: 'monthly' },
    { url: '/contact', priority: 0.7, freq: 'monthly' },
    { url: '/track-order', priority: 0.6, freq: 'weekly' },
    { url: '/policies/shipping', priority: 0.5, freq: 'monthly' }
  ].map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.freq,
    priority: route.priority,
  }));

  try {
    // Fetch all products dynamically for the sitemap
    const { data: products } = await supabase
      .from('products')
      .select('id, created_at')
      .order('created_at', { ascending: false });

    if (products) {
      const productRoutes = products.map((product) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: new Date(product.created_at || new Date()),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
      routes.push(...productRoutes);
    }
  } catch (error) {
    console.error('Error generating sitemap products', error);
  }

  return routes;
}
