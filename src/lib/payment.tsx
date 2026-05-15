import type { PaymentMethod } from '@/components/types'

export type PaymentMethodKey = PaymentMethod | 'naoInformado'

export const PAYMENT_METHOD_ORDER: PaymentMethodKey[] = [
  'pix',
  'credito',
  'debito',
  'dinheiro',
  'boleto',
  'transferencia',
  'naoInformado',
]

export const PAYMENT_METHOD_LABEL: Record<PaymentMethodKey, string> = {
  pix: 'Pix',
  credito: 'Crédito',
  debito: 'Débito',
  dinheiro: 'Dinheiro',
  boleto: 'Boleto',
  transferencia: 'Transferência',
  naoInformado: 'Não informado',
}

// Cores: cada uma referencia uma var semântica já existente em src/lib/tokens.ts.
// Não inventar novas vars — se quiser variar tons, usar opacity inline no consumidor.
export const PAYMENT_METHOD_COLOR: Record<PaymentMethodKey, string> = {
  pix: 'var(--color-success)',
  credito: 'var(--color-brand)',
  debito: 'var(--color-brand-emphasis)',
  dinheiro: 'var(--color-person-b)',
  boleto: 'var(--color-installment)',
  transferencia: 'var(--color-fixed)',
  naoInformado: 'var(--color-border-default)',
}

/** Resolve a chave do bucket a partir do PaymentMethod opcional do registro. */
export function paymentMethodKey(m: PaymentMethod | undefined): PaymentMethodKey {
  return m ?? 'naoInformado'
}

export function PaymentMethodIcon({
  method,
  size = 14,
}: {
  method: PaymentMethodKey
  size?: number
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (method) {
    case 'pix':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 3l9 9-9 9-9-9 9-9z" />
          <path d="M8 12l4-4 4 4-4 4-4-4z" />
        </svg>
      )
    case 'credito':
      return (
        <svg {...common} aria-hidden>
          <rect x="2" y="6" width="20" height="13" rx="2" />
          <path d="M2 11h20" />
          <path d="M6 16h4" />
        </svg>
      )
    case 'debito':
      return (
        <svg {...common} aria-hidden>
          <rect x="2" y="6" width="20" height="13" rx="2" />
          <path d="M2 11h20" />
          <path d="M14 16h4" />
        </svg>
      )
    case 'dinheiro':
      return (
        <svg {...common} aria-hidden>
          <rect x="2" y="7" width="20" height="11" rx="2" />
          <circle cx="12" cy="12.5" r="2.5" />
          <path d="M5 10v0M19 15v0" />
        </svg>
      )
    case 'boleto':
      return (
        <svg {...common} aria-hidden>
          <path d="M4 5v14M7 5v14M10 5v14M14 5v14M17 5v14M20 5v14" />
        </svg>
      )
    case 'transferencia':
      return (
        <svg {...common} aria-hidden>
          <path d="M17 3l4 4-4 4" />
          <path d="M3 7h18" />
          <path d="M7 21l-4-4 4-4" />
          <path d="M21 17H3" />
        </svg>
      )
    case 'naoInformado':
    default:
      return (
        <svg {...common} aria-hidden strokeDasharray="3 3">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16v0.01" strokeDasharray="0" />
        </svg>
      )
  }
}
