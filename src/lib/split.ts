// src/lib/split.ts
// Cálculo da "parte justa" da pessoa A nas contas do casal, por método.

export type CategorySplit = Record<string, 'A' | 'B' | 'ambos'>

/**
 * Parte justa da pessoa A no método "Divisão por Categorias".
 * Cada item do casal é responsabilidade do dono da sua categoria:
 *   - dono 'A'    → conta 100% pra A
 *   - dono 'B'    → conta 0 pra A
 *   - 'ambos' / sem dono → divide 50/50
 */
export function fairShareAByCategory(
  casalItems: { category: string; amount: number }[],
  split: CategorySplit,
): number {
  return casalItems.reduce((s, it) => {
    const owner = split[it.category] ?? 'ambos'
    if (owner === 'A') return s + it.amount
    if (owner === 'B') return s
    return s + it.amount / 2
  }, 0)
}
