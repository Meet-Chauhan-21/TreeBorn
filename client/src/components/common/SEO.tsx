import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_TITLE = 'TREEBORN — Premium Botanical Skincare & Organic Cellular Restoration';
const DEFAULT_DESCRIPTION = 'Discover TREEBORN premium organic skincare. Powered by botanical science, cruelty-free ingredients, cellular barrier repair, and natural glow formulas.';
const DEFAULT_KEYWORDS = 'treeborn, treeborn skincare, organic skincare, botanical skincare, natural face serum, serum, anti-aging, vegan skincare India, ayurvedic skincare, skin hydration, clear skin';
const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=1200&auto=format&fit=crop';
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://treeborn.in';

export const SEO: React.FC<SEOProps> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  jsonLd
}) => {
  const pageUrl = canonical || (typeof window !== 'undefined' ? window.location.href : SITE_URL);

  const defaultOrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TREEBORN Skincare',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    sameAs: [
      'https://instagram.com/treebornskincare',
      'https://facebook.com/treebornskincare'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9999999999',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['en', 'gu', 'hi']
    }
  };

  const schemasToRender = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [defaultOrganizationSchema];

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{title.includes('TREEBORN') ? title : `${title} | TREEBORN Skincare`}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:site_name" content="TREEBORN Skincare" />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={pageUrl} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data Schema */}
      {schemasToRender.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
