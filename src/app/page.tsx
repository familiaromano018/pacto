import Link from 'next/link'
import Image from 'next/image'
import { LogoMark } from '@/components/Logo'
import SmartCTA from '@/components/landing/SmartCTA'
import Reveal from '@/components/landing/Reveal'
import HeroBg from '@/components/landing/HeroBg'
import HowScene from '@/components/landing/HowScene'
import YouTubeLite from '@/components/landing/YouTubeLite'
import GrowingStat from '@/components/landing/GrowingStat'
import WrongWays from '@/components/landing/WrongWays'
import AppShowcase from '@/components/landing/AppShowcase'

export const metadata = {
  title: 'Pacto — As contas do casal, sem briga de quem pagou o quê',
  description: 'O app que mostra na hora quem deve quanto e sincroniza nos dois celulares em tempo real. Rateio 50/50, por renda, conta única ou por categorias. 14 dias grátis, sem cartão.',
  openGraph: {
    title: 'Pacto — As contas do casal, sem briga de quem pagou o quê',
    description: 'Quem deve quanto, na hora, nos dois celulares. Finanças do casal sem briga. 14 dias grátis.',
    type: 'website',
  },
}

// ── Paleta "Noite / Cofre" (navy + brass) ──
const C = {
  bg: '#0c1226',
  bgDeep: '#090d1c',
  surface: '#131a31',
  surfaceHi: '#182245',
  ink: '#f3efe6',
  inkSoft: '#c7ccdb',
  muted: '#8b91a8',
  brass: '#c9a25e',
  brassHi: '#e3c389',
  brassDim: 'rgba(201,162,94,0.14)',
  hair: 'rgba(214,201,178,0.12)',
  hairStrong: 'rgba(214,201,178,0.22)',
  neutralCheck: 'rgba(214,201,178,0.45)',
}

// Paleta clara — "sessão creme" que quebra o ritmo escuro do site
const LIGHT = {
  bg: '#efe6d4',
  card: '#f8f1e3',
  panel: '#faf5ea', // painel branco-quente da "resolução"
  ink: '#1a2138',
  body: '#4a4f63',
  muted: '#6b6f82',
  bronze: '#9c6f30',
  hair: 'rgba(26,33,56,0.12)',
  hairStrong: 'rgba(26,33,56,0.22)',
}

const display = 'var(--font-display), Georgia, serif'

function delay(ms: number): React.CSSProperties {
  return { ['--pl-delay' as string]: `${ms}ms` } as React.CSSProperties
}

