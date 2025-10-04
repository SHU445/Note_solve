import { MetadataRoute } from 'next'
import { SEO_CONFIG } from '@/lib/seo-config'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SEO_CONFIG.baseUrl

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

