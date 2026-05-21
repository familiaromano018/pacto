'use client'

import { useEffect, useMemo, useState } from 'react'
import { tokens } from '@/lib/tokens'
import type { FAQSection } from '@/lib/faq/content'

interface Props {
  sections: FAQSection[]
}

export default function HelpClient({ sections }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return sections
    const q = query.toLowerCase()
    return sections
      .map((s) => ({
        ...s,
        items: s.items.filter(
          (i) =>
            i.question.toLowerCase().includes(q) ||
            i.answer.toLowerCase().includes(q),
        ),
      }))
      .filter((s) => s.items.length > 0)
  }, [query, sections])

  const totalMatches = useMemo(
    () => filtered.reduce((acc, s) => acc + s.items.length, 0),
    [filtered],
  )

  // Deep-link via hash: /ajuda#fechar-mes abre e expande
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash.slice(1)
    if (!hash) return
    const el = document.getElementById(hash)
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      if (el.tagName === 'DETAILS') (el as HTMLDetailsElement).open = true
    }
  }, [])

  return (
    <main
      style={{
        minHeight: '100vh',
        background: tokens.color.bg_app,
        fontFamily: tokens.primitive.fontFamily.sans,
        color: tokens.color.text_body,
        paddingBottom: 80,
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 20px' }}>
        <a
          href="/"
          style={{
            display: 'inline-block',
            fontSize: 13,
            color: tokens.color.text_secondary,
            textDecoration: 'none',
            marginBottom: 24,
            fontWeight: 600,
          }}
        >
          ← Voltar
        </a>

        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: tokens.color.text_heading,
            letterSpacing: '-0.02em',
            marginBottom: 8,
            lineHeight: 1.15,
          }}
        >
          Central de Ajuda
        </h1>
        <p
          style={{
            fontSize: 15,
            color: tokens.color.text_secondary,
            lineHeight: 1.5,
            marginBottom: 28,
          }}
        >
          Tudo o que você precisa saber sobre o Pacto.
        </p>

        <div style={{ position: 'relative', marginBottom: 24 }}>
          <input
            type="search"
            inputMode="search"
            autoComplete="off"
            aria-label="Buscar na ajuda"
            placeholder="Buscar... (ex: fechar o mês)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: 15,
              fontFamily: 'inherit',
              background: tokens.color.bg_card,
              border: `1px solid ${tokens.color.border_default}`,
              borderRadius: 12,
              color: tokens.color.text_heading,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {query && (
          <div
            style={{
              fontSize: 12,
              color: tokens.color.text_muted,
              marginBottom: 16,
            }}
          >
            {totalMatches} {totalMatches === 1 ? 'resultado' : 'resultados'}
          </div>
        )}

        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: tokens.color.text_muted,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤔</div>
            <p style={{ fontSize: 15, marginBottom: 16 }}>
              Nenhum resultado para &quot;{query}&quot;.
            </p>
            <button
              onClick={() => setQuery('')}
              style={{
                background: '#5b8dff',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Limpar busca
            </button>
          </div>
        ) : (
          filtered.map((section) => (
            <section key={section.id} id={section.id} style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: tokens.color.text_muted,
                  marginBottom: 12,
                  marginTop: 28,
                }}
              >
                {section.emoji}  {section.title}
              </h2>
              <div
                style={{
                  background: tokens.color.bg_card,
                  borderRadius: 14,
                  border: `1px solid ${tokens.color.border_subtle}`,
                  overflow: 'hidden',
                }}
              >
                {section.items.map((item, idx) => (
                  <details
                    key={item.id}
                    id={item.id}
                    style={{
                      borderTop: idx === 0 ? 'none' : `1px solid ${tokens.color.border_subtle}`,
                    }}
                  >
                    <summary
                      style={{
                        padding: '16px 18px',
                        cursor: 'pointer',
                        fontSize: 15,
                        fontWeight: 600,
                        color: tokens.color.text_heading,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 14,
                        listStyle: 'none',
                        userSelect: 'none',
                      }}
                    >
                      <span style={{ flex: 1 }}>{item.question}</span>
                      <span
                        style={{
                          color: '#5b8dff',
                          fontSize: 20,
                          lineHeight: 1,
                          fontWeight: 300,
                          flexShrink: 0,
                        }}
                      >
                        +
                      </span>
                    </summary>
                    <div
                      style={{
                        padding: '0 18px 18px',
                        fontSize: 14,
                        color: tokens.color.text_secondary,
                        lineHeight: 1.65,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))
        )}

        <footer
          style={{
            marginTop: 60,
            padding: '24px 20px',
            background: tokens.color.bg_card,
            borderRadius: 14,
            border: `1px solid ${tokens.color.border_subtle}`,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 15, color: tokens.color.text_heading, fontWeight: 600, marginBottom: 8 }}>
            Ainda tem dúvida?
          </div>
          <div style={{ fontSize: 13, color: tokens.color.text_secondary }}>
            Fala com a gente pelo canal de atendimento da Hotmart, ou pelo app na aba Casal.
          </div>
        </footer>
      </div>

      <style jsx global>{`
        details > summary::-webkit-details-marker { display: none; }
        details[open] > summary > span:last-child { transform: rotate(45deg); transition: transform 200ms; }
        details > summary > span:last-child { transition: transform 200ms; display: inline-block; }
      `}</style>
    </main>
  )
}