export default function LandingPage() {
  return (
    <main className="pacto-landing" style={{ minHeight: '100vh', overflowX: 'clip' }}>
      <Nav />
      <Hero />
      <VideoSection />
      <WrongWays />
      <ThreePillars />
      <HowItWorks />
      <AppShowcase />
      <Comparison />
      <Features />
      <Testimonials />
      <ForWhom />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}

// ─────────────────────────────────────────────────────────────── NAV ──

function Nav() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(12,18,38,0.72)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${C.hair}`,
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <LogoMark size={26} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.24em', color: C.ink, lineHeight: 1 }}>
            PACTO
          </span>
          <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.2em', color: C.brass, lineHeight: 1 }}>
            FINANÇAS · DIÁLOGO · PROPÓSITO
          </span>
        </div>
        <nav style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 22 }}>
          <a href="#problema" className="pl-link" style={navLinkStyle}>O problema</a>
          <a href="#como" className="pl-link" style={navLinkStyle}>Como funciona</a>
          <a href="#preco" className="pl-link" style={navLinkStyle}>Preço</a>
          <Link href="/blog" className="pl-link" style={navLinkStyle}>Blog</Link>
          <SmartCTA variant="nav" />
        </nav>
      </div>
    </header>
  )
}

const navLinkStyle: React.CSSProperties = {
  color: C.muted,
  fontSize: 13,
  fontWeight: 500,
  textDecoration: 'none',
  transition: 'color 0.2s ease',
}

// ─────────────────────────────────────────────────────────────── HERO ──

function Hero() {
  return (
    <>
      <section className="pl-hero">
        <HeroBg />
        <div className="pl-hero-scrim" aria-hidden />

        <div className="pl-hero-inner">
          <div className="pl-hero-copy">
            <div className="pl-rise pl-hero-eyebrow" style={{ ...delay(0), display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <span style={{ width: 22, height: 1, background: C.brass, display: 'inline-block' }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', color: C.brass, textTransform: 'uppercase' }}>
                Um acordo entre vocês
              </span>
            </div>

            <h1
              className="pl-rise pl-display"
              style={{
                ...delay(90),
                fontSize: 'clamp(26px, 4.6vw, 38px)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1.12,
                color: C.ink,
                margin: 0,
              }}
            >
              <span className="pl-h1-line">As contas do casal,</span>
              <span className="pl-h1-line" style={{ color: C.brass, fontStyle: 'italic', fontWeight: 500 }}>
                sem a briga de quem pagou o quê.
              </span>
            </h1>

            <p
              className="pl-rise"
              style={{ ...delay(220), fontSize: 19, color: C.inkSoft, marginTop: 22, lineHeight: 1.6, fontWeight: 400 }}
            >
              Cada um lança do próprio celular e o Pacto mostra,{' '}
              <strong style={{ color: C.ink, fontWeight: 600 }}>na hora, quem deve quanto</strong> pra quem — atualizado nos dois aparelhos em tempo real. Acabou a planilha, o &ldquo;manda o print&rdquo; e o climão no fim do mês.
            </p>

            <div className="pl-rise" style={{ ...delay(330), display: 'flex', justifyContent: 'center', gap: 14, marginTop: 32, flexWrap: 'wrap' }}>
              <SmartCTA variant="primary" />
              <a
                href="#como"
                className="pl-tap"
                style={{
                  background: 'rgba(12,18,38,0.5)',
                  color: C.ink,
                  padding: '15px 28px',
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 17,
                  textDecoration: 'none',
                  border: `1px solid ${C.hairStrong}`,
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                }}
              >
                Como funciona →
              </a>
            </div>

            <div
              className="pl-rise"
              style={{ ...delay(440), marginTop: 30, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 26px', fontSize: 14.5, fontWeight: 500, color: C.ink }}
            >
              {[
                'Grátis 14 dias · sem cartão',
                'Sem anúncios',
                'Feito por um casal, pra casais',
              ].map((t) => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-flex', width: 20, height: 20, borderRadius: '50%', background: 'rgba(201,162,94,0.18)', color: C.brass, alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>✓</span>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Figura IBGE — gráfico que sobe e número que conta no scroll */}
      <GrowingStat />
    </>
  )
}

// ─────────────────────────────────────────────────────────────── VÍDEO ──

function VideoSection() {
  return (
    <section style={{ padding: '96px 24px', background: C.bgDeep }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <SectionHeader
          kicker="Conheça o Pacto"
          title="O Pacto em 1 minuto."
          sub="Por que criamos — e como funciona na vida real de um casal."
        />
        <Reveal style={{ marginTop: 48 }}>
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.5)', border: `1px solid ${C.hair}`, aspectRatio: '16 / 9', background: '#000' }}>
            <YouTubeLite id="D5AoitzgQEo" poster="/site-video-poster.jpg" title="O Pacto em 1 minuto" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────── THREE PILLARS ──

function ThreePillars() {
  const pillars = [
    {
      label: 'Finanças',
      title: 'Números claros.',
      desc: 'Rateio automático, custos fixos, parcelados e fechamento mensal — tudo na palma da mão. Sem planilha. Sem esquecimento.',
    },
    {
      label: 'Diálogo',
      title: 'Conversa fácil.',
      desc: 'Quando os dois veem os mesmos números em tempo real, a conversa muda. De acusação pra acordo. De memória pra fato.',
    },
    {
      label: 'Propósito',
      title: 'Relação forte.',
      desc: 'Metas a dois, projetos em comum, decisões compartilhadas. Dinheiro deixa de ser desgaste e vira ferramenta de construção.',
    },
  ]

  return (
    <section style={{ padding: '108px 24px', background: C.bg }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <SectionHeader
          kicker="O método Pacto"
          title="3 pilares pra um casal financeiramente saudável."
          sub="Não é só sobre o app. É sobre a relação que vocês querem construir."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 56 }}>
          {pillars.map((p, i) => (
            <Reveal key={p.label} delay={i * 150} className="pl-strong">
              <div
                className="pl-card-hover"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.hair}`,
                  borderRadius: 4,
                  padding: '36px 30px',
                  height: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 18 }}>
                  <span className="pl-display" style={{ fontSize: 38, color: C.brass, fontWeight: 500, lineHeight: 1 }}>
                    0{i + 1}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.muted }}>
                    {p.label}
                  </span>
                </div>
                <div className="pl-display" style={{ fontSize: 28, color: C.ink, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 12, lineHeight: 1.2 }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 17, color: C.muted, lineHeight: 1.6 }}>
                  {p.desc}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={140}>
          <div style={{ marginTop: 60, textAlign: 'center' }}>
            <div className="pl-display" style={{ fontSize: 'clamp(24px, 2.9vw, 31px)', fontStyle: 'italic', color: C.inkSoft, fontWeight: 400, lineHeight: 1.45, maxWidth: 660, margin: '0 auto', letterSpacing: '-0.01em' }}>
              &ldquo;Organizar não é só sobre números. É sobre acordos, confiança e tranquilidade todos os dias.&rdquo;
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────── HOW IT WORKS ──

