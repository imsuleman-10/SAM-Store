export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/account/', '/checkout/'],
    },
    sitemap: (process.env.NEXT_PUBLIC_SITE_URL || 'https://glowvie.vercel.app') + '/sitemap.xml',
  };
}
