export const CATEGORIES = [
  'Aluguel/Financiamento',
  'Mercado',
  'Streaming',
  'Academia',
  'Saúde',
  'Restaurante',
  'Transporte',
  'Eletrodoméstico',
  'Casa',
  'Viagem',
  'Outros',
]

export const EMOJIS: Record<string, string> = {
  'Aluguel/Financiamento': '🏠',
  Mercado: '🛒',
  Streaming: '📺',
  Academia: '💪',
  Saúde: '💊',
  Restaurante: '🍕',
  Transporte: '🚗',
  Eletrodoméstico: '📱',
  Casa: '🛋️',
  Viagem: '✈️',
  Outros: '📦',
}

export const INCOME_CATEGORIES = [
  'Salário',
  'Freela',
  'Reembolso',
  'Bônus',
  '13º',
  'Presente',
  'Venda',
  'Investimento',
  'Outros',
]

export const INCOME_EMOJIS: Record<string, string> = {
  'Salário': '💰',
  Freela: '💼',
  Reembolso: '↩️',
  'Bônus': '⭐',
  '13º': '🎉',
  Presente: '🎁',
  Venda: '🏷️',
  Investimento: '📈',
  Outros: '📥',
}

export const COLORS_A = '#FF6B6B'
export const COLORS_B = '#4ECDC4'
export const COLOR_INST = '#f59e0b'
export const COLOR_FIXED = '#8b5cf6'

export const PAYMENT_METHODS: { id: 'pix' | 'debito' | 'credito' | 'dinheiro' | 'boleto' | 'transferencia'; label: string; emoji: string }[] = [
  { id: 'pix',          label: 'Pix',          emoji: '⚡' },
  { id: 'debito',       label: 'Débito',       emoji: '💳' },
  { id: 'credito',      label: 'Crédito',      emoji: '💳' },
  { id: 'dinheiro',     label: 'Dinheiro',     emoji: '💵' },
  { id: 'boleto',       label: 'Boleto',       emoji: '📄' },
  { id: 'transferencia',label: 'Transferência',emoji: '↔️' },
]

export function paymentMethodLabel(id?: string | null): string | null {
  if (!id) return null
  const found = PAYMENT_METHODS.find((m) => m.id === id)
  return found?.label ?? null
}
