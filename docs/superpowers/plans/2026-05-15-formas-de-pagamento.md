# Card "Por forma de pagamento" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar um card "Por forma de pagamento" (donut + lista) na aba Visão do Casal no Azul, agregando despesas avulsas + fixos + parcelas do mês corrente por método de pagamento.

**Architecture:** Novo módulo `src/lib/payment.ts` concentra metadados (labels, cores, ícones SVG) dos métodos. `TabVisao.tsx` estende `computeMonth()` com um bucket `byMethod` e renderiza um novo `ChartCard` reaproveitando o `DonutChart` existente, generalizado de `emoji: string` pra `icon: React.ReactNode`.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, tokens semânticos via CSS vars (`var(--color-*)`). Sem dependências novas. Sem testes automatizados no projeto — verificação é visual em `pnpm dev`.

**Spec:** `docs/superpowers/specs/2026-05-15-formas-de-pagamento-design.md`

---

## File Structure

**Create:**
- `src/lib/payment.ts` — labels, cores, ordem canônica e componente `<PaymentMethodIcon />`.

**Modify:**
- `src/components/TabVisao.tsx`:
  - Tornar `DonutChart` agnóstico (`emoji: React.ReactNode`) e atualizar a chamada do card "Por categoria".
  - Estender `computeMonth(mk)` com `byMethod: Map<PaymentMethodKey, number>`.
  - Renderizar `<ChartCard title="Por forma de pagamento">` após o de categorias.
  - Mostrar nudge quando 100% dos gastos forem "Não informado".

**Not touched:** types, schema Supabase, sync, `AddExpenseSheet`, paywall, bottom nav.

---

## Task 1: criar `src/lib/payment.ts` com metadados e ícones

**Files:**
- Create: `src/lib/payment.ts`

- [ ] **Step 1: criar o módulo com tipos, labels, ordem e cores**

```ts
// src/lib/payment.ts
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
  debito: 'var(--color-person-a)',
  dinheiro: 'var(--color-person-b)',
  boleto: 'var(--color-installment)',
  transferencia: 'var(--color-fixed)',
  naoInformado: 'var(--color-border-default)',
}

/** Resolve a chave do bucket a partir do PaymentMethod opcional do registro. */
export function paymentMethodKey(m: PaymentMethod | undefined): PaymentMethodKey {
  return m ?? 'naoInformado'
}
```

- [ ] **Step 2: adicionar o componente de ícone SVG inline no mesmo arquivo**

Cada ícone usa `currentColor` no `stroke` pra herdar a cor do contexto.

```tsx
// src/lib/payment.ts — append ao final

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
      // diamante (símbolo Pix estilizado, sem usar marca proprietária)
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
```

- [ ] **Step 3: rodar typecheck do projeto**

Run: `pnpm tsc --noEmit`
Expected: nenhum erro novo (o arquivo importa só `PaymentMethod` de `types.ts` que já existe).

- [ ] **Step 4: commit**

```bash
git add src/lib/payment.ts
git commit -m "feat(visao): add payment-method metadata module"
```

---

## Task 2: generalizar `DonutChart` para aceitar `icon: React.ReactNode`

`DonutChart` em `TabVisao.tsx` hoje recebe `emoji: string`. Generalizar pra `icon: React.ReactNode` deixa o card de categorias funcionando igual (string é ReactNode) e abre caminho pro card de métodos passar `<PaymentMethodIcon />`.

**Files:**
- Modify: `src/components/TabVisao.tsx` (componente `DonutChart` ~ linhas 259-385 e a chamada em ~184-191)

- [ ] **Step 1: trocar a prop `emoji` por `icon` em `DonutChart`**

Localizar a assinatura:

```tsx
function DonutChart({
  data, total,
}: {
  data: { label: string; value: number; color: string; emoji: string }[]
  total: number
}) {
```

Trocar para:

```tsx
function DonutChart({
  data, total, centerLabel,
}: {
  data: { label: string; value: number; color: string; icon: React.ReactNode }[]
  total: number
  centerLabel?: string
}) {
```

> `centerLabel` é opcional — default mantém "CATEGORIAS" pra não quebrar quem não passar. O card de métodos vai passar `"MÉTODOS"`.

- [ ] **Step 2: usar `centerLabel` no svg do centro do donut**

Dentro do `<svg>` do donut, localizar:

