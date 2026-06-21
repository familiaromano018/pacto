'use client'

import { useMemo, useState, useTransition } from 'react'
import type { CoupleRow, SubStatus } from '@/lib/admin/data'
import { setCoupleStatus, type AdminAction } from '@/app/admin/actions'

const STATUS_LABELS: Record<SubStatus, string> = {
  trial: 'Trial',
  active: 'Pagando',
  past_due: 'Atrasado',
  canceled: 'Cancelado',
  expired: 'Expirado',
  none: '—',
}

const STATUS_COLORS: Record<SubStatus, { bg: string; fg: string }> = {
  trial: { bg: 'rgba(91, 141, 255, 0.15)', fg: '#7da3ff' },
  active: { bg: 'rgba(52, 211, 153, 0.15)', fg: '#34d399' },
  past_due: { bg: 'rgba(251, 191, 36, 0.15)', fg: '#fcd34d' },
  canceled: { bg: 'rgba(248, 113, 113, 0.12)', fg: '#f87171' },
  expired: { bg: 'rgba(248, 113, 113, 0.12)', fg: '#f87171' },
  none: { bg: 'rgba(255,255,255,0.05)', fg: '#8b8b94' },
}

const FILTER_OPTIONS: { id: SubStatus | 'all' | 'expiring'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'expiring', label: 'Vencendo ≤3d' },
  { id: 'trial', label: 'Trial' },
  { id: 'active', label: 'Pagando' },
  { id: 'past_due', label: 'Atrasado' },
  { id: 'canceled', label: 'Cancelado' },
  { id: 'expired', label: 'Expirado' },
]

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function emailTemplate(row: CoupleRow): { subject: string; body: string } {
  const names = [row.nameA, row.nameB].filter(Boolean).join(' e ') || 'pessoal'
  if (row.status === 'trial') {
    return {
      subject: `${names}, seu trial do Pacto está acabando`,
      body: `Oi! Vi aqui que faltam ${row.daysRemaining} dia(s) pro fim do trial de vocês no Pacto. Tô passando pra saber se posso ajudar com qualquer coisa antes do app travar. Qualquer dúvida me responde aqui mesmo. — Nathan`,
    }
  }
  if (row.status === 'past_due') {
    return {
      subject: `${names}, problema no pagamento do Pacto`,
      body: `Oi! A última cobrança do Pacto falhou. Posso te ajudar a regularizar? — Nathan`,
    }
  }
  if (row.status === 'canceled' || row.status === 'expired') {
    return {
      subject: `${names}, sentimos falta de vocês no Pacto`,
      body: `Oi! Vi que vocês não estão mais usando o Pacto. Posso saber o que aconteceu? — Nathan`,
    }
  }
  return {
    subject: `${names}, tudo bem?`,
    body: `Oi! Sou o Nathan do Pacto. Posso ajudar com algo?`,
  }
}

function mailtoFor(emails: string[], row: CoupleRow): string {
  const { subject, body } = emailTemplate(row)
  return `mailto:${emails.join(',')}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`
}

