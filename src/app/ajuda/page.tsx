import type { Metadata } from 'next'
import { faqContent } from '@/lib/faq/content'
import HelpClient from './HelpClient'

export const metadata: Metadata = {
  title: 'Ajuda — Pacto',
  description: 'Como usar o Pacto: gastos, divisão, autorização entre parceiros, fechar mês, exportar PDF e mais.',
}

function buildJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqContent.flatMap((section) =>
      section.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    ),
  }
}

export default function AjudaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }}
      />
      <HelpClient sections={faqContent} />
    </>
  )
}
