import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/Toast'
import MetaPixel from '@/components/MetaPixel'
import GoogleAnalytics from '@/components/GoogleAnalytics'

export const metadata: Metadata = {
  title: 'Pacto — Uma casa merece paz',
  description: 'Pacto cuida das contas. Vocês cuidam do resto. Rateio justo entre o casal, extrato compartilhado, saldo claro mês a mês.',
  applicationName: 'Pacto',
  appleWebApp: {
    capable: true,
    title: 'Pacto',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  // Verificação do Google Search Console.
  // Defina GOOGLE_SITE_VERIFICATION nas env vars da Vercel com o código que o
  // Google fornece (o valor "content" da meta tag). Vazio = tag não renderiza.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0b1538',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Aplica o tema salvo antes da pintura, evitando flash do tema errado */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('pacto-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}`,
          }}
        />
      </head>
      <body>
        <MetaPixel />
        <GoogleAnalytics />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
