import type { CSSProperties, ReactNode } from 'react'

// Cores reais do app (dark)
export const A = {
  bg: '#0b0b10',
  card: '#16161c',
  card2: '#1d1d24',
  ink: '#f4f4f6',
  muted: '#8b8b94',
  hair: 'rgba(255,255,255,0.07)',
  brand: '#5b8dff',
  coral: '#FF6B6B', // Ana
  teal: '#4ECDC4', // Bruno
  fixed: '#8b5cf6',
  success: '#34d399',
  danger: '#f87171',
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 248,
        background: '#05060a',
        borderRadius: 42,
        padding: 9,
        boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ position: 'relative', background: A.bg, borderRadius: 34, overflow: 'hidden', height: 510 }}>
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 78, height: 22, background: '#000', borderRadius: 999, zIndex: 5 }} />
        <div style={{ height: '100%', overflow: 'hidden', fontFamily: 'var(--font-body), system-ui, sans-serif' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function ScreenHeader({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '42px 18px 12px' }}>
      <span style={{ fontSize: 17, fontWeight: 700, color: A.ink }}>{title}</span>
      <span style={{ display: 'flex' }}>
        <span style={{ width: 22, height: 22, borderRadius: '50%', background: A.coral, color: '#3a0f0f', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid ' + A.bg }}>A</span>
        <span style={{ width: 22, height: 22, borderRadius: '50%', background: A.teal, color: '#0a2e2b', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid ' + A.bg, marginLeft: -6 }}>B</span>
      </span>
    </div>
  )
}

const px = (n: number): CSSProperties => ({ padding: `0 ${n}px` })

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ background: A.card, border: `1px solid ${A.hair}`, borderRadius: 12, padding: '11px 12px' }}>
      <div style={{ fontSize: 9.5, color: A.muted }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: accent, marginTop: 3 }}>{value}</div>
    </div>
  )
}

function Mini({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ background: A.card, border: `1px solid ${A.hair}`, borderRadius: 11, padding: '9px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: 8.5, color: A.muted }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 800, color: accent, marginTop: 2 }}>{value}</div>
    </div>
  )
}

/** Tela — Como dividir (Setup) */
export function ScreenDivisao() {
  const opts = [
    { t: '50 / 50', s: 'Metade pra cada', on: true },
    { t: 'Proporcional à renda', s: 'Quem ganha mais paga mais', on: false },
    { t: 'Conta única', s: 'Tudo do bolso comum', on: false },
    { t: 'Por categorias', s: 'Você o aluguel, ela o mercado', on: false },
  ]
  return (
    <>
      <ScreenHeader title="A divisão" />
      <div style={{ ...px(14), marginTop: 4, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {opts.map((o) => (
          <div key={o.t} style={{ display: 'flex', alignItems: 'center', gap: 11, background: o.on ? 'rgba(91,141,255,0.10)' : A.card, border: `1px solid ${o.on ? A.brand : A.hair}`, borderRadius: 12, padding: '12px 13px' }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: A.ink }}>{o.t}</span>
              <span style={{ display: 'block', fontSize: 10.5, color: A.muted, marginTop: 1 }}>{o.s}</span>
            </span>
            <span style={{ width: 19, height: 19, borderRadius: '50%', flexShrink: 0, border: `2px solid ${o.on ? A.brand : 'rgba(255,255,255,0.2)'}`, background: o.on ? A.brand : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {o.on && (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
              )}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

/** Tela — Lançar um gasto */
export function ScreenLancar() {
  return (
    <>
      <ScreenHeader title="Novo gasto" />
      <div style={{ ...px(16), marginTop: 8, textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: A.muted }}>Valor</div>
        <div style={{ fontSize: 36, fontWeight: 800, color: A.ink, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 2 }}>R$ 254,40</div>
      </div>
      <div style={{ ...px(16), marginTop: 16 }}>
        <Field label="Categoria"><span style={{ fontSize: 15 }}>🛒</span><b style={{ fontSize: 13, color: A.ink }}>Mercado</b></Field>
        <div style={{ height: 9 }} />
        <div style={{ fontSize: 10, color: A.muted, marginBottom: 6 }}>Quem pagou</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Pill label="Ana" color={A.coral} on={false} />
          <Pill label="Bruno" color={A.teal} on />
        </div>
        <div style={{ height: 12 }} />
        <Field label="Método"><span style={{ fontSize: 14 }}>⚡</span><b style={{ fontSize: 13, color: A.ink }}>Pix</b></Field>
      </div>
      <div style={{ ...px(16), marginTop: 18 }}>
        <div style={{ background: A.brand, color: '#fff', fontSize: 14, fontWeight: 700, borderRadius: 12, padding: '13px 0', textAlign: 'center' }}>Salvar gasto</div>
      </div>
    </>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: A.muted, marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: A.card, border: `1px solid ${A.hair}`, borderRadius: 11, padding: '11px 13px' }}>{children}</div>
    </div>
  )
}

function Pill({ label, color, on }: { label: string; color: string; on: boolean }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 11, padding: '10px 0', background: on ? color : A.card, border: `1px solid ${on ? color : A.hair}` }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: on ? '#fff' : color }} />
      <span style={{ fontSize: 12.5, fontWeight: 700, color: on ? '#0b0b10' : A.ink }}>{label}</span>
    </div>
  )
}

/** Tela — Saldo do mês */
export function ScreenSaldo() {
  return (
    <>
      <ScreenHeader title="Junho" />
      <div style={{ margin: '6px 16px 0', borderRadius: 18, padding: '22px 18px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,107,107,0.16) 0%, rgba(78,205,196,0.16) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 12, color: A.muted }}>
          <strong style={{ color: A.teal }}>Bruno</strong> deve pra <strong style={{ color: A.coral }}>Ana</strong>
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: A.ink, letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1, whiteSpace: 'nowrap' }}>R$ 184,50</div>
        <div style={{ marginTop: 14, background: A.brand, color: '#fff', fontSize: 13, fontWeight: 700, borderRadius: 999, padding: '9px 0' }}>Fechar o mês →</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '14px 16px 0' }}>
        <Stat label="Total do mês" value="R$ 3.420" accent={A.brand} />
        <Stat label="Conta do casal" value="R$ 2.180" accent={A.fixed} />
        <Stat label="Ana comprometeu" value="38%" accent={A.coral} />
        <Stat label="Bruno comprometeu" value="29%" accent={A.teal} />
      </div>
    </>
  )
}

