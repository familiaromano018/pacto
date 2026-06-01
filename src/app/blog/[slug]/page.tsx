import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SmartCTA from '@/components/landing/SmartCTA'
import { getAllSlugs, getPost } from '@/lib/blog'
import { BlogHeader, BlogFooter, BlogCover } from '@/components/blog/BlogChrome'

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug)
  if (!post) return { title: 'Artigo não encontrado — Pacto' }
  return {
    title: `${post.title} — Blog do Pacto`,
    description: post.description,
    openGraph: { title: post.title, description: post.description, type: 'article' },
  }
}

function formatDate(d: string) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${day} de ${meses[Number(m) - 1]} de ${y}`
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)
  if (!post) notFound()

  return (
    <main style={{ background: '#0b0b10', color: '#f4f4f6', minHeight: '100vh' }}>
      <BlogHeader />

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 40px' }}>
        <Link href="/blog" style={{ color: '#5b8dff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
          ← Todos os artigos
        </Link>

        <div style={{ marginTop: 24 }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#5b8dff', background: 'rgba(91,141,255,0.12)',
              padding: '4px 10px', borderRadius: 999,
            }}
          >
            {post.category}
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.15, color: '#fff', marginTop: 18 }}>
          {post.title}
        </h1>
        <div style={{ fontSize: 13, color: '#71747e', marginTop: 16 }}>
          {formatDate(post.date)} · {post.readingMin} min de leitura
        </div>

        <div style={{ marginTop: 28 }}>
          <BlogCover category={post.category} height={220} radius={20} />
        </div>

        <div className="blog-prose" style={{ marginTop: 36 }} dangerouslySetInnerHTML={{ __html: post.html }} />

        {/* CTA final */}
        <div
          style={{
            marginTop: 56,
            background: 'linear-gradient(135deg, rgba(91,141,255,0.10) 0%, rgba(212,175,106,0.05) 100%)',
            border: '1px solid rgba(91,141,255,0.25)',
            borderRadius: 24,
            padding: '36px 32px',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            Combinem as contas no Pacto
          </h3>
          <p style={{ fontSize: 15, color: '#a0a3ad', lineHeight: 1.6, margin: '12px auto 24px', maxWidth: 460 }}>
            Escolham como dividir, lancem os gastos e vejam o mês fechar em equilíbrio — nos dois celulares. Grátis por 14 dias, sem cartão.
          </p>
          <SmartCTA variant="primary" />
        </div>
      </article>

      <BlogFooter />
    </main>
  )
}
