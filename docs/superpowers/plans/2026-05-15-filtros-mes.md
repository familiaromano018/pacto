# Filtros por categoria e forma de pagamento na aba Mês — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar dois filtros (Categoria e Forma de pagamento) na aba Mês, combináveis com os filtros existentes de pessoa e busca, com contador de resultados e empty state melhorado.

**Architecture:** Mudança contida em um único arquivo (`src/components/TabMes.tsx`). Dois novos `useState` + um `useEffect` que reseta na troca de mês + dois `useMemo` derivando opções dos dropdowns + extensão da função `filtered` que já existe + render de uma nova linha de filtros com 2 `<select>` nativos estilizados + contador + empty state com botão "Limpar filtros". Reusa `PAYMENT_METHOD_LABEL`/`PAYMENT_METHOD_ORDER`/`paymentMethodKey` de `src/lib/payment.tsx` e `categoryEmoji` de `src/lib/categories.ts`.

**Tech Stack:** Next.js 14, React 18, TypeScript. Verificação manual via `pnpm dev` (não há suite de testes no projeto).

**Spec:** `docs/superpowers/specs/2026-05-15-filtros-mes-design.md`

---

## File Structure

**Modified:** `src/components/TabMes.tsx` — único arquivo tocado.

**Not touched:** types, schema, sync, Visão, Recorrentes, Metas, Casal, AddExpenseSheet.

---

## Task 1: imports + estado dos filtros + reset em troca de mês

**Files:**
- Modify: `src/components/TabMes.tsx`

- [ ] **Step 1: adicionar imports necessários**

Localizar a linha de imports no topo (em torno da linha 3):

```tsx
import { useMemo, useState } from 'react'
```

Trocar por:

```tsx
import { useEffect, useMemo, useState } from 'react'
```

Adicionar logo abaixo dos imports existentes (depois do `import type { ... }`):

```tsx
import {
  paymentMethodKey,
  PAYMENT_METHOD_LABEL,
  PAYMENT_METHOD_ORDER,
  type PaymentMethodKey,
} from '@/lib/payment'
import { categoryEmoji } from '@/lib/categories'
```

- [ ] **Step 2: declarar os 2 estados novos**

Localizar a declaração existente em torno das linhas 39-40:

```tsx
  const [filter, setFilter] = useState<FilterId>('all')
  const [query, setQuery] = useState('')
```

Adicionar logo abaixo:

```tsx
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethodKey | 'all'>('all')
```

- [ ] **Step 3: reset em troca de mês**

Logo após os states acima, adicionar:

```tsx
  useEffect(() => {
    setCategoryFilter('all')
    setPaymentFilter('all')
  }, [monthKey])
```

- [ ] **Step 4: rodar typecheck**

Run: `cd "/Users/nathanromano/TESTE DE IA/casal-no-azul" && pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 5: commit**

```bash
git add src/components/TabMes.tsx
git commit -m "feat(mes): add category and payment filter state"
```

---

## Task 2: estender a função `filtered` com as novas condições

**Files:**
- Modify: `src/components/TabMes.tsx` (a `useMemo` `filtered`, em torno das linhas 104-117)

- [ ] **Step 1: localizar o useMemo `filtered`**

Estrutura atual:

```tsx
  const filtered = useMemo(() => {
    let r = feed
    if (filter !== 'all') {
      r = r.filter((e) => filter === 'casal' ? e.scope === 'casal' : e.scope === filter)
    }
    const q = query.trim().toLowerCase()
    if (q) {
      r = r.filter((e) =>
        e.desc.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q),
      )
    }
    return r
  }, [feed, filter, query])
```

- [ ] **Step 2: adicionar as 2 condições novas e atualizar deps**

Trocar pelo seguinte (ordem: pessoa → categoria → pagamento → busca):

```tsx
  const filtered = useMemo(() => {
    let r = feed
    if (filter !== 'all') {
      r = r.filter((e) => filter === 'casal' ? e.scope === 'casal' : e.scope === filter)
    }
    if (categoryFilter !== 'all') {
      r = r.filter((e) => e.category === categoryFilter)
    }
    if (paymentFilter !== 'all') {
      r = r.filter((e) => paymentMethodKey(e.paymentMethod) === paymentFilter)
    }
    const q = query.trim().toLowerCase()
    if (q) {
      r = r.filter((e) =>
        e.desc.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q),
      )
    }
    return r
  }, [feed, filter, categoryFilter, paymentFilter, query])
```

- [ ] **Step 3: rodar typecheck**

Run: `cd "/Users/nathanromano/TESTE DE IA/casal-no-azul" && pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 4: commit**