```tsx
<text
  x="50%"
  y="62%"
  ...
>
  CATEGORIAS
</text>
```

Trocar o texto literal por:

```tsx
<text
  x="50%"
  y="62%"
  ...
>
  {centerLabel ?? 'CATEGORIAS'}
</text>
```

- [ ] **Step 3: renderizar `icon` no lugar do `emoji` na lista lateral**

Localizar o item da lista (dentro do `data.map`):

```tsx
<span style={{ fontSize: 13, flexShrink: 0 }}>{d.emoji}</span>
```

Trocar para:

```tsx
<span
  aria-hidden
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    color: d.color,
    flexShrink: 0,
  }}
>
  {d.icon}
</span>
```

> O `color: d.color` deixa os ícones SVG (que usam `currentColor`) herdarem a cor da fatia. Pro card de categorias, o `icon` vai ser uma string (emoji) — strings ignoram `color`, então o emoji renderiza colorido nativamente. Funciona pros dois.

- [ ] **Step 4: atualizar a chamada do `DonutChart` no card "Por categoria"**

Localizar:

```tsx
<DonutChart
  data={sortedCategories.map(([cat, val], i) => ({
    label: cat,
    value: val,
    color: PALETTE[i % PALETTE.length],
    emoji: categoryEmoji(cat, customCategories),
  }))}
  total={totalForChart}
/>
```

Trocar `emoji:` por `icon:`:

```tsx
<DonutChart
  data={sortedCategories.map(([cat, val], i) => ({
    label: cat,
    value: val,
    color: PALETTE[i % PALETTE.length],
    icon: categoryEmoji(cat, customCategories),
  }))}
  total={totalForChart}
/>
```

- [ ] **Step 5: rodar typecheck e dev server**

Run: `pnpm tsc --noEmit`
Expected: 0 erros.

Run: `pnpm dev` (background) e abrir `/app`.
Expected: card "Por categoria" continua idêntico (emoji + cor + %). Nada visualmente mudou.

- [ ] **Step 6: commit**

```bash
git add src/components/TabVisao.tsx
git commit -m "refactor(visao): generalize DonutChart icon prop"
```

---

## Task 3: agregar `byMethod` em `computeMonth`

**Files:**
- Modify: `src/components/TabVisao.tsx` (função `computeMonth` ~ linhas 37-82)

- [ ] **Step 1: importar helpers do módulo de payment**

No topo do arquivo, abaixo dos imports atuais, adicionar:

```tsx
import { paymentMethodKey, type PaymentMethodKey } from '@/lib/payment'
```

- [ ] **Step 2: inicializar o bucket `byMethod`**

Dentro de `computeMonth`, no bloco que declara `byCategory`, `byPerson`, `byDay`, adicionar:

```tsx
const byMethod = new Map<PaymentMethodKey, number>()
```

- [ ] **Step 3: somar nos 3 loops (expenses, fixed, installments)**

Em **cada um** dos três `forEach` que somam ao `total`, adicionar a linha equivalente:

Dentro do `monthExpenses.forEach((e) => { ... })`:

```tsx
const mk = paymentMethodKey(e.paymentMethod)
byMethod.set(mk, (byMethod.get(mk) ?? 0) + e.amount)
```

Dentro do `monthFixed.forEach((f) => { ... })`:

```tsx
const mk = paymentMethodKey(f.paymentMethod)
byMethod.set(mk, (byMethod.get(mk) ?? 0) + f.amount)
```

Dentro do `monthInst.forEach((i) => { ... })`:

```tsx
const mk = paymentMethodKey(i.paymentMethod)
byMethod.set(mk, (byMethod.get(mk) ?? 0) + i.parcelaMensal)
```

> **Atenção**: o nome `mk` colide com a variável usada em outras partes do `computeMonth`? Não — `monthKey` no escopo externo é `mk` no `computeMonth(mk)`. Dentro de cada `forEach`, é um novo escopo. Mesmo assim, **pra evitar shadowing acidental, renomear a const local para `pmk`** (payment method key):

```tsx
const pmk = paymentMethodKey(e.paymentMethod)
byMethod.set(pmk, (byMethod.get(pmk) ?? 0) + e.amount)
```

Aplicar a mesma renomeação nos 3 loops.

- [ ] **Step 4: incluir `byMethod` no retorno**

Localizar o `return { total, byCategory, byPerson, byDay }` ao final de `computeMonth` e trocar por:

