import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { appUrl } from '@/lib/shared';

export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.getPages().map((page) => ({
    url: `${appUrl}${page.url}`,
    changeFrequency: 'weekly' as const,
    priority: page.url === '/' ? 1.0 : 0.8,
  }));

  return pages;
}