```bash
git add src/components/TabMes.tsx
git commit -m "feat(mes): apply category and payment filters"
```

---

## Task 3: computar opções dos dropdowns

Dropdowns mostram só categorias/métodos que têm pelo menos 1 item no mês corrente **após** aplicar filtros de pessoa + busca (mas não o outro filtro cat/pay — decisão da spec pra evitar "opções zeradas confusas").

**Files:**
- Modify: `src/components/TabMes.tsx`

- [ ] **Step 1: criar um `useMemo` `baseForOptions`**

Logo **antes** do `useMemo` `filtered` (que você acabou de editar na Task 2), adicionar:

```tsx
  // Base pros dropdowns: feed filtrado SÓ por pessoa + busca (não por cat/pay).
  // Garante que as opções não desaparecem ao escolher uma — mas cada dropdown
  // ainda só lista o que existe sob os filtros externos a ele.
  const baseForOptions = useMemo(() => {
    let r = feed
    if (filter !== 'all') {
      r = r.filter((e) => filter === 'casal' ? e.scope === 'casal' : e.scope === filter)
    }
    const q = query.trim().toLowerCase()
    if (q) {
      r = r.filter((e) =>
        e.desc.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q),
      )
    }
    return r
  }, [feed, filter, query])
```

- [ ] **Step 2: derivar `categoryOptions`**

Logo após `baseForOptions`, adicionar:

```tsx
  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>()
    baseForOptions.forEach((e) => {
      counts.set(e.category, (counts.get(e.category) ?? 0) + 1)
    })
    return Array.from(counts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => a.category.localeCompare(b.category, 'pt-BR'))
  }, [baseForOptions])
```

- [ ] **Step 3: derivar `paymentOptions`**

Logo após `categoryOptions`, adicionar:

```tsx
  const paymentOptions = useMemo(() => {
    const counts = new Map<PaymentMethodKey, number>()
    baseForOptions.forEach((e) => {
      const k = paymentMethodKey(e.paymentMethod)
      counts.set(k, (counts.get(k) ?? 0) + 1)
    })
    // Mantém a ordem canônica de PAYMENT_METHOD_ORDER, omitindo métodos
    // sem ocorrências.
    return PAYMENT_METHOD_ORDER
      .filter((k) => (counts.get(k) ?? 0) > 0)
      .map((k) => ({ key: k, count: counts.get(k) ?? 0 }))
  }, [baseForOptions])
```

- [ ] **Step 4: rodar typecheck**

Run: `cd "/Users/nathanromano/TESTE DE IA/casal-no-azul" && pnpm exec tsc --noEmit`
Expected: 0 erros (nada renderiza ainda, só dados).

- [ ] **Step 5: commit**

```bash
git add src/components/TabMes.tsx
git commit -m "feat(mes): compute category and payment dropdown options"
```

---

## Task 4: renderizar a linha de filtros novos (2 selects + botão limpar)

**Files:**
- Modify: `src/components/TabMes.tsx` (render — inserir logo após o bloco de chips de pessoa)

- [ ] **Step 1: localizar o fechamento do bloco de chips de pessoa**

O bloco hoje termina em torno da linha 332, no `</div>` seguido por `)}` que fecha o `{feed.length > 0 && (...)}`. Logo após esse fechamento, **antes** do bloco `{/* Feed por dia */}`, vai entrar a nova linha de filtros.

- [ ] **Step 2: inserir o bloco de filtros**

Adicionar este JSX imediatamente após o fechamento `)}` do bloco de chips de pessoa e antes do comentário `{/* Feed por dia */}`:

```tsx
      {/* Filtros: categoria + pagamento */}
      {feed.length > 0 && (categoryOptions.length > 0 || paymentOptions.length > 0) && (
        <div
          style={{
            display: 'flex',
            gap: tokens.primitive.space[3],
            marginBottom: tokens.primitive.space[8],
            overflowX: 'auto',
            paddingBottom: 2,
            alignItems: 'center',
          }}
        >
          <FilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="📂 Categoria"
            allLabel="Todas as categorias"
            options={categoryOptions.map(({ category, count }) => ({
              value: category,
              label: `${categoryEmoji(category, customCategories)} ${category} (${count})`,
            }))}
            active={categoryFilter !== 'all'}
          />
          <FilterSelect
            value={paymentFilter}
            onChange={(v) => setPaymentFilter(v as PaymentMethodKey | 'all')}
            placeholder="💳 Pagamento"
            allLabel="Todas as formas"
            options={paymentOptions.map(({ key, count }) => ({
              value: key,
              label: `${PAYMENT_METHOD_LABEL[key]} (${count})`,
            }))}
            active={paymentFilter !== 'all'}
          />
          {(categoryFilter !== 'all' || paymentFilter !== 'all') && (
            <button
              onClick={() => { setCategoryFilter('all'); setPaymentFilter('all') }}
              aria-label="Limpar filtros"
              style={{
                background: 'transparent',
                border: `1px solid ${tokens.color.border_subtle}`,
                color: tokens.color.text_secondary,
                borderRadius: 999,
                width: 32,
                height: 32,
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}
```