/** Tela — Lançamentos */
export function ScreenLista() {
  const items = [
    { emoji: '🛒', cat: 'Mercado', who: 'Bruno', color: A.teal, value: 'R$ 254,40' },
    { emoji: '🏠', cat: 'Aluguel', who: 'Casal', color: A.fixed, value: 'R$ 1.800,00' },
    { emoji: '🍕', cat: 'Restaurante', who: 'Ana', color: A.coral, value: 'R$ 187,60' },
    { emoji: '🚗', cat: 'Transporte', who: 'Bruno', color: A.teal, value: 'R$ 92,00' },
    { emoji: '📺', cat: 'Streaming', who: 'Casal', color: A.fixed, value: 'R$ 55,90' },
    { emoji: '💊', cat: 'Saúde', who: 'Ana', color: A.coral, value: 'R$ 130,00' },
  ]
  return (
    <>
      <ScreenHeader title="Lançamentos" />
      <div style={{ ...px(14), marginTop: 4, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((it) => (
          <div key={it.cat} style={{ display: 'flex', alignItems: 'center', gap: 11, background: A.card, border: `1px solid ${A.hair}`, borderRadius: 12, padding: '10px 12px' }}>
            <span style={{ fontSize: 17 }}>{it.emoji}</span>
            <span style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: A.ink }}>{it.cat}</span>
              <span style={{ fontSize: 10.5, color: it.color, fontWeight: 600 }}>{it.who}</span>
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: A.ink }}>{it.value}</span>
          </div>
        ))}
      </div>
    </>
  )
}

/** Tela — Visão (donut) */
export function ScreenVisao() {
  const donut = 'conic-gradient(' + A.fixed + ' 0% 34%, ' + A.teal + ' 34% 55%, ' + A.coral + ' 55% 73%, ' + A.brand + ' 73% 88%, ' + A.success + ' 88% 100%)'
  const legend = [
    { c: A.fixed, l: 'Casa', v: '34%' },
    { c: A.teal, l: 'Mercado', v: '21%' },
    { c: A.coral, l: 'Restaurante', v: '18%' },
    { c: A.brand, l: 'Transporte', v: '15%' },
    { c: A.success, l: 'Outros', v: '12%' },
  ]
  return (
    <>
      <ScreenHeader title="Visão do mês" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7, ...px(14), marginTop: 4 }}>
        <Mini label="Entrou" value="R$ 9.200" accent={A.success} />
        <Mini label="Saiu" value="R$ 3.420" accent={A.brand} />
        <Mini label="Sobrou" value="R$ 5.780" accent={A.success} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, ...px(16), marginTop: 18 }}>
        <div style={{ position: 'relative', width: 96, height: 96, borderRadius: '50%', background: donut, flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 15, borderRadius: '50%', background: A.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <span style={{ fontSize: 8.5, color: A.muted }}>Total</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: A.ink }}>R$ 3.420</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1, minWidth: 0 }}>
          {legend.map((g) => (
            <div key={g.l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: g.c, flexShrink: 0 }} />
              <span style={{ color: A.ink, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.l}</span>
              <span style={{ color: A.muted, fontWeight: 600, flexShrink: 0 }}>{g.v}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/** Tela — Metas */
export function ScreenMetas() {
  const goals = [
    { emoji: '✈️', t: 'Viagem Japão', cur: 'R$ 6.400', tot: 'R$ 10.000', p: 64, c: A.teal },
    { emoji: '🛟', t: 'Reserva', cur: 'R$ 4.000', tot: 'R$ 10.000', p: 40, c: A.success },
    { emoji: '🏡', t: 'Entrada do apê', cur: 'R$ 9.000', tot: 'R$ 40.000', p: 22, c: A.coral },
  ]
  return (
    <>
      <ScreenHeader title="Metas a dois" />
      <div style={{ ...px(14), marginTop: 4, display: 'flex', flexDirection: 'column', gap: 11 }}>
        {goals.map((g) => (
          <div key={g.t} style={{ background: A.card, border: `1px solid ${A.hair}`, borderRadius: 12, padding: '13px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ fontSize: 16 }}>{g.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: A.ink, flex: 1 }}>{g.t}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: g.c }}>{g.p}%</span>
            </div>
            <div style={{ height: 7, background: 'rgba(255,255,255,0.08)', borderRadius: 999, marginTop: 9, overflow: 'hidden' }}>
              <div style={{ width: g.p + '%', height: '100%', background: g.c, borderRadius: 999 }} />
            </div>
            <div style={{ fontSize: 10, color: A.muted, marginTop: 6 }}>{g.cur} <span style={{ opacity: 0.6 }}>de {g.tot}</span></div>
          </div>
        ))}
      </div>
    </>
  )
}
