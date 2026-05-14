import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/Toast'

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
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
