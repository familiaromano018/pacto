'use client'

import { tokens } from '@/lib/tokens'
import { formatBRL } from '@/lib/format'
import { categoryEmoji } from '@/lib/categories'
import { paymentMethodLabel } from './constants'
import type { FeedEntry, CustomCategory } from './types'

interface Props {
  entry: FeedEntry
  nameA: string
  nameB: string
  customCategories?: CustomCategory[]
  onRemove?: (id: string) => void
  onEdit?: (id: string) => void
}

const KIND_META: Record<FeedEntry['kind'], { label: string; color: string }> = {
  avulso:  { label: 'Avulso',    color: 'var(--color-brand)' },
  fixo:    { label: 'Fixo',      color: 'var(--color-fixed)' },
  parcela: { label: 'Parcela',   color: 'var(--color-installment)' },
}

export default function FeedRow({ entry, nameA, nameB, customCategories = [], onRemove, onEdit }: Props) {
  const meta = KIND_META[entry.kind]
  const payerName =
    entry.scope === 'A' ? nameA :
    entry.scope === 'B' ? nameB :
    entry.paidBy === 'A' ? nameA : nameB
  const payerColor =
    entry.scope === 'A' || (entry.scope === 'casal' && entry.paidBy === 'A')
      ? tokens.color.personA
      : tokens.color.personB

  return (
    <div
      style={{
        background: tokens.color.bg_card,
        borderRadius: tokens.radius.cardSm,
        padding: `${tokens.primitive.space[7]} ${tokens.primitive.space[8]}`,
        marginBottom: tokens.primitive.space[5],
        display: 'flex',
        alignItems: 'center',
        gap: tokens.primitive.space[7],
        boxShadow: tokens.shadow.cardSubtle,
        border: `1px solid ${tokens.color.border_subtle}`,
      }}
    >
      <div
        style={{
          width: 44, height: 44,
          borderRadius: tokens.primitive.radius.md,
          background: tokens.color.bg_app,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {categoryEmoji(entry.category, customCategories)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: tokens.primitive.fontWeight.bold,
            fontSize: tokens.primitive.fontSize.lg,
            color: tokens.color.text_heading,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {entry.desc}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.primitive.space[4],
            marginTop: 2,
            fontSize: tokens.primitive.fontSize.sm,
            color: tokens.color.text_muted,
          }}
        >
          <span
            style={{
              width: 8, height: 8,
              borderRadius: '50%',
              background: payerColor,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span>{payerName}</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span style={{ color: meta.color, fontWeight: tokens.primitive.fontWeight.semibold }}>
            {meta.label}
          </span>
          {entry.paymentMethod && (
            <>
              <span style={{ opacity: 0.4 }}>•</span>
              <span>{paymentMethodLabel(entry.paymentMethod)}</span>
            </>
          )}
          {entry.sublabel && (
            <>
              <span style={{ opacity: 0.4 }}>•</span>
              <span>{entry.sublabel}</span>
            </>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div
          style={{
            fontWeight: tokens.primitive.fontWeight.black,
            fontSize: tokens.primitive.fontSize.xl,
            color: tokens.color.text_heading,
            fontFamily: tokens.primitive.fontFamily.display,
            whiteSpace: 'nowrap',
          }}
        >
          {formatBRL(entry.amount)}
        </div>
        {entry.kind === 'avulso' && (onEdit || onRemove) && (
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            {onEdit && (
              <button
                onClick={() => onEdit(entry.id)}
                aria-label="Editar"
                style={{
                  background: `${tokens.color.brand}14`,
                  border: `1px solid ${tokens.color.brand}55`,
                  color: tokens.color.brand,
                  cursor: 'pointer',
                  fontSize: tokens.primitive.fontSize.xs,
                  fontWeight: tokens.primitive.fontWeight.bold,
                  fontFamily: 'inherit',
                  padding: '4px 10px',
                  borderRadius: 8,
                  letterSpacing: '0.02em',
                }}
              >
                editar
              </button>
            )}
            {onRemove && (
              <button
                onClick={() => onRemove(entry.id)}
                aria-label="Remover"
                style={{
                  background: `${tokens.color.danger}14`,
                  border: `1px solid ${tokens.color.danger}55`,
                  color: tokens.color.danger,
                  cursor: 'pointer',
                  fontSize: tokens.primitive.fontSize.xs,
                  fontWeight: tokens.primitive.fontWeight.bold,
                  fontFamily: 'inherit',
                  padding: '4px 10px',
                  borderRadius: 8,
                  letterSpacing: '0.02em',
                }}
              >
                remover
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