function HowItWorks() {
  return (
    <section id="como" className="pl-how-section">
      <div className="pl-how-bg">
        <Image src="/how-couple.jpg" alt="Casal lançando os gastos no Pacto, juntos no sofá" fill sizes="100vw" style={{ objectFit: 'cover' }} />
        <div className="pl-how-scrim-full" aria-hidden />
      </div>
      <div className="pl-how-inner">
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto', padding: '10px 30px 26px', background: 'radial-gradient(120% 100% at 50% 35%, rgba(9,13,28,0.78) 0%, rgba(9,13,28,0.32) 52%, transparent 78%)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span style={{ width: 18, height: 1, background: C.brass }} />
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: C.brass, fontWeight: 600 }}>Como funciona</span>
            <span style={{ width: 18, height: 1, background: C.brass }} />
          </div>
          <h2 className="pl-display" style={{ fontSize: 'clamp(31px, 4.5vw, 45px)', fontWeight: 500, color: C.ink, letterSpacing: '-0.015em', lineHeight: 1.18, margin: 0, textShadow: '0 2px 24px rgba(9,13,28,0.85)' }}>
            Três passos. Zero planilha.
          </h2>
          <p style={{ fontSize: 18, marginTop: 16, lineHeight: 1.6, fontWeight: 500, color: C.ink, textShadow: '0 2px 18px rgba(9,13,28,0.85)' }}>
            Pacto faz a conta. <span style={{ color: C.brass }}>Vocês vivem a relação.</span>
          </p>
        </Reveal>
        <HowScene />
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────── COMPARISON ──

