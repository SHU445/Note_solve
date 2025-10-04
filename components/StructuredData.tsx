import { SEO_CONFIG } from '@/lib/seo-config';

interface StructuredDataProps {
  type?: 'WebApplication' | 'WebSite';
}

export function StructuredData({ type = 'WebApplication' }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    name: SEO_CONFIG.siteName,
    description: SEO_CONFIG.siteDescription,
    url: SEO_CONFIG.baseUrl,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    author: {
      '@type': 'Organization',
      name: SEO_CONFIG.siteName,
    },
    inLanguage: 'fr-FR',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '1.0',
    featureList: [
      'Prise de notes Markdown',
      'Gestion de tâches',
      'Organisation de liens',
      'Drag & drop',
      'Sauvegarde automatique',
      'Export/Import JSON',
      'Recherche en temps réel',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