```tsx
return { total, byCategory, byPerson, byDay, byMethod }
```

- [ ] **Step 5: criar `sortedMethods` no escopo do componente**

Logo após `sortedCategories` (~ linhas 91-95), adicionar:

```tsx
const sortedMethods = useMemo(() => {
  return Array.from(cur.byMethod.entries())
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
}, [cur.byMethod])
```

- [ ] **Step 6: rodar typecheck**

Run: `pnpm tsc --noEmit`
Expected: 0 erros. Nada visual muda ainda — `byMethod` é calculado mas não renderizado.

- [ ] **Step 7: commit**

```bash
git add src/components/TabVisao.tsx
git commit -m "feat(visao): aggregate expenses by payment method"
```

---

## Task 4: renderizar o `ChartCard` "Por forma de pagamento"

**Files:**
- Modify: `src/components/TabVisao.tsx` (bloco de render dos charts ~ linhas 180-223)

- [ ] **Step 1: importar metadados de payment no topo do arquivo**

Atualizar o import criado na Task 3:

```tsx
import {
  paymentMethodKey,
  type PaymentMethodKey,
  PAYMENT_METHOD_LABEL,
  PAYMENT_METHOD_COLOR,
  PaymentMethodIcon,
} from '@/lib/payment'
```

- [ ] **Step 2: inserir o novo card depois de "Por categoria"**

Localizar o fechamento do card "Por categoria":

```tsx
{/* ── Donut categorias ── */}
<ChartCard title="Por categoria">
  <DonutChart ... />
</ChartCard>
```

Imediatamente abaixo dele (antes do `<ChartCard title="Por pessoa">`), adicionar:

```tsx
{/* ── Donut formas de pagamento ── */}
{sortedMethods.length > 0 && (
  <ChartCard title="Por forma de pagamento">
    <DonutChart
      centerLabel="MÉTODOS"
      data={sortedMethods.map(([key]) => ({
        label: PAYMENT_METHOD_LABEL[key],
        value: cur.byMethod.get(key) ?? 0,
        color: PAYMENT_METHOD_COLOR[key],
        icon: <PaymentMethodIcon method={key} size={14} />,
      }))}
      total={Array.from(cur.byMethod.values()).reduce((s, v) => s + v, 0)}
    />
  </ChartCard>
)}
```

> O gate `sortedMethods.length > 0` é redundante com o `isEmpty` externo (se total === 0, nada disso renderiza), mas é defensivo: garante que o card não aparece se por algum motivo o total for > 0 mas nenhum bucket tiver valor (impossível pelo design, mas grátis).

- [ ] **Step 3: subir o dev server e validar visualmente**

Run: `pnpm dev` (background).

Checklist no `/app`, com dados reais:

- [ ] Card aparece depois de "Por categoria" e antes de "Por pessoa".
- [ ] Donut central mostra a contagem de métodos usados + label "MÉTODOS".
- [ ] Lista lateral ordenada por valor desc, com bolinha + ícone na cor do método + label + %.
- [ ] Métodos com R$ 0 não aparecem.
- [ ] Trocar de mês recalcula corretamente.
- [ ] Mês sem dados → card não aparece (junto com os outros).

- [ ] **Step 4: commit**

```bash
git add src/components/TabVisao.tsx
git commit -m "feat(visao): add payment-method donut card"
```

---

## Task 5: nudge para 100% "Não informado"

**Files:**
- Modify: `src/components/TabVisao.tsx` (dentro do novo `ChartCard` da Task 4)

- [ ] **Step 1: detectar o caso "tudo não informado"**

No render do novo card, calcular antes do `<DonutChart>`:

```tsx
const methodTotal = Array.from(cur.byMethod.values()).reduce((s, v) => s + v, 0)
const naoInformadoTotal = cur.byMethod.get('naoInformado') ?? 0
const allUnknown = methodTotal > 0 && naoInformadoTotal === methodTotal
```

> Pode parecer redundante extrair `methodTotal` duas vezes — extraia uma única vez e reuse no `total={...}` do `DonutChart`.

A estrutura final do card:

