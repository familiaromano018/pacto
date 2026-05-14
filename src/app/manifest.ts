import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pacto',
    short_name: 'Pacto',
    description: 'Pacto cuida das contas. Vocês cuidam do resto.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0b1538',
    theme_color: '#0b1538',
    orientation: 'portrait',
    lang: 'pt-BR',
    categories: ['finance', 'lifestyle', 'productivity'],
    icons: [
      { src: '/icon', sizes: '64x64', type: 'image/png' },
      { src: '/icon1', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon2', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon2', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
