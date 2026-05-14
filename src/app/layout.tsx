import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/Toast'

export const metadata: Metadata = {
  title: 'Pacto — Uma casa merece paz',
  description: 'Pacto cuida das contas. Vocês cuidam do resto. Rateio justo entre o casal, extrato compartilhado, saldo claro mês a mês.',
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