```tsx
{sortedMethods.length > 0 && (() => {
  const methodTotal = Array.from(cur.byMethod.values()).reduce((s, v) => s + v, 0)
  const naoInformadoTotal = cur.byMethod.get('naoInformado') ?? 0
  const allUnknown = methodTotal > 0 && naoInformadoTotal === methodTotal
  return (
    <ChartCard title="Por forma de pagamento">
      <DonutChart
        centerLabel="MÉTODOS"
        data={sortedMethods.map(([key]) => ({
          label: PAYMENT_METHOD_LABEL[key],
          value: cur.byMethod.get(key) ?? 0,
          color: PAYMENT_METHOD_COLOR[key],
          icon: <PaymentMethodIcon method={key} size={14} />,
        }))}
        total={methodTotal}
      />
      {allUnknown && (
        <div
          style={{
            marginTop: 12,
            padding: '10px 12px',
            background: tokens.color.bg_app,
            borderRadius: 10,
            fontSize: 12,
            color: tokens.color.text_muted,
            lineHeight: 1.5,
          }}
        >
          Edite seus gastos pra escolher a forma de pagamento e ver a distribuição.
        </div>
      )}
    </ChartCard>
  )
})()}
```

- [ ] **Step 2: validar visualmente**

Run: `pnpm dev` (background).

- [ ] Caso normal (vários métodos): nudge **não** aparece.
- [ ] Adicionar um gasto novo sem forma de pagamento num mês limpo → nudge aparece.
- [ ] Editar o gasto e escolher Pix → nudge some, card mostra Pix 100%.

- [ ] **Step 3: commit**

```bash
git add src/components/TabVisao.tsx
git commit -m "feat(visao): nudge user when all payments are unknown"
```

---

## Task 6: verificação final ponta-a-ponta

**Files:** nenhum.

- [ ] **Step 1: rodar lint + typecheck final**

Run: `pnpm lint && pnpm tsc --noEmit`
Expected: 0 erros, 0 warnings novos.

- [ ] **Step 2: smoke test manual no navegador**

Run: `pnpm dev` (background) e abrir `http://localhost:3000/app`.

Checklist:

- [ ] Mês vazio → header total mostra "Sem dados", card de pagamentos não aparece.
- [ ] Mês com 1 gasto avulso (Pix) → card mostra 1 fatia verde 100% Pix.
- [ ] Adicionar um fixo (Crédito) → card mostra 2 fatias proporcionais.
- [ ] Adicionar uma parcela (Boleto) → 3 fatias, ordem por valor desc.
- [ ] Editar um gasto, remover o método → ele migra pro bucket "Não informado".
- [ ] Mês cheio só com gastos antigos sem método → nudge aparece.
- [ ] Trocar pra mês anterior com dados → recalcula tudo.
- [ ] Trocar pra mês futuro → card some junto com os outros (total = 0).
- [ ] Card "Por categoria" continua funcionando exatamente igual (emoji, cor, % — regressão check).

- [ ] **Step 3: commit final (se houver ajustes da verificação)**

Se o smoke test passou sem mudanças, pular. Caso contrário:

```bash
git add -A
git commit -m "fix(visao): <descrição do ajuste>"
```

---

## Self-review

- **Spec coverage:**
  - Card "Por forma de pagamento" no TabVisao ✓ (Task 4)
  - Agregação mês corrente (avulsos + fixos + parcelas) ✓ (Task 3)
  - Sem `paymentMethod` → bucket `naoInformado` ✓ (Task 1 `paymentMethodKey`, Task 3)
  - Visual donut + lista igual "Por categoria" ✓ (Task 2 + Task 4)
  - Paleta + ícones SVG inline ✓ (Task 1)
  - Edge: total = 0 → herda `isEmpty` ✓ (gate externo do TabVisao + redundante em Task 4)
  - Edge: 100% não informado → nudge ✓ (Task 5)
  - Sem mudanças em schema/sync ✓ (nenhuma task toca em supabase/types/sheet)
  - `src/lib/payment.ts` novo arquivo ✓ (Task 1)

- **Placeholder scan:** sem TBDs, sem "add appropriate error handling", todo código que precisa aparecer aparece literal.

- **Type consistency:** `PaymentMethodKey`, `PAYMENT_METHOD_LABEL`, `PAYMENT_METHOD_COLOR`, `paymentMethodKey`, `PaymentMethodIcon`, `byMethod`, `sortedMethods`, `methodTotal`, `naoInformadoTotal`, `allUnknown` — todos consistentes entre tasks. `icon: React.ReactNode` em DonutChart bate com `<PaymentMethodIcon />` (Task 1) e com `categoryEmoji(...)` string (Task 2 retrocompat).
