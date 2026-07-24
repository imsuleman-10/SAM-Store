import './globals.css';
import { CartProvider } from '@/components/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ConditionalLayout } from '@/components/ConditionalLayout';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowvie.vercel.app';

export async function generateMetadata() {
  let favicon = '/favicon.ico';
  
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'store_favicon')
      .single();
    
    if (data && data.value) {
      favicon = data.value;
    }
  }

  return {
    metadataBase: new URL(BASE_URL),
  title: {
    default: 'Glowvie — Premium Skincare & Beauty Pakistan',
    template: '%s — Glowvie',
  },
  description:
    'Glowvie offers premium face wash, serums, hair care and body care products with nationwide Cash on Delivery across Pakistan. Real ingredients, visible results.',
  keywords: [
    'skincare Pakistan', 'beauty products Pakistan', 'face wash', 'serum Pakistan',
    'hair care', 'body care', 'glowvie', 'cash on delivery beauty', 'online beauty store Pakistan',
  ],
  authors: [{ name: 'Glowvie', url: BASE_URL }],
  creator: 'Glowvie',
  publisher: 'Glowvie',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: BASE_URL,
    siteName: 'Glowvie',
    title: 'Glowvie — Premium Skincare & Beauty Pakistan',
    description:
      'Premium face wash, serums, hair care and body care with nationwide Cash on Delivery across Pakistan.',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Glowvie — Premium Skincare & Beauty',
      },
    ],
  },
    twitter: {
      card: 'summary_large_image',
      title: 'Glowvie — Premium Skincare & Beauty Pakistan',
      description: 'Premium skincare & beauty products with Cash on Delivery across Pakistan.',
      images: ['/images/og-default.jpg'],
    },
    alternates: {
      canonical: BASE_URL,
    },
    icons: {
      icon: favicon,
      apple: favicon,
    },
  };
}

// JSON-LD: Organization, WebSite, and LocalBusiness schemas — optimized for SEO, GEO, AEO, and LLMO
const orgJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'HealthAndBeautyBusiness',
      '@id': `${BASE_URL}/#organization`,
      name: 'Glowvie',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/logo.png`,
      },
      image: `${BASE_URL}/images/og-default.jpg`,
      description:
        'Glowvie is a premium Pakistani beauty and skincare brand offering dermatologist-approved face care, hair care, serums, and body care products with nationwide Cash on Delivery.',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'PK',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '30.3753', // Center of Pakistan approx
        longitude: '69.3451'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        availableLanguage: ['English', 'Urdu'],
        areaServed: 'PK',
        contactOption: 'TollFree'
      },
      sameAs: [
        'https://www.facebook.com/profile.php?id=61592271981284',
        'https://www.instagram.com/glowviestore/',
        'https://www.tiktok.com/@glowviestore'
      ],
      priceRange: '₨',
      paymentAccepted: 'Cash on Delivery',
      areaServed: {
        '@type': 'Country',
        name: 'Pakistan',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'Glowvie Official Store',
      description: 'Shop premium skincare and beauty products in Pakistan.',
      publisher: { '@id': `${BASE_URL}/#organization` },
      inLanguage: 'en-PK',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/collections?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${BASE_URL}/#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Collections', item: `${BASE_URL}/collections` },
        { '@type': 'ListItem', position: 3, name: 'Contact Us', item: `${BASE_URL}/contact` }
      ]
    },
    {
      '@type': 'SiteNavigationElement',
      '@id': `${BASE_URL}/#navigation`,
      name: 'Main Navigation',
      url: BASE_URL,
      hasPart: [
        { '@type': 'WebPage', name: 'Face Care', url: `${BASE_URL}/collections?cat=face-care` },
        { '@type': 'WebPage', name: 'Hair Care', url: `${BASE_URL}/collections?cat=hair-care` },
        { '@type': 'WebPage', name: 'Body Care', url: `${BASE_URL}/collections?cat=body-care` },
        { '@type': 'WebPage', name: 'Sale', url: `${BASE_URL}/collections?cat=sale` }
      ]
    }
  ],
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-white text-black">
        <CartProvider>
          <ConditionalLayout header={<Header />} footer={<Footer />}>
            {children}
          </ConditionalLayout>
        </CartProvider>
      </body>
    </html>
  );
}
