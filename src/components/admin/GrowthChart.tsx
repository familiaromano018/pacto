import type { GrowthPoint } from '@/lib/admin/data'

export default function GrowthChart({ data }: { data: GrowthPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.couples))
  const W = 720
  const H = 200
  const padding = { top: 16, right: 12, bottom: 28, left: 28 }
  const innerW = W - padding.left - padding.right
  const innerH = H - padding.top - padding.bottom
  const barW = innerW / data.length

  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: 'var(--color-text-secondary)',
          marginBottom: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>Novos casais por mês (últimos 12)</span>
        <span style={{ display: 'flex', gap: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                background: 'var(--color-brand)',
                display: 'inline-block',
                borderRadius: 2,
              }}
            />
            Casais
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                background: 'var(--color-success)',
                display: 'inline-block',
                borderRadius: 2,
              }}
            />
            Pagantes
          </span>
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" role="img">
        {/* grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padding.top + innerH * (1 - t)
          return (
            <line
              key={t}
              x1={padding.left}
              x2={W - padding.right}
              y1={y}
              y2={y}
              stroke="var(--color-border-subtle)"
              strokeWidth={1}
            />
          )
        })}
        {[0, 0.5, 1].map((t) => {
          const y = padding.top + innerH * (1 - t)
          return (
            <text
              key={t}
              x={padding.left - 6}
              y={y + 4}
              fontSize={10}
              textAnchor="end"
              fill="var(--color-text-secondary)"
            >
              {Math.round(max * t)}
            </text>
          )
        })}
        {data.map((d, i) => {
          const x = padding.left + i * barW
          const totalH = (d.couples / max) * innerH
          const payH = (d.paying / max) * innerH
          const gap = 4
          const w = Math.max(2, barW - gap)
          return (
            <g key={d.month}>
              <rect
                x={x + gap / 2}
                y={padding.top + innerH - totalH}
                width={w}
                height={totalH}
                fill="var(--color-brand)"
                opacity={0.6}
                rx={2}
              />
              <rect
                x={x + gap / 2}
                y={padding.top + innerH - payH}
                width={w}
                height={payH}
                fill="var(--color-success)"
                rx={2}
              />
              {(i % 2 === 0 || i === data.length - 1) && (
                <text
                  x={x + barW / 2}
                  y={H - 8}
                  fontSize={9}
                  textAnchor="middle"
                  fill="var(--color-text-secondary)"
                >
                  {d.month.slice(2).replace('-', '/')}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
