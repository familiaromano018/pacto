import Link from 'next/link'
import { Logo, LogoMark } from '@/components/Logo'

export const metadata = {
  title: 'Pacto — Uma casa merece paz',
  description: 'Casa em paz começa nas contas. 53% dos brasileiros brigam por dinheiro. Vocês não precisam.',
}

export default function LandingPage() {
  return (
    <main style={{ background: '#0b0b10', color: '#f4f4f6', minHeight: '100vh', overflow: 'hidden' }}>
      <Nav />
      <Hero />
      <ProblemStats />
      <HowItWorks />
      <Comparison />
      <Features />
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
        background: 'rgba(11,11,16,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
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
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#f4f4f6',
          }}
        >
          PACTO
        </span>
        <nav style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 22 }}>
          <a href="#problema" style={navLinkStyle}>O problema</a>
          <a href="#como" style={navLinkStyle}>Como funciona</a>
          <a href="#preco" style={navLinkStyle}>Preço</a>
          <Link
            href="/"
            style={{
              background: '#5b8dff',
              color: '#fff',
              padding: '9px 18px',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            Começar grátis
          </Link>
        </nav>
      </div>
    </header>
  )
}

const navLinkStyle: React.CSSProperties = {
  color: '#a0a3ad',
  fontSize: 13,
  fontWeight: 500,
  textDecoration: 'none',
}

// ─────────────────────────────────────────────────────────────── HERO ──