- [ ] **Step 3: criar o componente `FilterSelect` no fim do arquivo**

`FilterSelect` é um `<select>` HTML nativo estilizado como chip. A primeira
opção (`value="all"` com texto = `placeholder` quando inativo, ou
`allLabel` quando ativo) serve como item "limpar". Adicionar no fim de
`src/components/TabMes.tsx`, depois da função `TabMes` e antes da função
helper `monthsBetween`:

```tsx
function FilterSelect({
  value, onChange, placeholder, allLabel, options, active,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  allLabel: string
  options: { value: string; label: string }[]
  active: boolean
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={placeholder}
      style={{
        background: active ? tokens.color.bg_elevated : 'transparent',
        color: active ? tokens.color.text_heading : tokens.color.text_secondary,
        border: `1px solid ${active ? tokens.color.border_default : tokens.color.border_subtle}`,
        borderRadius: 999,
        padding: '8px 28px 8px 14px',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: tokens.motion.interaction,
        appearance: 'none',
        WebkitAppearance: 'none',
        backgroundImage:
          `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${
            active ? '%231b1f24' : '%2364748b'
          }' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        flexShrink: 0,
      }}
    >
      <option value="all">{active ? allLabel : placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
```

> Native `<select>` mostra o texto da option selecionada como rótulo do
> botão. Como `value="all"` aparece selecionada quando o filtro tá em
> "all", o texto do botão é `placeholder` ("📂 Categoria") quando
> inativo, e `allLabel` ("Todas as categorias") quando o user volta a
> abrir o menu pra mudar — visualmente clean, sem hack de double-option
> nem `__reset`.

- [ ] **Step 4: rodar typecheck**

Run: `cd "/Users/nathanromano/TESTE DE IA/casal-no-azul" && pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 5: commit**

```bash
git add src/components/TabMes.tsx
git commit -m "feat(mes): render category and payment filter selects"
```

---

## Task 5: contador de resultados

**Files:**
- Modify: `src/components/TabMes.tsx`

- [ ] **Step 1: inserir o contador entre os filtros e a lista**

Imediatamente **após** o bloco de filtros (Task 4) e **antes** do bloco `{/* Feed por dia */}`, adicionar:

```tsx
      {/* Contador (só com cat/pay ativos) */}
      {feed.length > 0 && (categoryFilter !== 'all' || paymentFilter !== 'all') && (
        <div
          style={{
            fontSize: tokens.primitive.fontSize.sm,
            color: tokens.color.text_muted,
            marginBottom: tokens.primitive.space[8],
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          Mostrando <strong style={{ color: tokens.color.text_heading, fontWeight: 700 }}>{filtered.length}</strong> de {feed.length} itens · <strong style={{ color: tokens.color.text_heading, fontWeight: 700 }}>{formatBRL(filtered.reduce((s, e) => s + e.amount, 0))}</strong>
        </div>
      )}
```

- [ ] **Step 2: rodar typecheck**

Run: `cd "/Users/nathanromano/TESTE DE IA/casal-no-azul" && pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 3: commit**

```bash
git add src/components/TabMes.tsx
git commit -m "feat(mes): show result counter when filtering"
```

---

## Task 6: empty state com botão "Limpar filtros"

Hoje o empty state filtrado em `TabMes.tsx` (linhas 335-346) é só texto "Nenhum gasto pra esse filtro 🌵". Vamos enriquecer com botão de limpar **todos** os filtros (incluindo pessoa e busca, pra ser um botão de escape mais amplo).

**Files:**
- Modify: `src/components/TabMes.tsx` (em torno das linhas 335-346)

- [ ] **Step 1: localizar o empty state atual**

```tsx
      {filtered.length === 0 && feed.length > 0 && (
        <div
          style={{
            textAlign: 'center',
            color: tokens.color.text_muted,
            padding: `${tokens.primitive.space[16]} 0`,
            fontSize: tokens.primitive.fontSize.md,
          }}
        >
          Nenhum gasto pra esse filtro 🌵
        </div>
      )}
```

- [ ] **Step 2: substituir pelo seguinte (mensagem + botão)**

```tsx
      {filtered.length === 0 && feed.length > 0 && (
        <div
          style={{
            textAlign: 'center',
            color: tokens.color.text_muted,
            padding: `${tokens.primitive.space[16]} 0`,
            fontSize: tokens.primitive.fontSize.md,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div>Nenhum gasto bate com esses filtros 🌵</div>
          <button
            onClick={() => {
              setFilter('all')
              setCategoryFilter('all')
              setPaymentFilter('all')
              setQuery('')
            }}
            style={{
              background: tokens.color.bg_card,
              color: tokens.color.text_heading,
              border: `1px solid ${tokens.color.border_default}`,
              borderRadius: 10,
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Limpar filtros
          </button>
        </div>
      )}
```

- [ ] **Step 3: rodar typecheck**

Run: `cd "/Users/nathanromano/TESTE DE IA/casal-no-azul" && pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 4: commit**

```bash
git add src/components/TabMes.tsx
git commit -m "feat(mes): empty state offers to clear all filters"
```

---

## Task 7: verificação final ponta-a-ponta

**Files:** nenhum.

- [ ] **Step 1: typecheck final**

Run: `cd "/Users/nathanromano/TESTE DE IA/casal-no-azul" && pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 2: smoke test manual no navegador**

Run: `cd "/Users/nathanromano/TESTE DE IA/casal-no-azul" && pnpm dev` (background) e abrir `http://localhost:3000/app`.

Checklist:

- [ ] Aba **Mês** num mês cheio → após chips de pessoa, aparece linha com `📂 Categoria` e `💳 Pagamento` (sem botão `×` ainda).
- [ ] Clicar em "📂 Categoria" → abre picker nativo do OS com opções. Primeira é "Todas as categorias", depois categorias do mês com contagem (ex: "🛒 Mercado (5)").
- [ ] Selecionar uma categoria → chip fica ativo (fundo destacado), lista filtra, **contador aparece** ("Mostrando X de Y itens · R$ ZZ"), botão `×` aparece à direita.
- [ ] Clicar em "💳 Pagamento" → opções são "Todas as formas" + métodos com contagem ("Crédito (3)").
- [ ] Selecionar um método → lista filtra mais (AND), contador atualiza.
- [ ] Botão `×` → limpa categoria + pagamento. Chip de pessoa e busca **permanecem**.
- [ ] Combinar pessoa=Nathan + categoria=Mercado + pagamento=Pix → AND funciona.
- [ ] Forçar zero matches → empty state "Nenhum gasto bate com esses filtros 🌵" + botão "Limpar filtros". Clicar limpa **tudo** (pessoa + busca + cat + pay).
- [ ] Trocar de mês via header → cat + pay resetam pra "all"; pessoa e busca permanecem.
- [ ] Mês vazio → linha de filtros novos **não aparece** (igual a dos chips de pessoa).
- [ ] Card "Por forma de pagamento" na Visão segue intocado (regressão).
- [ ] Adicionar uma categoria custom com nome longo (~30 chars) → texto trunca no select com `…`.

- [ ] **Step 3: commit final (se houver ajuste)**

Se nada precisou ajustar, pular. Caso contrário:

```bash
git add -A
git commit -m "fix(mes): <descrição do ajuste>"
```

---

## Self-Review

- **Spec coverage:**
  - 2 selects nativos estilizados como chip → Task 4 (FilterSelect) ✓
  - Combina com pessoa + busca (AND) → Task 2 ✓
  - Contador só quando cat/pay ativo → Task 5 ✓
  - Dropdowns mostram só opções com itens no mês (após pessoa+busca) → Task 3 ✓
  - "Todas as categorias / formas" como primeira opção → Task 4 ✓
  - Botão `×` limpa cat+pay (não pessoa nem busca) → Task 4 ✓
  - Empty state com "Limpar filtros" que reseta TUDO → Task 6 ✓
  - Reset cat+pay em troca de mês → Task 1 (useEffect) ✓
  - `naoInformado` aparece se houver itens sem método → Task 3 (PAYMENT_METHOD_ORDER inclui `naoInformado`) ✓

- **Placeholder scan:** ok. Tem uma seção "Decisão final" em Task 4 que explica a estrutura do FilterSelect — é decisão, não placeholder. A versão final do componente está completa no fim de Task 4 step 3.

- **Type consistency:** `categoryFilter: string`, `paymentFilter: PaymentMethodKey | 'all'`. O `FilterSelect.onChange` recebe `string` — na chamada do paymentFilter precisa de cast: `onChange={(v) => setPaymentFilter(v as PaymentMethodKey | 'all')}` (presente em Task 4 step 2). `categoryOptions`/`paymentOptions` definidos em Task 3 são consumidos em Task 4.
