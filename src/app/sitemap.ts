import type { MetadataRoute } from 'next'
import { getPostMetas } from '@/lib/blog'

const BASE = 'https://pacto-app.tec.br'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: { path: string; priority: number }[] = [
    { path: '', priority: 1 },
    { path: '/blog', priority: 0.8 },
    { path: '/ajuda', priority: 0.5 },
    { path: '/privacidade', priority: 0.3 },
    { path: '/termos', priority: 0.3 },
  ]

  const posts: MetadataRoute.Sitemap = getPostMetas().map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    ...staticRoutes.map((r) => ({
      url: `${BASE}${r.path}`,
      changeFrequency: 'weekly' as const,
      priority: r.priority,
    })),
    ...posts,
  ]
}