function Comparison() {
  return (
    <section style={{ padding: '108px 24px', background: C.bg }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <Reveal style={{ textAlign: 'center', maxWidth: 920, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span style={{ width: 18, height: 1, background: C.brass }} />
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: C.brass, fontWeight: 600 }}>
              Pacto vs. tudo o que você já tentou
            </span>
            <span style={{ width: 18, height: 1, background: C.brass }} />
          </div>
          <h2 className="pl-display" style={{ fontSize: 'clamp(31px, 4.5vw, 45px)', fontWeight: 500, color: C.ink, letterSpacing: '-0.015em', lineHeight: 1.18, margin: 0 }}>
            Não é dividir conta de pizza.<br />É vida a dois.
          </h2>
          <p className="pl-head-1l" style={{ fontSize: 17, color: C.muted, marginTop: 16, lineHeight: 1.6 }}>
            Os apps que existem foram feitos pra amigos. Pacto entende que casal é diferente.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div style={{ marginTop: 52, background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 4, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={thStyle}></th>
                  <th style={{ ...thStyle, color: C.brass, fontWeight: 700 }}>Pacto</th>
                  <th style={thStyle}>Splitwise</th>
                  <th style={thStyle}>Mobills</th>
                  <th style={thStyle}>Planilha</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Rateio justo (50/50 ou proporcional)', true, false, false, 'manual'],
                  ['Fixos e parcelas mensais', true, false, true, 'manual'],
                  ['Saldo do casal mês a mês', true, true, false, 'manual'],
                  ['Extrato PDF do mês', true, false, false, 'export'],
                  ['Gráficos de gastos', true, false, true, 'manual'],
                  ['Sync em tempo real entre 2 celulares', true, true, false, false],
                  ['Pensado pra casal (não amigos)', true, false, false, false],
                ].map(([feat, p, s, m, pl], i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${C.hair}` }}>
                    <td style={{ ...tdStyle, color: C.ink, fontWeight: 500, textAlign: 'left' }}>{feat as string}</td>
                    <td style={tdStyle}><Cell v={p} brand /></td>
                    <td style={tdStyle}><Cell v={s} /></td>
                    <td style={tdStyle}><Cell v={m} /></td>
                    <td style={tdStyle}><Cell v={pl} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

const thStyle: React.CSSProperties = {
  padding: '18px 16px',
  fontSize: 13,
  fontWeight: 600,
  color: C.muted,
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  fontSize: 16,
  textAlign: 'center',
  color: C.muted,
}

function Cell({ v, brand }: { v: boolean | string; brand?: boolean }) {
  if (v === true) {
    return (
      <span
        style={{
          display: 'inline-flex',
          width: 22, height: 22,
          borderRadius: '50%',
          background: brand ? C.brass : 'transparent',
          border: brand ? 'none' : `1px solid ${C.neutralCheck}`,
          color: brand ? C.bg : C.neutralCheck,
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </span>
    )
  }
  if (v === false) {
    return <span style={{ color: C.hairStrong, fontSize: 18 }}>—</span>
  }
  return (
    <span style={{ fontSize: 11, color: C.muted, background: 'rgba(214,201,178,0.06)', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
      {v}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────── FEATURES ──

function Features() {
  const items = [
    {
      title: '4 jeitos de dividir — do seu jeito',
      desc: '50/50, proporcional à renda, conta 100% unificada ou divisão por categorias (você paga o aluguel, ela o mercado). Ainda dá pra definir uma mesada igual pra cada um gastar livre. O Pacto calcula o acerto sozinho.',
      icon: <IconScale />,
    },
    {
      title: 'Entrou, saiu, sobrou',
      desc: 'Não é só gasto: lance também as receitas (salário, freela, reembolso) e veja o balanço do mês fechar — quanto entrou, quanto saiu e quanto sobrou pra vocês.',
      icon: <IconChart />,
    },
    {
      title: 'Extrato PDF + visão do mês',
      desc: 'Donut por categoria, comparação com o mês anterior, quanto cada um comprometeu da renda — e um PDF profissional pra guardar ou compartilhar.',
      icon: <IconDoc />,
    },
    {
      title: 'Recorrentes, parcelas e sync',
      desc: 'Aluguel, Netflix, parcelado da geladeira: cadastra uma vez, debita todo mês até quitar. E tudo sincroniza nos dois celulares na hora — sem mandar print pro outro.',
      icon: <IconRepeat />,
    },
  ]

  return (
    <section style={{ padding: '108px 24px', background: C.bgDeep }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <SectionHeader kicker="O que vocês ganham" title="Tudo que vocês precisam pra parar de brigar." />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
            gap: 20,
            marginTop: 56,
            maxWidth: 820,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {items.map((it, i) => (
            <Reveal key={it.title} delay={(i % 2) * 90}>
              <div
                className="pl-card-hover"
                style={{ background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 4, padding: '32px 28px', height: '100%' }}
              >
                <div
                  style={{
                    width: 44, height: 44,
                    borderRadius: 10,
                    background: C.brassDim,
                    color: C.brass,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  {it.icon}
                </div>
                <h3 className="pl-display" style={{ fontSize: 21, fontWeight: 600, color: C.ink, marginBottom: 8, letterSpacing: '-0.01em' }}>
                  {it.title}
                </h3>
                <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.6 }}>
                  {it.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────── TESTIMONIALS ──

function Testimonials() {
  const items = [
    {
      quote: "Eu achava que a gente não precisava de app, que era só 'conversar melhor'. Aí no primeiro fechamento do mês a gente descobriu que eu pagava 70% de tudo sem perceber. Hoje é proporcional e ninguém se sente injustiçado.",
      name: 'Michel',
      meta: 'Junto há 5 anos · Londrina',
      initials: 'M',
    },
    {
      quote: "A gente tinha uma planilha que só eu atualizava. Virava cobrança: 'você não lançou o mercado'. No Pacto cada um lança na hora, do próprio celular, e aparece pro outro em tempo real. Acabou o 'manda print'.",
      name: 'Marcelo e Raquel',
      meta: 'Morando juntos há 10 anos · São Paulo',
      initials: 'M&R',
    },
    {
      quote: "Ele ganha quase o dobro de mim e o 50/50 me sufocava, mas eu tinha vergonha de falar. O modo proporcional resolveu sem precisar de DR. Foi o app que fez a conversa difícil pela gente.",
      name: 'Fabiana',
      meta: 'Noiva · Curitiba',
      initials: 'F',
    },
  ]

  return (
    <section style={{ padding: '108px 24px', background: C.bg }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <SectionHeader
          kicker="Quem já fez o Pacto"
          title="Casais que pararam de brigar por causa de dinheiro."
        />
        <div className="pl-testimonials" style={{ marginTop: 52 }}>
          {items.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <figure
                className="pl-card-hover"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.hair}`,
                  borderRadius: 4,
                  padding: '30px 28px',
                  margin: 0,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div className="pl-display" aria-hidden style={{ fontSize: 52, lineHeight: 0.5, color: C.brass, fontWeight: 600, marginBottom: 12 }}>
                  &ldquo;
                </div>
                <blockquote style={{ margin: 0, fontSize: 17, color: C.inkSoft, lineHeight: 1.65, flex: 1 }}>
                  {t.quote}
                </blockquote>
                <figcaption style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    aria-hidden
                    style={{
                      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                      background: C.brassDim, border: `1px solid ${C.brass}`, color: C.brass,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, letterSpacing: '0.02em',
                    }}
                  >
                    {t.initials}
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 16, color: C.ink, fontWeight: 600 }}>{t.name}</span>
                    <span style={{ fontSize: 12.5, color: C.muted }}>{t.meta}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────── FOR WHOM ──

function ForWhom() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: '128px 24px' }}>
      <video className="pl-whom-bg" autoPlay muted loop playsInline preload="auto" poster="/scene-desk.jpg">
        <source src="/whom-bg.mp4" type="video/mp4" />
      </video>
      <div className="pl-whom-scrim" aria-hidden />
      <Reveal style={{ position: 'relative', zIndex: 2, maxWidth: 760, margin: '0 auto', textAlign: 'center', padding: '8px 28px 24px', background: 'radial-gradient(120% 100% at 50% 40%, rgba(9,13,28,0.74) 0%, rgba(9,13,28,0.32) 55%, transparent 80%)' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.22em', color: C.brass, fontWeight: 600, marginBottom: 18 }}>
          Pra quem é
        </div>
        <h2 className="pl-display" style={{ fontSize: 'clamp(32px, 4.5vw, 45px)', fontWeight: 500, color: C.ink, letterSpacing: '-0.015em', lineHeight: 1.2, textShadow: '0 2px 22px rgba(9,13,28,0.8)' }}>
          Pra casais que dividem<br />a <em style={{ color: C.brass, fontStyle: 'italic' }}>vida</em>, não só a conta da pizza.
        </h2>
        <p style={{ fontSize: 19, color: C.ink, lineHeight: 1.65, marginTop: 24, textShadow: '0 2px 16px rgba(9,13,28,0.8)' }}>
          Casados, namorando há tempo, dividindo aluguel pela primeira vez. Com renda igual ou desigual.
          Hétero, gay, lésbico. Casais com filhos, sem filhos, com gato. Pacto é pra quem decidiu construir junto — e quer ter clareza, não tensão.
        </p>
      </Reveal>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────── PRICING ──

function Pricing() {
  return (
    <section id="preco" style={{ padding: '108px 24px', background: C.bg }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <SectionHeader
          kicker="Preço justo"
          title="Menos que o jantar onde vocês brigaram."
          sub="Comece grátis. Sem cartão. Cancele a qualquer momento."
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
            marginTop: 56,
            maxWidth: 760,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <Reveal>
            <div style={{ background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 6, padding: '36px 32px', height: '100%' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Trial
              </div>
              <div className="pl-display" style={{ fontSize: 52, fontWeight: 500, color: C.ink, marginTop: 12, letterSpacing: '-0.02em' }}>
                Grátis
              </div>
              <div style={{ fontSize: 16, color: C.muted, marginTop: 6 }}>
                14 dias completos. Sem cartão.
              </div>
              <ul style={ulStyle}>
                <Li>Tudo do Pacto</Li>
                <Li>Extrato PDF ilimitado</Li>
                <Li>Histórico de meses</Li>
                <Li>Sem cobranças surpresa</Li>
              </ul>
              <SmartCTA variant="pricing-outlined" />
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div style={{ background: C.surfaceHi, border: `1px solid ${C.brass}`, borderRadius: 6, padding: '36px 32px', position: 'relative', height: '100%' }}>
              <div
                style={{
                  position: 'absolute',
                  top: -13, right: 24,
                  background: C.brass,
                  color: C.bg,
                  padding: '5px 12px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Após o trial
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.brass, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Pacto
              </div>
              <div className="pl-display" style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 12 }}>
                <span style={{ fontSize: 25, color: C.muted, fontWeight: 500 }}>R$</span>
                <span style={{ fontSize: 52, fontWeight: 500, color: C.ink, letterSpacing: '-0.02em' }}>29,90</span>
                <span style={{ fontSize: 16, color: C.muted, fontFamily: 'var(--font-body)' }}>/ mês</span>
              </div>
              <div style={{ fontSize: 16, color: C.muted, marginTop: 6 }}>
                Menos de <strong style={{ color: C.ink }}>R$ 1 por dia</strong>. Casal inteiro inclusive.
              </div>
              <ul style={ulStyle}>
                <Li>Tudo do trial</Li>
                <Li>Sync entre 2 celulares em tempo real</Li>
                <Li>Suporte por e-mail</Li>
                <Li>Cancele quando quiser</Li>
              </ul>
              <SmartCTA variant="pricing-filled" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

const ulStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '24px 0 0',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, color: C.inkSoft }}>
      <span style={{ color: C.brass, display: 'inline-flex', flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </span>
      {children}
    </li>
  )
}

// ─────────────────────────────────────────────────────────────── FAQ ──

function FAQ() {
  const items = [
    {
      q: 'Funciona pra namorados também ou só pra casados?',
      a: 'Funciona pra qualquer casal que divide despesas — namorando, morando junto, casado, união estável. Não exige certidão.',
    },
    {
      q: 'E se a gente já tem conta conjunta?',
      a: 'Pacto registra "quem pagou" independente da conta usada. Se vocês têm conta conjunta, registra como "pago pelo casal". Se cada um paga do seu, registra com a pessoa certa. Saldo final reflete a verdade.',
    },
    {
      q: 'Meus dados ficam guardados onde?',
      a: 'Na nuvem, criptografados em trânsito e em repouso, e sincronizados em tempo real entre os celulares de vocês dois. O acesso é restrito ao casal — ninguém de fora vê seus lançamentos. Você exporta tudo em PDF quando quiser, e excluir a conta apaga os dados de verdade.',
    },
    {
      q: 'Posso usar sozinho enquanto minha parceira não baixa?',
      a: 'Pode. Você começa registrando sozinho e, quando ela entrar pelo código de convite, tudo que você já lançou aparece no celular dela na hora. Daí em diante, todo gasto que um lançar o outro vê em tempo real.',
    },
    {
      q: 'O que acontece se a gente terminar?',
      a: 'Cada um pode exportar o histórico em PDF e zerar o app. Sem drama, sem custo. Esperamos que não precise.',
    },
    {
      q: 'Funciona offline?',
      a: 'Funciona. Você lança os gastos mesmo sem internet — fica salvo no seu celular — e, assim que conectar, tudo sincroniza sozinho com o celular do seu par.',
    },
  ]

  return (
    <section style={{ padding: '108px 24px', background: C.bgDeep }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <SectionHeader kicker="Dúvidas comuns" title="O que vocês querem saber." />

        <div style={{ marginTop: 44 }}>
          {items.map((it, i) => (
            <Reveal key={i} delay={(i % 3) * 70}>
              <details style={{ borderTop: `1px solid ${C.hair}`, padding: '20px 0' }}>
                <summary
                  style={{
                    cursor: 'pointer',
                    fontSize: 18,
                    fontWeight: 600,
                    color: C.ink,
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
                    alignItems: 'center',
                  }}
                >
                  {it.q}
                  <span style={{ color: C.brass, fontSize: 27, lineHeight: 1, fontWeight: 300 }}>+</span>
                </summary>
                <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.7, marginTop: 12, paddingRight: 24 }}>
                  {it.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <a href="/ajuda" className="pl-link" style={{ color: C.brass, textDecoration: 'none', fontSize: 17, fontWeight: 600 }}>
            Já é usuário? Ver guia completo →
          </a>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────── FINAL CTA ──

function FinalCTA() {
  return (
    <section style={{ padding: '116px 24px', background: C.bg, position: 'relative', overflow: 'hidden' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 620, height: 620,
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(201,162,94,0.10) 0%, transparent 68%)',
          top: -220, left: '50%', transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }}
      />
      <Reveal>
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <LogoMark size={46} />
          <h2 className="pl-display" style={{ fontSize: 'clamp(38px, 6.1vw, 59px)', fontWeight: 500, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.08, marginTop: 24 }}>
            Casa em paz começa<br />
            <span style={{ color: C.brass, fontStyle: 'italic' }}>nas contas.</span>
          </h2>
          <p style={{ fontSize: 20, color: C.inkSoft, marginTop: 20, lineHeight: 1.55 }}>
            Comecem o pacto hoje. Em 5 minutos vocês têm clareza pra resto da vida a dois.
          </p>
          <div style={{ marginTop: 32 }}>
            <SmartCTA variant="final" />
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 14 }}>
            Sem cartão. Sem pegadinha.
          </div>
        </div>
      </Reveal>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────── FOOTER ──

function Footer() {
  return (
    <footer style={{ padding: '40px 24px', background: C.bg, borderTop: `1px solid ${C.hair}` }}>
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LogoMark size={22} />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: C.ink }}>
            PACTO
          </span>
          <span style={{ fontSize: 12, color: C.muted, marginLeft: 8 }}>
            © 2026
          </span>
        </div>
        <nav style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center', fontSize: 12.5 }}>
          <Link href="/blog" className="pl-link" style={footerLinkStyle}>Blog</Link>
          <Link href="/instalar" className="pl-link" style={footerLinkStyle}>Instalar app</Link>
          <Link href="/ajuda" className="pl-link" style={footerLinkStyle}>Ajuda</Link>
          <Link href="/privacidade" className="pl-link" style={footerLinkStyle}>Privacidade</Link>
          <Link href="/termos" className="pl-link" style={footerLinkStyle}>Termos</Link>
        </nav>
      </div>
    </footer>
  )
}

const footerLinkStyle: React.CSSProperties = {
  color: C.muted,
  textDecoration: 'none',
  fontWeight: 500,
}

// ─────────────────────────────────────────────────────────────── HELPERS ──

function SectionHeader({ kicker, title, sub, light }: { kicker: string; title: string; sub?: string; light?: boolean }) {
  const accent = light ? LIGHT.bronze : C.brass
  const titleColor = light ? LIGHT.ink : C.ink
  const subColor = light ? LIGHT.body : C.muted
  return (
    <Reveal style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <span style={{ width: 18, height: 1, background: accent }} />
        <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: accent, fontWeight: 600 }}>
          {kicker}
        </span>
        <span style={{ width: 18, height: 1, background: accent }} />
      </div>
      <h2 className="pl-display" style={{ fontSize: 'clamp(31px, 4.5vw, 45px)', fontWeight: 500, color: titleColor, letterSpacing: '-0.015em', lineHeight: 1.18 }}>
        {title}
      </h2>
      {sub && (
        <p style={{ fontSize: 18, color: subColor, marginTop: 16, lineHeight: 1.6, maxWidth: 580, marginLeft: 'auto', marginRight: 'auto' }}>
          {sub}
        </p>
      )}
    </Reveal>
  )
}

function IconScale() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 16 L20 8 L8 8 Z" />
      <path d="M4 16 L8 8 L4 8 Z" transform="translate(4 0)" />
      <path d="M12 4 v16" />
      <path d="M8 20 h8" />
    </svg>
  )
}
function IconDoc() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="16" y2="16" />
    </svg>
  )
}
function IconChart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
function IconRepeat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  )
}