function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        padding: '90px 24px 80px',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Glow decorativo */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -200,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 600,
          background: 'radial-gradient(ellipse at center, rgba(91,141,255,0.18) 0%, rgba(91,141,255,0) 60%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', maxWidth: 880, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <Logo size={72} wordColor="#f4f4f6" />
        </div>

        <h1
          style={{
            fontSize: 'clamp(38px, 6vw, 64px)',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            lineHeight: 1.05,
            color: '#fff',
            margin: 0,
          }}
        >
          Casa em paz começa<br />
          <span
            style={{
              background: 'linear-gradient(135deg, #c5c8cf 0%, #d4af6a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            nas contas.
          </span>
        </h1>

        <p
          style={{
            fontSize: 18,
            color: '#a0a3ad',
            marginTop: 22,
            maxWidth: 580,
            margin: '22px auto 0',
            lineHeight: 1.55,
          }}
        >
          <strong style={{ color: '#fff', fontWeight: 600 }}>53% dos brasileiros</strong> brigam com o parceiro por causa de dinheiro. Vocês não precisam.
        </p>

        <p
          style={{
            fontSize: 16,
            color: '#a0a3ad',
            marginTop: 16,
            maxWidth: 560,
            margin: '16px auto 0',
            lineHeight: 1.55,
          }}
        >
          Pacto registra cada gasto, divide do jeito que vocês combinaram, e fecha o mês com saldo claro. Sem palpite. Sem memória seletiva. Sem ressentimento acumulando.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 14,
            marginTop: 38,
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/"
            style={{
              background: '#5b8dff',
              color: '#fff',
              padding: '15px 28px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
              boxShadow: '0 12px 28px rgba(91,141,255,0.4)',
            }}
          >
            Comece o pacto · grátis
          </Link>
          <a
            href="#como"
            style={{
              background: 'rgba(255,255,255,0.04)',
              color: '#f4f4f6',
              padding: '15px 28px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            Como funciona →
          </a>
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 12,
            color: '#71747e',
            letterSpacing: '0.04em',
          }}
        >
          Grátis pra testar. Sem cartão de crédito.
        </div>
      </div>

      {/* Big number floating below */}
      <div
        style={{
          position: 'relative',
          marginTop: 80,
          maxWidth: 880,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(91,141,255,0.08) 0%, rgba(212,175,106,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 24,
            padding: '40px 32px',
          }}
        >
          <div
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: '#a0a3ad',
              fontWeight: 600,
            }}
          >
            IBGE · Pesquisa Nacional
          </div>
          <div
            style={{
              fontSize: 'clamp(64px, 12vw, 120px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              marginTop: 12,
              background: 'linear-gradient(135deg, #fff 0%, #d4af6a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            60%
          </div>
          <div
            style={{
              fontSize: 20,
              color: '#f4f4f6',
              fontWeight: 500,
              marginTop: 8,
              maxWidth: 540,
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.4,
            }}
          >
            dos divórcios no Brasil têm dinheiro como motivo principal.
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────── PROBLEM STATS ──

function ProblemStats() {
  const stats = [
    {
      headline: '74%',
      label: 'dos casais que dividem despesas',
      sub: 'discutem sobre dinheiro 3+ vezes por semana.',
      source: 'Estudo BR 2024',
      accent: '#5b8dff',
    },
    {
      headline: '63%',
      label: 'das mulheres sofrem desgaste emocional',
      sub: 'quando precisam arcar com metade ou mais das despesas.',
      source: 'Estudo BR 2024',
      accent: '#d4af6a',
    },
    {
      headline: '49%',
      label: 'já esconderam algo financeiro',
      sub: 'do parceiro. A briga começa antes da briga.',
      source: 'Serasa · Opinion Box, mai/2025',
      accent: '#a78bfa',
    },
  ]

  return (
    <section id="problema" style={{ padding: '110px 24px', background: '#0b0b10' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <SectionHeader
          kicker="O problema"
          title="Não é briga. É falta de combinado."
          sub="Casal sem método tenta resolver na conversa, e conversa vira ressentimento. Os números mostram que isso é regra, não exceção."
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            marginTop: 56,
          }}
        >
          {stats.map((s) => (
            <div
              key={s.headline}
              style={{
                background: '#16161c',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20,
                padding: '32px 28px',
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 800,
                  color: s.accent,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                {s.headline}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: '#f4f4f6',
                  fontWeight: 600,
                  marginTop: 14,
                  lineHeight: 1.35,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: '#a0a3ad',
                  marginTop: 6,
                  lineHeight: 1.5,
                }}
              >
                {s.sub}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#71747e',
                  marginTop: 18,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                }}
              >
                {s.source}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────── HOW IT WORKS ──

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Combinem uma vez',
      desc: '50/50 fixo ou proporcional à renda. Vocês decidem como dividir as contas do casal.',
    },
    {
      n: '02',
      title: 'Registrem os gastos',
      desc: 'Cada despesa entra no extrato compartilhado. Avulso, fixo ou parcelado — categorizado e ratado automaticamente.',
    },
    {
      n: '03',
      title: 'Fechem o mês em paz',
      desc: 'No fim do mês, Pacto mostra o saldo claro: quem deve quanto pra quem. Ou se ninguém deve nada.',
    },
  ]

  return (
    <section id="como" style={{ padding: '110px 24px', background: '#13131a' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <SectionHeader
          kicker="Como funciona"
          title="Três passos. Zero planilha."
          sub="Pacto faz a conta. Vocês vivem a relação."
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            marginTop: 56,
          }}
        >
          {steps.map((s) => (
            <div
              key={s.n}
              style={{
                padding: '36px 28px',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#5b8dff',
                  letterSpacing: '0.15em',
                }}
              >
                {s.n}
              </div>
              <h3
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#fff',
                  marginTop: 14,
                  letterSpacing: '-0.015em',
                  lineHeight: 1.2,
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: '#a0a3ad',
                  marginTop: 10,
                  lineHeight: 1.6,
                }}
              >
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────── COMPARISON ──

function Comparison() {
  return (
    <section style={{ padding: '110px 24px', background: '#0b0b10' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <SectionHeader
          kicker="Pacto vs. tudo o que você já tentou"
          title="Não é dividir conta de pizza. É vida a dois."
          sub="Os apps que existem foram feitos pra amigos. Pacto entende que casal é diferente."
        />

        <div
          style={{
            marginTop: 56,
            background: '#16161c',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 24,
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th style={thStyle}></th>
                <th style={{ ...thStyle, color: '#fff', fontWeight: 700 }}>Pacto</th>
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
                ['Sync entre 2 celulares', 'em breve', true, false, false],
                ['Pensado pra casal (não amigos)', true, false, false, false],
              ].map(([feat, p, s, m, pl], i) => (
                <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ ...tdStyle, color: '#f4f4f6', fontWeight: 500, textAlign: 'left' }}>{feat as string}</td>
                  <td style={tdStyle}><Cell v={p} brand /></td>
                  <td style={tdStyle}><Cell v={s} /></td>
                  <td style={tdStyle}><Cell v={m} /></td>
                  <td style={tdStyle}><Cell v={pl} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

const thStyle: React.CSSProperties = {
  padding: '18px 16px',
  fontSize: 13,
  fontWeight: 600,
  color: '#a0a3ad',
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  fontSize: 14,
  textAlign: 'center',
  color: '#a0a3ad',
}

function Cell({ v, brand }: { v: boolean | string; brand?: boolean }) {
  if (v === true) {
    return (
      <span
        style={{
          display: 'inline-flex',
          width: 22, height: 22,
          borderRadius: '50%',
          background: brand ? '#5b8dff' : 'rgba(52,211,153,0.18)',
          color: brand ? '#fff' : '#34d399',
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
    return <span style={{ color: '#3f3f46', fontSize: 16 }}>—</span>
  }
  return (
    <span
      style={{
        fontSize: 11,
        color: '#a0a3ad',
        background: 'rgba(255,255,255,0.04)',
        padding: '3px 8px',
        borderRadius: 6,
        fontWeight: 600,
      }}
    >
      {v}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────── FEATURES ──

function Features() {
  const items = [
    {
      title: 'Rateio justo, sem palpite',
      desc: 'Combine 50/50 fixo ou proporcional à renda. Pacto calcula tudo sozinho. A balança da justiça financeira.',
      icon: <IconScale />,
    },
    {
      title: 'Extrato PDF do mês',
      desc: 'No fim do mês, gere um PDF profissional com todas as despesas, totais por categoria e saldo final. Compartilhe ou guarde.',
      icon: <IconDoc />,
    },
    {
      title: 'Visão completa',
      desc: 'Donut por categoria, comparação com mês anterior, comprometimento de renda. Tudo num só lugar.',
      icon: <IconChart />,
    },
    {
      title: 'Recorrentes inteligentes',
      desc: 'Aluguel, Netflix, academia, parcelado da geladeira. Cadastra uma vez, debita todo mês até quitar.',
      icon: <IconRepeat />,
    },
  ]

  return (
    <section style={{ padding: '110px 24px', background: '#13131a' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <SectionHeader
          kicker="O que vem na caixa"
          title="Tudo que vocês precisam pra parar de brigar."
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            marginTop: 56,
          }}
        >
          {items.map((it) => (
            <div
              key={it.title}
              style={{
                background: '#0b0b10',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20,
                padding: '32px 28px',
              }}
            >
              <div
                style={{
                  width: 44, height: 44,
                  borderRadius: 12,
                  background: 'rgba(91,141,255,0.12)',
                  color: '#5b8dff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                {it.icon}
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 8,
                  letterSpacing: '-0.01em',
                }}
              >
                {it.title}
              </h3>
              <p style={{ fontSize: 14, color: '#a0a3ad', lineHeight: 1.6 }}>
                {it.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────── FOR WHOM ──

function ForWhom() {
  return (
    <section style={{ padding: '110px 24px', background: '#0b0b10' }}>
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: '#5b8dff',
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          Pra quem é
        </div>
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          Pra casais que dividem<br />a <em style={{ color: '#d4af6a', fontStyle: 'italic' }}>vida</em>, não só a conta da pizza.
        </h2>
        <p
          style={{
            fontSize: 17,
            color: '#a0a3ad',
            lineHeight: 1.65,
            marginTop: 24,
          }}
        >
          Casados, namorando há tempo, dividindo aluguel pela primeira vez. Com renda igual ou desigual.
          Hétero, gay, lésbico. Casais com filhos, sem filhos, com gato. Pacto é pra quem decidiu construir junto — e quer ter clareza, não tensão.
        </p>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────── PRICING ──

function Pricing() {
  return (
    <section id="preco" style={{ padding: '110px 24px', background: '#13131a' }}>
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
          <div
            style={{
              background: '#0b0b10',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24,
              padding: '36px 32px',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#a0a3ad', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Trial
            </div>
            <div style={{ fontSize: 44, fontWeight: 800, color: '#fff', marginTop: 14, letterSpacing: '-0.03em' }}>
              Grátis
            </div>
            <div style={{ fontSize: 14, color: '#a0a3ad', marginTop: 6 }}>
              30 dias completos. Sem cartão.
            </div>
            <ul style={ulStyle}>
              <Li>Tudo do Pacto</Li>
              <Li>Extrato PDF ilimitado</Li>
              <Li>Histórico de meses</Li>
              <Li>Sem cobranças surpresa</Li>
            </ul>
            <Link
              href="/"
              style={{
                display: 'block',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                padding: '14px 0',
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                textAlign: 'center',
                marginTop: 28,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              Começar grátis
            </Link>
          </div>

          <div
            style={{
              background: 'linear-gradient(180deg, rgba(91,141,255,0.10) 0%, rgba(91,141,255,0.02) 100%)',
              border: '1px solid rgba(91,141,255,0.35)',
              borderRadius: 24,
              padding: '36px 32px',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -14, right: 24,
                background: '#5b8dff',
                color: '#fff',
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
            <div style={{ fontSize: 13, fontWeight: 700, color: '#5b8dff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Pacto
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 14 }}>
              <span style={{ fontSize: 22, color: '#a0a3ad', fontWeight: 600 }}>R$</span>
              <span style={{ fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>14,90</span>
              <span style={{ fontSize: 14, color: '#a0a3ad' }}>/ mês</span>
            </div>
            <div style={{ fontSize: 14, color: '#a0a3ad', marginTop: 6 }}>
              Um único plano. Casal inteiro inclusive.
            </div>
            <ul style={ulStyle}>
              <Li>Tudo do trial</Li>
              <Li>Sync entre 2 celulares (em breve)</Li>
              <Li>Suporte por e-mail</Li>
              <Li>Cancele quando quiser</Li>
            </ul>
            <Link
              href="/"
              style={{
                display: 'block',
                background: '#5b8dff',
                color: '#fff',
                padding: '14px 0',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                textAlign: 'center',
                marginTop: 28,
                boxShadow: '0 8px 24px rgba(91,141,255,0.35)',
              }}
            >
              Começar agora
            </Link>
          </div>
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
    <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#cacace' }}>
      <span
        style={{
          width: 18, height: 18,
          borderRadius: '50%',
          background: 'rgba(52,211,153,0.15)',
          color: '#34d399',
          display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
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
      a: 'Hoje, no seu próprio dispositivo (localStorage). Não enviamos nada pra servidor. Quando ativarmos sync entre celulares, vai ser criptografado e privado pro casal — ninguém de fora vê.',
    },
    {
      q: 'Posso usar sozinho enquanto minha parceira não baixa?',
      a: 'Pode. Começa registrando sozinho. Quando ela entrar, gera um código de convite e ela vê os mesmos dados.',
    },
    {
      q: 'O que acontece se a gente terminar?',
      a: 'Cada um pode exportar o histórico em PDF e zerar o app. Sem drama, sem custo. Esperamos que não precise.',
    },
    {
      q: 'Funciona offline?',
      a: 'Sim. Tudo roda no seu celular. Internet só pra exportar PDF e (no futuro) sync.',
    },
  ]

  return (
    <section style={{ padding: '110px 24px', background: '#0b0b10' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <SectionHeader
          kicker="Dúvidas comuns"
          title="O que vocês querem saber."
        />

        <div style={{ marginTop: 48 }}>
          {items.map((it, i) => (
            <details
              key={i}
              style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: '20px 0',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#f4f4f6',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  alignItems: 'center',
                }}
              >
                {it.q}
                <span style={{ color: '#5b8dff', fontSize: 24, lineHeight: 1, fontWeight: 300 }}>+</span>
              </summary>
              <p
                style={{
                  fontSize: 14,
                  color: '#a0a3ad',
                  lineHeight: 1.7,
                  marginTop: 12,
                  paddingRight: 24,
                }}
              >
                {it.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────── FINAL CTA ──

function FinalCTA() {
  return (
    <section style={{ padding: '110px 24px', background: '#13131a', position: 'relative', overflow: 'hidden' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(91,141,255,0.12) 0%, transparent 70%)',
          top: -200, left: '50%', transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <LogoMark size={48} />
        <h2
          style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            marginTop: 24,
          }}
        >
          Vocês não vão ser<br />uma estatística.
        </h2>
        <p style={{ fontSize: 17, color: '#a0a3ad', marginTop: 18, lineHeight: 1.55 }}>
          Comecem o pacto. Em 5 minutos vocês têm clareza pra resto da vida.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            background: '#5b8dff',
            color: '#fff',
            padding: '16px 32px',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 16,
            textDecoration: 'none',
            marginTop: 32,
            boxShadow: '0 14px 32px rgba(91,141,255,0.45)',
          }}
        >
          Comece o pacto · grátis
        </Link>
        <div style={{ fontSize: 12, color: '#71747e', marginTop: 14 }}>
          Sem cartão. Sem pegadinha.
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────── FOOTER ──

function Footer() {
  return (
    <footer
      style={{
        padding: '40px 24px',
        background: '#0b0b10',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
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
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: '#f4f4f6' }}>
            PACTO
          </span>
          <span style={{ fontSize: 12, color: '#71747e', marginLeft: 8 }}>
            © 2026
          </span>
        </div>
        <div style={{ fontSize: 12, color: '#71747e' }}>
          Uma casa merece paz.
        </div>
      </div>
    </footer>
  )
}

// ─────────────────────────────────────────────────────────────── HELPERS ──

function SectionHeader({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: '#5b8dff',
          fontWeight: 600,
          marginBottom: 14,
        }}
      >
        {kicker}
      </div>
      <h2
        style={{
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            fontSize: 16,
            color: '#a0a3ad',
            marginTop: 16,
            lineHeight: 1.6,
            maxWidth: 580,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {sub}
        </p>
      )}
    </div>
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