export default function CouplesTable({ rows }: { rows: CoupleRow[] }) {
  const [filter, setFilter] = useState<(typeof FILTER_OPTIONS)[number]['id']>('all')
  const [q, setQ] = useState('')
  const [openLog, setOpenLog] = useState<string | null>(null)
  const [manage, setManage] = useState<string | null>(null)
  const [premiumMonths, setPremiumMonths] = useState(12)
  const [trialDays, setTrialDays] = useState(14)
  const [pending, startTransition] = useTransition()

  function runAction(coupleId: string, action: AdminAction) {
    startTransition(async () => {
      try {
        await setCoupleStatus(coupleId, action)
        setManage(null)
      } catch (e) {
        alert('Erro ao atualizar: ' + (e instanceof Error ? e.message : String(e)))
      }
    })
  }

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase()
    return rows
      .filter((r) => {
        if (filter === 'expiring')
          return r.status === 'trial' && r.daysRemaining > 0 && r.daysRemaining <= 3
        if (filter !== 'all' && r.status !== filter) return false
        if (!qLower) return true
        return (
          r.code.toLowerCase().includes(qLower) ||
          r.nameA.toLowerCase().includes(qLower) ||
          r.nameB.toLowerCase().includes(qLower) ||
          r.members.some((m) => m.email?.toLowerCase().includes(qLower))
        )
      })
      .sort((a, b) => {
        // pendentes/urgentes primeiro: trial vencendo > past_due > active > resto
        const score = (r: CoupleRow) => {
          if (r.status === 'trial') return 1000 - r.daysRemaining
          if (r.status === 'past_due') return 900
          if (r.status === 'active') return 500 - r.daysRemaining
          return 100
        }
        return score(b) - score(a)
      })
  }, [rows, filter, q])

  const openLogRow = filtered.find((r) => r.coupleId === openLog) || null
  const manageRow = rows.find((r) => r.coupleId === manage) || null

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 12,
          alignItems: 'center',
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, código ou email…"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-default)',
            color: 'var(--color-text-primary)',
            padding: '8px 12px',
            borderRadius: 8,
            minWidth: 260,
            flex: '1 1 260px',
            outline: 'none',
            fontSize: 14,
          }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                background: filter === f.id ? 'var(--color-brand)' : 'var(--color-bg-card)',
                border: '1px solid var(--color-border-default)',
                color:
                  filter === f.id ? 'var(--color-text-on-brand)' : 'var(--color-text-body)',
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
              minWidth: 900,
            }}
          >
            <thead>
              <tr style={{ background: 'var(--color-bg-card-muted)' }}>
                {['Casal', 'Emails', 'Status', 'Dias', 'Vence em', 'Criado em', 'Ações'].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        fontWeight: 600,
                        color: 'var(--color-text-secondary)',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const emails = r.members.map((m) => m.email).filter(Boolean) as string[]
                const c = STATUS_COLORS[r.status]
                const target =
                  r.status === 'trial'
                    ? r.trialEndsAt
                    : r.status === 'active'
                      ? r.currentPeriodEnd
                      : null
                return (
                  <tr
                    key={r.coupleId}
                    style={{ borderTop: '1px solid var(--color-border-divider)' }}
                  >
                    <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 600 }}>
                        {[r.nameA, r.nameB].filter(Boolean).join(' & ') || (
                          <span style={{ color: 'var(--color-text-muted)' }}>(sem nomes)</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                        {r.code}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        verticalAlign: 'top',
                        color: 'var(--color-text-body)',
                      }}
                    >
                      {emails.length === 0 ? (
                        <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                      ) : (
                        emails.map((e) => <div key={e}>{e}</div>)
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                      <span
                        style={{
                          background: c.bg,
                          color: c.fg,
                          padding: '3px 10px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}
                      >
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                      <span
                        style={{
                          color:
                            r.status === 'trial' && r.daysRemaining <= 3
                              ? 'var(--color-warning-text)'
                              : 'var(--color-text-body)',
                          fontWeight: r.status === 'trial' && r.daysRemaining <= 3 ? 700 : 400,
                        }}
                      >
                        {r.hasAccess ? `${r.daysRemaining}d` : '—'}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        verticalAlign: 'top',
                        color: 'var(--color-text-body)',
                      }}
                    >
                      {fmtDate(target)}
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        verticalAlign: 'top',
                        color: 'var(--color-text-body)',
                      }}
                    >
                      {fmtDate(r.createdAt)}
                    </td>
                    <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            setManage(r.coupleId)
                            setPremiumMonths(12)
                            setTrialDays(14)
                          }}
                          style={{
                            background: 'var(--color-brand)',
                            border: '1px solid var(--color-border-default)',
                            color: 'var(--color-text-on-brand)',
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: 12,
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          ⚙️ Plano
                        </button>
                        {emails.length > 0 && (
                          <a
                            href={mailtoFor(emails, r)}
                            style={{
                              background: 'var(--color-bg-card-muted)',
                              border: '1px solid var(--color-border-default)',
                              color: 'var(--color-text-body)',
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 12,
                              textDecoration: 'none',
                            }}
                          >
                            ✉️ Email
                          </a>
                        )}
                        {r.hotmartEventLog.length > 0 && (
                          <button
                            onClick={() => setOpenLog(r.coupleId)}
                            style={{
                              background: 'var(--color-bg-card-muted)',
                              border: '1px solid var(--color-border-default)',
                              color: 'var(--color-text-body)',
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 12,
                              cursor: 'pointer',
                            }}
                          >
                            📜 Log ({r.hotmartEventLog.length})
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: 40,
                      textAlign: 'center',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Nenhum casal encontrado com esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openLogRow && (
        <div
          onClick={() => setOpenLog(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--color-bg-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 12,
              maxWidth: 700,
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              padding: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 12,
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16 }}>
                Log Hotmart —{' '}
                {[openLogRow.nameA, openLogRow.nameB].filter(Boolean).join(' & ') ||
                  openLogRow.code}
              </h3>
              <button
                onClick={() => setOpenLog(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  fontSize: 20,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
            {openLogRow.hotmartSubscriberCode && (
              <div
                style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 8 }}
              >
                Subscriber: {openLogRow.hotmartSubscriberCode}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {openLogRow.hotmartEventLog.map((ev, i) => {
                const e = ev as { event?: string; at?: string; transaction?: string }
                return (
                  <div
                    key={i}
                    style={{
                      background: 'var(--color-bg-card)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 12,
                    }}
                  >
                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                      {e.event || '(sem evento)'}
                    </div>
                    <div style={{ color: 'var(--color-text-secondary)' }}>
                      {fmtDateTime(e.at || null)}
                      {e.transaction ? ` · ${e.transaction}` : ''}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {manageRow && (
        <div
          onClick={() => !pending && setManage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--color-bg-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 12,
              maxWidth: 460,
              width: '100%',
              padding: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 4,
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16 }}>
                Gerenciar plano —{' '}
                {[manageRow.nameA, manageRow.nameB].filter(Boolean).join(' & ') || manageRow.code}
              </h3>
              <button
                onClick={() => !pending && setManage(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  fontSize: 20,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
              Status atual: <strong>{STATUS_LABELS[manageRow.status]}</strong>
            </div>

            {/* Premium */}
            <div
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 10,
                padding: 14,
                marginBottom: 12,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Tornar Premium (pagando)</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ fontSize: 13, color: 'var(--color-text-body)' }}>Duração:</label>
                <select
                  value={premiumMonths}
                  onChange={(e) => setPremiumMonths(Number(e.target.value))}
                  disabled={pending}
                  style={{
                    background: 'var(--color-bg-card-muted)',
                    border: '1px solid var(--color-border-default)',
                    color: 'var(--color-text-primary)',
                    padding: '6px 10px',
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                >
                  <option value={1}>1 mês</option>
                  <option value={3}>3 meses</option>
                  <option value={6}>6 meses</option>
                  <option value={12}>12 meses</option>
                  <option value={24}>24 meses</option>
                </select>
                <button
                  onClick={() => runAction(manageRow.coupleId, { kind: 'premium', months: premiumMonths })}
                  disabled={pending}
                  style={{
                    background: '#34d399',
                    border: 'none',
                    color: '#06281d',
                    padding: '7px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: pending ? 'wait' : 'pointer',
                    marginLeft: 'auto',
                  }}
                >
                  {pending ? '...' : 'Aplicar Premium'}
                </button>
              </div>
            </div>

            {/* Trial */}
            <div
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 10,
                padding: 14,
                marginBottom: 12,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Voltar para Trial</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ fontSize: 13, color: 'var(--color-text-body)' }}>Dias:</label>
                <select
                  value={trialDays}
                  onChange={(e) => setTrialDays(Number(e.target.value))}
                  disabled={pending}
                  style={{
                    background: 'var(--color-bg-card-muted)',
                    border: '1px solid var(--color-border-default)',
                    color: 'var(--color-text-primary)',
                    padding: '6px 10px',
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                >
                  <option value={7}>7 dias</option>
                  <option value={14}>14 dias</option>
                  <option value={30}>30 dias</option>
                </select>
                <button
                  onClick={() => runAction(manageRow.coupleId, { kind: 'trial', days: trialDays })}
                  disabled={pending}
                  style={{
                    background: 'var(--color-bg-card-muted)',
                    border: '1px solid var(--color-border-default)',
                    color: 'var(--color-text-body)',
                    padding: '7px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: pending ? 'wait' : 'pointer',
                    marginLeft: 'auto',
                  }}
                >
                  {pending ? '...' : 'Aplicar Trial'}
                </button>
              </div>
            </div>

            {/* Cancelar */}
            <button
              onClick={() => {
                if (confirm('Cancelar o acesso deste casal? Eles perdem o premium imediatamente.'))
                  runAction(manageRow.coupleId, { kind: 'cancel' })
              }}
              disabled={pending}
              style={{
                width: '100%',
                background: 'rgba(248, 113, 113, 0.12)',
                border: '1px solid rgba(248, 113, 113, 0.4)',
                color: '#f87171',
                padding: '9px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: pending ? 'wait' : 'pointer',
              }}
            >
              {pending ? '...' : 'Cancelar acesso'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
