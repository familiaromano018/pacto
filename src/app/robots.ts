import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Rotas privadas / internas não devem ser indexadas
      disallow: ['/app', '/admin', '/api'],
    },
    sitemap: 'https://pacto-app.tec.br/sitemap.xml',
    host: 'https://pacto-app.tec.br',
  }
}
