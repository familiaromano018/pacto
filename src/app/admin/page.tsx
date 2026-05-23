import { requireAdmin } from '@/lib/admin/auth'
import { listCouples, computeMetrics, computeGrowth, PLAN_PRICE } from '@/lib/admin/data'
import MetricCards from '@/components/admin/MetricCards'
import CouplesTable from '@/components/admin/CouplesTable'
import GrowthChart from '@/components/admin/GrowthChart'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Admin · Pacto',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const { email } = await requireAdmin()
  const rows = await listCouples()
  const metrics = computeMetrics(rows)
  const growth = computeGrowth(rows)

  return (
    <main
      style={{
        background: 'var(--color-bg-app)',
        color: 'var(--color-text-primary)',
        minHeight: '100vh',
        padding: '24px 20px 60px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Pacto · Admin</h1>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Logado como {email} · MRR calculado a R$ {PLAN_PRICE.toFixed(2).replace('.', ',')}/mês
            </div>
          </div>
          <a
            href="/app"
            style={{
              color: 'var(--color-brand-emphasis)',
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            ← Voltar pro app
          </a>
        </header>

        <section style={{ marginBottom: 20 }}>
          <MetricCards m={metrics} />
        </section>

        <section style={{ marginBottom: 20 }}>
          <GrowthChart data={growth} />
        </section>

        <section>
          <h2 style={{ fontSize: 16, margin: '0 0 12px 0', color: 'var(--color-text-heading)' }}>
            Casais ({rows.length})
          </h2>
          <CouplesTable rows={rows} />
        </section>
      </div>
    </main>
  )
}
