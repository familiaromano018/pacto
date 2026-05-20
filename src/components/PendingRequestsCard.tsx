'use client'

import { useEffect, useState } from 'react'
import { tokens } from '@/lib/tokens'
import { formatBRL } from '@/lib/format'
import { listChangeRequests, approveChangeRequest, denyChangeRequest } from '@/lib/changes/request'
import { supabase } from '@/lib/supabase/client'
import type { ChangeRequest } from './types'

interface Props {
  coupleId: string
  currentUserId: string
  partnerName?: string
}

export default function PendingRequestsCard({ coupleId, currentUserId, partnerName }: Props) {
  const [requests, setRequests] = useState<ChangeRequest[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const all = await listChangeRequests(coupleId)
        if (!cancelled) setRequests(all)
      } catch {
        // swallow
      }
    }
    load()

    const sb = supabase()
    const ch = sb
      .channel(`pacto:${coupleId}:change_requests`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'change_requests', filter: `couple_id=eq.${coupleId}` }, () => {
        load()
      })
      .subscribe()
    return () => { cancelled = true; sb.removeChannel(ch) }
  }, [coupleId])

  const pendingForMe = requests.filter((r) => r.status === 'pending' && r.requestedTo === currentUserId)

  if (pendingForMe.length === 0) return null

  async function onApprove(req: ChangeRequest) {
    try {
      await approveChangeRequest(req)
      setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status: 'approved' } : r)))
    } catch {
      if (typeof window !== 'undefined') window.alert('Erro ao aprovar.')
    }
  }

  async function onDeny(req: ChangeRequest) {
    try {
      await denyChangeRequest(req.id)
      setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status: 'denied' } : r)))
    } catch {
      if (typeof window !== 'undefined') window.alert('Erro ao negar.')
    }
  }

  function descreveAcao(r: ChangeRequest): string {
    if (r.action === 'delete') {
      return 'quer apagar um gasto'
    }
    const p = r.payload as Record<string, any> | null
    if (!p) return 'quer editar um gasto'
    const parts: string[] = []
    if (p.amount !== undefined) parts.push(`valor → ${formatBRL(p.amount)}`)
    if (p.category) parts.push(`categoria → ${p.category}`)
    if (p.scope) parts.push(`scope → ${p.scope}`)
    if (parts.length === 0) parts.push('valores atualizados')
    return `quer editar (${parts.join(', ')})`
  }

  function expiraEm(r: ChangeRequest): string {
    const ms = r.expiresAt - Date.now()
    if (ms <= 0) return 'expirado'
    const days = Math.floor(ms / 86400000)
    const hours = Math.floor((ms % 86400000) / 3600000)
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  return (
    <div
      style={{
        background: 'rgba(245,124,0,0.10)',
        border: '1px solid rgba(245,124,0,0.40)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#c95800',
          marginBottom: 12,
        }}
      >
        Solicitações pendentes · {pendingForMe.length}
      </div>
      {pendingForMe.map((r) => (
        <div
          key={r.id}
          style={{
            background: tokens.color.bg_card,
            borderRadius: 10,
            padding: 12,
            marginBottom: 8,
          }}
        >
          <div style={{ fontSize: 14, color: tokens.color.text_heading, marginBottom: 4 }}>
            {r.action === 'delete' ? '🗑️' : '📝'} {partnerName ?? 'Parceiro(a)'} {descreveAcao(r)}
          </div>
          <div style={{ fontSize: 11, color: tokens.color.text_muted, marginBottom: 10 }}>
            Expira em {expiraEm(r)}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onApprove(r)}
              style={{
                flex: 1,
                background: tokens.color.brand,
                color: tokens.color.text_onBrand,
                border: 'none',
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Aprovar
            </button>
            <button
              onClick={() => onDeny(r)}
              style={{
                flex: 1,
                background: 'transparent',
                color: tokens.color.text_secondary,
                border: `1px solid ${tokens.color.border_default}`,
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Negar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
