'use client'

import { tokens } from '@/lib/tokens'
import { monthLabel, shiftMonth, currentMonthKey } from '@/lib/format'
import { Avatar } from './ui'
import { LogoMark } from './Logo'

interface Props {
  nameA: string
  nameB: string
  monthKey: string
  onChangeMonth: (key: string) => void
  totalMes: number
  onOpenConfig: () => void
}

export default function MonthHeader({
  nameA, nameB, monthKey, onChangeMonth, totalMes, onOpenConfig,
}: Props) {
  const isCurrentMonth = monthKey === currentMonthKey()

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: tokens.primitive.zIndex.sticky,
        background: tokens.color.bg_app,
        borderBottom: `1px solid ${tokens.color.border_subtle}`,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '16px 22px 8px',
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
            letterSpacing: '0.18em',
            color: tokens.color.text_heading,
          }}
        >
          PACTO
        </span>
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
          <Avatar name={nameA} color={tokens.color.personA} size={26} />
          <div style={{ marginLeft: -8 }}>
            <Avatar name={nameB} color={tokens.color.personB} size={26} />
          </div>
        </div>

        <a
          href="/ajuda"
          aria-label="Ajuda"
          style={{
            marginLeft: 'auto',
            background: tokens.color.bg_card,
            border: `1px solid ${tokens.color.border_subtle}`,
            cursor: 'pointer',
            padding: 8,
            width: 32,
            height: 32,
            color: tokens.color.text_secondary,
            fontFamily: 'inherit',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
            marginRight: 6,
          }}
        >
          ?
        </a>

        <button
          onClick={onOpenConfig}
          aria-label="Configurações"
          style={{
            background: tokens.color.bg_card,
            border: `1px solid ${tokens.color.border_subtle}`,
            cursor: 'pointer',
            padding: 8,
            color: tokens.color.text_secondary,
            fontFamily: 'inherit',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Seletor de mês */}
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '4px 22px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <NavBtn onClick={() => onChangeMonth(shiftMonth(monthKey, -1))} label="Mês anterior" dir="left" />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: tokens.color.text_heading,
              textTransform: 'capitalize',
              letterSpacing: '-0.01em',
            }}
          >
            {monthLabel(monthKey)}
          </div>
          <div
            style={{
              fontSize: 11,
              color: tokens.color.text_muted,
              marginTop: 1,
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 500,
              letterSpacing: '0.01em',
            }}
          >
            {totalMes > 0
              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalMes)
              : isCurrentMonth ? 'Sem gastos ainda' : 'Sem registros'}
          </div>
        </div>
        <NavBtn onClick={() => onChangeMonth(shiftMonth(monthKey, 1))} label="Próximo mês" dir="right" />
      </div>
    </div>
  )
}

function NavBtn({ onClick, label, dir }: { onClick: () => void; label: string; dir: 'left' | 'right' }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        background: tokens.color.bg_card,
        border: `1px solid ${tokens.color.border_subtle}`,
        cursor: 'pointer',
        color: tokens.color.text_secondary,
        padding: 8,
        borderRadius: 10,
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dir === 'right' ? 'rotate(180deg)' : 'none' }}>
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  )
}
