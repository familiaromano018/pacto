import Link from 'next/link'
import { getPostMetas } from '@/lib/blog'
import { BlogHeader, BlogFooter, BlogCover } from '@/components/blog/BlogChrome'

export const metadata = {
  title: 'Blog do Pacto — Finanças de casal sem briga',
  description: 'Guias práticos sobre dividir contas, conta conjunta ou separada, e como organizar o dinheiro a dois sem discussão.',
}

function formatDate(d: string) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${day} de ${meses[Number(m) - 1]} de ${y}`
}

export default function BlogIndex() {
  const posts = getPostMetas()

  return (
    <main style={{ background: '#0b0b10', color: '#f4f4f6', minHeight: '100vh' }}>
      <BlogHeader />

      <section style={{ padding: '72px 24px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div
            style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.28em',
              color: '#5b8dff', textTransform: 'uppercase', marginBottom: 20,
            }}
          >
            Blog
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#fff', margin: 0 }}>
            Finanças de casal, sem briga.
          </h1>
          <p style={{ fontSize: 18, color: '#a0a3ad', marginTop: 20, lineHeight: 1.55 }}>
            Guias práticos pra vocês combinarem as contas e organizarem o dinheiro a dois — sem virar discussão.
          </p>
        </div>
      </section>

      <section style={{ padding: '20px 24px 100px' }}>
        <div
          style={{
            maxWidth: 880, margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
            gap: 20,
          }}
        >
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              style={{
                display: 'block',
                background: '#13131a',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20,
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <BlogCover category={p.category} image={p.image} alt={p.title} height={150} />
              <div style={{ padding: '22px 26px 26px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: '#5b8dff', background: 'rgba(91,141,255,0.12)',
                    padding: '4px 10px', borderRadius: 999, marginBottom: 16,
                  }}
                >
                  {p.category}
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.25, letterSpacing: '-0.01em', margin: 0 }}>
                  {p.title}
                </h2>
                <p style={{ fontSize: 14.5, color: '#a0a3ad', lineHeight: 1.6, marginTop: 12 }}>
                  {p.description}
                </p>
                <div style={{ fontSize: 12.5, color: '#71747e', marginTop: 18 }}>
                  {formatDate(p.date)} · {p.readingMin} min de leitura
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <BlogFooter />
    </main>
  )
}
