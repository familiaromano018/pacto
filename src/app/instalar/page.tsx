import type { Metadata } from 'next'
import InstalarClient from '@/components/InstalarClient'

export const metadata: Metadata = {
  title: 'Instalar o Pacto no celular — passo a passo',
  description: 'Como instalar o app do Pacto no seu celular: passo a passo pra Android e iPhone. Vira um app na sua tela inicial.',
}

export default function InstalarPage() {
  return <InstalarClient />
}
