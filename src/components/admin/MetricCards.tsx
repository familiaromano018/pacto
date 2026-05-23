import type { AdminMetrics } from '@/lib/admin/data'

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function MetricCards({ m }: { m: AdminMetrics }) {
  const items: { label: string; value: string; tone?: 'good' | 'warn' | 'bad' }[] = [
    { label: 'Total de casais', value: String(m.totalCouples) },
    { label: 'Trials ativos', value: String(m.activeTrials) },
    { label: 'Pagantes', value: String(m.paying), tone: 'good' },
    { label: 'MRR estimado', value: BRL.format(m.mrr), tone: 'good' },
    { label: 'Vencendo em ≤3 dias', value: String(m.expiringIn3Days), tone: 'warn' },
    { label: 'Inadimplentes', value: String(m.pastDue), tone: 'warn' },
    { label: 'Cancelados (30d)', value: String(m.churn30d), tone: 'bad' },
    { label: 'Novos casais (30d)', value: String(m.newCouples30d), tone: 'good' },
  ]
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
      }}
    >
      {items.map((it) => {
        const color =
          it.tone === 'good'
            ? 'var(--color-success)'
            : it.tone === 'warn'
              ? 'var(--color-warning-text)'
              : it.tone === 'bad'
                ? 'var(--color-danger)'
                : 'var(--color-text-primary)'
        return (
          <div
            key={it.label}
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 12,
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              {it.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color }}>{it.value}</div>
          </div>
        )
      })}
    </div>
  )
}
