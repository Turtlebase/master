import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://imagecon.pro';

  const toolPages = [
    '/remove-background',
    '/metadata-generator',
    '/copyright-checker',
    '/tattoo-stencil',
    '/coloring-converter',
    '/passport-photo',
    '/image-converter',
    '/blur-background',
    '/resize',
    '/crop',
    '/compress',
    '/filters',
  ];

  const staticPages = [
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
  ];

  const allPages = [...toolPages, ...staticPages].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: path.startsWith('/tool') ? 0.8 : 0.7,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...allPages,
  ]
}
