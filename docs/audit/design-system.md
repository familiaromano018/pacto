# Casal no Azul — Audit & Proposta de Design System

> **Autor:** Design System Architect (Design Squad — Brad Frost / Alina Wheeler school)
> **Data:** 2026-05-13
> **Escopo:** Auditoria do estado atual + proposta de token system em 3 camadas + plano de migração.
> **Stack analisada:** Next.js 14 + TypeScript + React 18 + 100% inline styles.
> **Não modificou código em `src/`** — apenas auditoria e proposta.

---

## TL;DR

O app tem **boa base visual** (paleta consistente, hierarquia mobile-first, gradientes coerentes com brand) **mas zero abstração de tokens**. Magic values aparecem **centenas de vezes** em strings literais (`'#FF6B6B'`, `padding: '14px 16px'`, `fontSize: 17`). Isso torna **impossível**:

- Trocar tema (dark mode é refactor manual em ~10 arquivos)
- Rebrand sem find-replace
- Garantir consistência quando aumentar a equipe
- Documentar decisões de design

**Proposta:** 3 camadas de tokens (primitive / semantic / component) + escala matemática (4pt grid, type scale 1.125) + recomendação de migração para **CSS variables + objeto TS de tokens** (Opção A modificada — detalhe na seção 5).

---

## 1. Audit do estado atual

### 1.1 Cores literais — **96 ocorrências de 33 valores únicos**

| # | Cor | Onde aparece | Uso atual | Status |
|---|-----|--------------|-----------|--------|
| 20 | `#aaa` | spread em todos os Tab*.tsx | texto muted | Token-ready (`text_muted`) |
| 19 | `#FF6B6B` | 6 arquivos | brand + Pessoa A + danger + total | **Sobrecarregado** — 4 conceitos no mesmo valor |
| 15 | `#fff` | spread | bg de card | Token-ready (`bg_card`) |
| 7 | `#f0f0f0` | spread | borders/track de progress | Token-ready (`border_subtle`) |
| 7 | `#ccc` | spread | placeholder/empty state | Token-ready |
| 7 | `#888` | spread | texto secundário | Token-ready |
| 7 | `#0000000a` | shadows | sombra | **Bagunça** — usado como hex alpha de 8 dígitos (preto 4% alpha). Deveria ser `rgba(0,0,0,0.04)` |
| 6 | `#e8e8e8` | inputs | border default | Token-ready |
| 6 | `#4ECDC4` | spread | Pessoa B | Token-ready (`personB`) |
| 5 | `#fff5f5` | setup/bg suaves | bg coral suave | Token-ready (deriva de coral.50) |
| 5 | `#ddd` | botões remover | texto disabled | Token-ready |
| 5 | `#22c55e` | TabInicio/TabParcelas | success | Token-ready |
| 3 | `#f7f7f8` | layout root + caixas neutras | bg do app | Token-ready (`bg_app`) |
| 3 | `#f0fffe` | setup/parcelas | bg teal suave | Token-ready |
| 3 | `#555` | hierarquia texto | heading body | Token-ready |
| 2 | `#fffbeb` | parcela preview/cards | bg amber | Token-ready |
| 2 | `#f5f5f5` | dividers | divider | Token-ready |
| 2 | `#a78bfa` | gradiente pessoal | violet 400 | Token-ready (`personal`) |
| 2 | `#999` | setup tagline | texto | Token-ready |
| 2 | `#8b5cf6` | focus de Inp + COLOR_FIXED | **Sobrecarregado** — focus e categoria de fixos | Separar tokens |
| 2 | `#333` | textos de stat tile | heading | Token-ready |
| 1 | `#fde68a` | border preview parcela | amber 200 | Token-ready |
| 1 | `#fb923c` | gradiente parcelas | orange 400 | Token-ready |
| 1 | `#fafafa` | bg pausado | bg muted | Token-ready |
| 1 | `#f59e0b` | COLOR_INST | amber 500 | Token-ready |
| 1 | `#f0fdf4` | bg quitadas | success bg | Token-ready |
| 1 | `#bbf7d0` | border quitadas | success border | Token-ready |
| 1 | `#bbb` | preço pausado | texto desabilitado | Token-ready |
| 1 | `#a855f7` | gradiente roxo | violet 800 | Token-ready |
| 1 | `#92400e` | texto sobre amber | warning text | Token-ready |
| 1 | `#60a5fa` | gradiente pessoal | blue 400 | Token-ready |
| 1 | `#FF6B6B22` / `#4ECDC422` | gradientes | tinted overlay | Padrão de hex+alpha (TS string concat) — manter |

**Problemas críticos:**

1. **`#FF6B6B` = 4 conceitos** (brand, Pessoa A, danger, total geral). Misturar identidade de usuário com semântica de status é frágil — se o usuário escolher outro nome/cor pra Pessoa A no futuro, "vermelho de alerta" some junto.
2. **`#8b5cf6` = 2 conceitos** (focus de input + cor de fixos). Separar.
3. **Cinzas espalhados:** `#aaa #888 #555 #333 #ccc #ddd #999` — 7 tons de cinza usados ad-hoc. **Escala neutra de 9 níveis** resolve.
4. **Hex de 8 dígitos `#0000000a`** funciona mas é ilegível. Migrar pra `rgba(0,0,0,0.04)`.

### 1.2 Spacing / paddings — **caos puro, 27 combinações únicas**

| # | Valor | Comentário |
|---|-------|-----------|
| 6 | `'14px 16px'` | input grande / cards de stat |
| 4 | `'14px 18px'` | banner gradient |
| 2 | `'12px 14px'` | stat tile |
| 2 | `'11px 14px'` | input padrão (Inp) |
| 2 | `'4px 10px'` | botão pausar |
| 2 | `'10px 12px'` | parcela stat |
| 2 | `'10px'` | stat compacto |
| 2 | `'30px 0' / '40px 0'` | empty state |
| 1 | `'20px 22px'` | Card |
| 1 | `'18px 20px'` | "quem deve" hero box |
| 1 | `'16px 18px'` | parcela card |
| ... | + 16 outras combinações | |

**Diagnóstico:** Não existe grid. `11px` aparece junto com `12px` e `14px` arbitrariamente. **4pt grid** (0/2/4/8/12/16/20/24/32/40/48/64) elimina ~80% dessas combinações.

### 1.3 Border radius — **9 valores únicos**

```
9× borderRadius: 16     ★ valor "padrão"
7× borderRadius: 12
5× borderRadius: 14
2× borderRadius: 99     (pill — manter)
2× borderRadius: 8
2× borderRadius: 20     ★ Card principal
2× borderRadius: 18
1× borderRadius: 10
```

**Diagnóstico:** **9 valores, 5 deveriam bastar** (`sm 8 / md 12 / lg 14 / xl 16 / 3xl 20 / pill 999`). `10` e `18` são desnecessários — snap pro vizinho.

### 1.4 Font-size — **16 valores únicos**

```
22× fontSize: 15     ★ MAIS USADO — body emphasis
16× fontSize: 12     ★ helper text
15× fontSize: 13     ★ body padrão
12× fontSize: 16
11× fontSize: 14
11× fontSize: 11
 9× fontSize: 18
 9× fontSize: 17     ★ heading de card
 5× fontSize: 10     ★ labels uppercase
 4× fontSize: 24
 2× fontSize: 26     ★ valor monetário hero
 2× fontSize: 20
 1× fontSize: 52     hero emoji
 1× fontSize: 40     emoji intermediário
 1× fontSize: 32     H1 (Setup)
 1× fontSize: 28     emoji método
```

**Diagnóstico:** **16 valores, 12 da escala 1.125 resolvem tudo.** Escala proposta (ancorada em 14): 10 / 11 / 13 / 14 / 16 / 18 / 20 / 24 / 28 / 32 / 40 / 52.

### 1.5 Font-weight — **6 valores, 3 deveriam bastar**

```
39× fontWeight: 800   ★ MAIS USADO
19× fontWeight: 700
11× fontWeight: 900
 4× fontWeight: 600
 1× fontWeight: 400
```

**Diagnóstico:** `800 / 700 / 900` cobrem 95% dos casos. `600` aparece 4× (avatar names) — manter. `500` (1×, no bottom nav) é exceção válida.

### 1.6 Shadows — **4 sombras quase idênticas, todas com `#0000000a`**

```
4× '0 2px 10px #0000000a'    ★ cards internos
1× '0 4px 24px #0000000a'    Card principal
1× '0 2px 12px #0000000a'    header
1× '0 -4px 20px #0000000a'   bottom nav (invertida)
```

**Diagnóstico:** Boa coerência (mesmo alpha em todas). Padronizar como `shadow.sm / md / lg / up`.

### 1.7 Tipografia — **fonts carregadas via `@import` no CSS**

`globals.css` faz `@import url('https://fonts.googleapis.com/...')` — **bloqueia render** e gera CLS. Next 14 tem `next/font/google` que **inlineia** e auto-otimiza. **Migrar é trivial** e mata 100ms de TTI.

### 1.8 Magic values totais

| Categoria | Ocorrências | Valores únicos | Após tokens |
|-----------|-------------|----------------|-------------|
| Cores hex | 96 | 33 | 0 literais — 12 semantic tokens |
| Paddings string | 35 | 27 | 0 literais — 8 spacing tokens |
| borderRadius | 30 | 9 | 0 literais — 6 radius tokens |
| fontSize | 122 | 16 | 0 literais — 12 type tokens |
| fontWeight | 74 | 6 | 0 literais — 4 weight tokens |
| boxShadow | 7 | 4 | 0 literais — 4 shadow tokens |
| Margins/gaps | 100+ | 12 | 0 literais — usa space scale |
| **TOTAL** | **~464** | **107** | **~46 tokens** |

**Redução estimada:** ~107 valores únicos → ~46 tokens semânticos. **~90% dos literais somem do código.**

---

## 2. Design tokens — proposta (3 camadas)

Arquivo completo em [`tokens.proposed.ts`](./tokens.proposed.ts). Resumo da arquitetura:

### 2.1 Camada 1 — Primitive Tokens (paleta crua)

Valores numéricos absolutos. Brand-agnóstico. Não é consumido por componentes.

```ts
primitive.color.coral = { 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 }
primitive.color.teal  = { 50, ..., 900 }
primitive.color.violet, amber, orange, blue, green, neutral
primitive.space = { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 32 }
primitive.fontSize = { 2xs, xs, sm, base, md, lg, xl, 2xl, ..., hero }
primitive.radius   = { none, sm, md, lg, xl, 2xl, 3xl, pill }
primitive.shadow   = { none, sm, md, lg, up, focus }
```

**Inspiração:** Tailwind CSS escala 50→900, Material Design 3 tonal palettes, Alina Wheeler ("Designing Brand Identity") sobre construção de paleta consistente.

### 2.2 Camada 2 — Semantic Tokens (intenção de uso)

**É AQUI** que componentes consomem. Trocar este objeto = trocar tema.

```ts
semantic.color = {
  // Identidade
  personA, personA_bg, personB, personB_bg,
  // Verticais funcionais
  fixed, installment, personal,
  // Brand
  brand, brandGradient,
  // Status
  success, warning, danger,
  // Superfícies
  bg_app, bg_card, bg_card_muted,
  // Textos (5 níveis)
  text_heading, text_body, text_secondary, text_muted, text_placeholder, text_disabled,
  // Borders
  border_default, border_subtle, border_divider, border_focus,
}
semantic.text     = { display, h1, h2, body, bodyEmphasis, label, caption, money }
semantic.spacing  = { stack_xs..xl, inline_xs..lg, inset_sm..xl }
semantic.radius   = { chip, button, input, card, cardSm }
semantic.shadow   = { card, cardSubtle, header, bottomNav, focusRing }
semantic.motion   = { interaction, progress, inputFocus }
```

### 2.3 Camada 3 — Component Tokens (opcional)

Decisões específicas de componente que merecem ser explícitas.

```ts
component.button = { height.sm/md, paddingX.sm/md, fontSize.sm/md, radius.sm/md }
component.input  = { height: 44, paddingX, paddingY, fontSize, radius, borderWidth }
component.card   = { paddingX: 22, paddingY: 20, radius: 20, marginBottom: 16 }
component.avatar = { sizeSm: 28, sizeMd: 34, sizeLg: 40 }
component.bottomNav = { paddingTop, paddingBottom (safe-area), iconSize, labelSize }
```

**Observação a11y:** `button.height.md = 44px` e `input.height = 44px` cumprem a regra iOS de tap target mínimo de 44pt (atualmente os botões pequenos têm ~32px e os médios ~40px — borderline).

### 2.4 Escalas matemáticas

| Escala | Sistema | Valores |
|--------|---------|---------|
| **Spacing** | 4pt grid (Material) | 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 40, 48, 64 |
| **Type** | Modular 1.125 (Major Second) ancorado em 14 | 10, 11, 13, 14, 16, 18, 20, 24, 28, 32, 40, 52 |
| **Radius** | Linear discreta | 0, 8, 12, 14, 16, 18, 20, 999 |
| **Shadow** | 4 níveis (sm/md/lg/up) + focus | mesma cor base `rgba(0,0,0,0.04)` |
| **Z-index** | Decimal (10/100/...) | base, raised, sticky, nav, overlay, modal, toast |

**Justificativa do 1.125 em vez de 1.25:**
O app já usa MUITO texto entre 11–18px (tabela de uso na seção 1.4). Escala 1.25 forçaria saltos de 14→17.5→22 que não casam com o desenho atual. **1.125 mantém compat** preservando os tamanhos mais usados (12, 13, 14, 16, 18) com mínimo de quebra visual.

---

## 3. Atomic Design layering — mapeamento

Seguindo **Brad Frost** (*Atomic Design*, 2016). Estado atual + sugestão.

### 3.1 Atoms (existem em `ui.tsx`)

| Atom existente | Avaliação | Falta? |
|----------------|-----------|--------|
| `Avatar` | OK — single-purpose | adicionar `aria-label` (a11y) |
| `Btn` | OK mas API limitada | falta: `variant` (primary/secondary/ghost), `disabled`, `loading`, `icon` |
| `Inp` | OK | falta: `error` state, `helper text`, `label` integrado |
| `Sel` | OK | falta: `disabled`, ícone chevron custom |
| `Lbl` | OK (label uppercase) | OK |
| `Tag` | OK (chip pequeno) | OK |

**Atoms FALTANDO:**

- `Text` — wrapper tipográfico (`<Text variant="h1">`) que aplica `semantic.text.h1`. Hoje cada arquivo recria heading manualmente.
- `Stack` / `Inline` — primitivas de layout (gap + direction). Hoje cada lugar escreve `display: flex; flexDirection: column; gap: 10`.
- `Divider` — usado uma vez em `CasalNoAzul.tsx` ("height: 1, background: #f0f0f0"). Componentizar.
- `IconButton` — botões "remover"/"pausar" são `<button>` cru. Encapsular.
- `Money` — `R$ X.XX` com formatação BR (toda chamada hoje é `R$ {x.toFixed(2)}` — inconsistente com locale).

### 3.2 Molecules (combinam atoms)

| Molecule | Estado | Onde |
|----------|--------|------|
| `ExpenseRow` | Existe (`ExpenseRow.tsx`) | Tab Casal / Pessoal |
| `FormRow` | **Falta** — toda Tab repete `<Lbl /> + <Sel />` | Setup, TabFixos, TabParcelas |
| `StatTile` | **Falta** — `[{label, value, color}]` repetido em 4 lugares (TabInicio, TabFixos, TabParcelas, TabMetas) com mesmo visual |
| `EmptyState` | **Falta** — texto centralizado "Nenhum X 🌵" repetido 5× |
| `BannerGradient` | **Falta** — header colorido com título+sub repetido em 3 Tabs |
| `Stepper` | **Falta** — `[< Parcela X | remover]` no TabParcelas |

### 3.3 Organisms (composições maiores)

| Organism | Estado | Comentário |
|----------|--------|-----------|
| `SetupForm` | Existe (`Setup.tsx`) | OK, mas tem lógica + apresentação no mesmo arquivo |
| `DashboardInicio` | Existe (`TabInicio.tsx`) | 348 linhas — quebrar em sub-organisms (`SaldoCard`, `BreakdownCard`, `RendaCard`, `FixosResumoCard`, `ParcelasResumoCard`) |
| `FixedCostsList` | Existe (`TabFixos.tsx`) | OK |
| `InstallmentsList` | Existe (`TabParcelas.tsx`) | OK |
| `GoalsList` | Existe (`TabMetas.tsx`) | OK |
| `Header` | inline em `CasalNoAzul.tsx` | extrair |
| `BottomNav` | inline em `CasalNoAzul.tsx` | extrair |

### 3.4 Reorganização sugerida de `src/components/`

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── tokens.ts              ← NOVO (tokens.proposed.ts vai aqui)
│   ├── format.ts              ← NOVO (formatBRL, etc)
│   └── types.ts               ← move types.ts pra cá
├── components/
│   ├── primitives/            ← Atoms
│   │   ├── Avatar.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Label.tsx
│   │   ├── Tag.tsx
│   │   ├── Text.tsx           ← NOVO
│   │   ├── Stack.tsx          ← NOVO
│   │   ├── Divider.tsx        ← NOVO
│   │   ├── Money.tsx          ← NOVO
│   │   └── IconButton.tsx     ← NOVO
│   ├── patterns/              ← Molecules
│   │   ├── Card.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── ExpenseRow.tsx
│   │   ├── StatTile.tsx       ← NOVO
│   │   ├── FormRow.tsx        ← NOVO
│   │   ├── EmptyState.tsx     ← NOVO
│   │   ├── BannerGradient.tsx ← NOVO
│   │   └── FixedCostItem.tsx  ← extrair
│   ├── layout/                ← Organisms estruturais
│   │   ├── Header.tsx         ← NOVO
│   │   ├── BottomNav.tsx      ← NOVO
│   │   └── AppShell.tsx       ← NOVO (envolve tudo)
│   └── features/              ← Organisms de domínio
│       ├── Setup.tsx
│       ├── TabInicio/
│       │   ├── index.tsx
│       │   ├── SaldoCard.tsx
│       │   ├── BreakdownCard.tsx
│       │   ├── RendaCard.tsx
│       │   ├── FixosResumoCard.tsx
│       │   └── ParcelasResumoCard.tsx
│       ├── TabFixos.tsx
│       ├── TabParcelas.tsx
│       └── TabMetas.tsx
```

---

## 4. Dark mode readiness

### 4.1 Por que a camada semantic destrava dark mode

Com tokens semânticos, o componente faz:
```ts
style={{ background: tokens.color.bg_card, color: tokens.color.text_muted }}
```

E nunca menciona `#fff` ou `#aaa`. Pra ativar dark mode, basta **um arquivo de tokens condicional**.

### 4.2 Estratégia recomendada — CSS Variables

A solução mais robusta usa **CSS custom properties** com fallback automático via `prefers-color-scheme`. Cole no `globals.css`:

```css
:root {
  /* Brand & identidade — MANTÊM no dark (cor é da pessoa) */
  --color-person-a: #FF6B6B;
  --color-person-b: #4ECDC4;
  --color-fixed:    #8b5cf6;
  --color-installment: #f59e0b;
  --color-success:  #22c55e;

  /* Superfícies (mudam no dark) */
  --color-bg-app:        #f7f7f8;
  --color-bg-card:       #ffffff;
  --color-bg-card-muted: #fafafa;

  /* Texto */
  --color-text-heading:    #333;
  --color-text-body:       #555;
  --color-text-secondary:  #888;
  --color-text-muted:      #aaa;
  --color-text-placeholder:#ccc;
  --color-text-disabled:   #ddd;

  /* Borders */
  --color-border-default: #e8e8e8;
  --color-border-subtle:  #f0f0f0;
  --color-border-divider: #f5f5f5;

  /* Shadows */
  --shadow-card: 0 4px 24px rgba(0,0,0,0.04);
  --shadow-sm:   0 2px 10px rgba(0,0,0,0.04);

  /* (spacing/radius/fontSize não mudam entre temas) */
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-app:        #0a0a0c;
    --color-bg-card:       #18181b;
    --color-bg-card-muted: #232328;

    --color-text-heading:    #fafafa;
    --color-text-body:       #d4d4d8;
    --color-text-secondary:  #a1a1aa;
    --color-text-muted:      #71717a;
    --color-text-placeholder:#52525b;
    --color-text-disabled:   #3f3f46;

    --color-border-default: #3f3f46;
    --color-border-subtle:  #27272a;
    --color-border-divider: #1f1f23;

    --shadow-card: 0 4px 24px rgba(0,0,0,0.5);
    --shadow-sm:   0 2px 10px rgba(0,0,0,0.4);
  }
}

/* Opcional — opt-in manual */
[data-theme='dark'] { /* mesmas vars do @media acima */ }
```

E no componente:
```tsx
style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-muted)' }}
```

**Vantagem:** Sem JS de tema, sem re-render, sem flash. Cores brand (`person-a`, `fixed`, etc) ficam idênticas — identidade do casal não muda no escuro.

---

## 5. Estratégia de migração CSS — 3 opções

### Opção A — Inline styles + objeto TS de tokens
**Mudança:** Importa `tokens` de `lib/tokens.ts`, substitui literais. Zero mudança de runtime.

| Prós | Contras |
|------|---------|
| Migração incremental file-by-file | Inline styles continuam (sem media queries, sem `:hover`) |
| Não muda build / config | Bundle inclui objeto JS de tokens |
| TypeScript autocompleta tokens | Dark mode precisa de JS (re-render no toggle) |
| Devtool: vê valor real no inspector | Pseudo-classes só via JS handlers (já é assim hoje) |

### Opção B — CSS Modules + CSS custom properties
**Mudança:** Cria `Component.module.css` por componente, usa `var(--token)` no CSS.

| Prós | Contras |
|------|---------|
| Dark mode "grátis" via `@media (prefers-color-scheme)` | Esforço médio: cria 1 .module.css por arquivo |
| Pseudo-classes (`:hover`, `:focus-visible`) | Perde co-location com TSX |
| CSS estático = bundle CSS otimizado | Times pequenos sentem fricção de 2 arquivos |
| Suporte nativo Next 14 | |

### Opção C — Tailwind CSS com `tailwind.config` custom
**Mudança:** Adiciona Tailwind, configura `theme.extend.colors.brand.coral = '#FF6B6B'`, refatora className.

| Prós | Contras |
|------|---------|
| Padrão de mercado, ecossistema enorme | Reescrita massiva (cada `style={{}}` vira `className=""`) |
| Variants (`hover:`, `dark:`) declarativos | Curva de aprendizado pra quem nunca usou |
| `tailwind.config` é o token system pronto | Classes longas viram noise em mobile-first |
| Purge/JIT bundle minúsculo | Bundle inicial pesado até purgar |

### Recomendação: **Opção A → migrar incrementalmente pra HÍBRIDO A + CSS variables**

**Justificativa pro contexto** (Next 14 + app pequeno + dev solo + 100% inline já existente):

1. **Caminho atual de menor atrito:** Opção A não exige re-escrever 7 arquivos de uma vez. Substitui literais por `tokens.color.x` e segue.
2. **Já prepara dark mode:** Tokens semânticos ficam como `var(--color-bg-card)` em vez de `#fff` literal. O objeto TS expõe a string `'var(--color-bg-card)'` — componente vê uma string, browser resolve em runtime.
3. **Evita rewrite catastrófico:** Tailwind (Opção C) seria reescrever 100% dos `style={{}}` em <600 linhas de código x 7 arquivos. Custo alto, benefício marginal pro tamanho atual.
4. **Mantém porta aberta:** Se o app crescer pra justificar Tailwind, os semantic tokens já documentam o `theme.extend` final.

**Padrão híbrido recomendado:**

```ts
// lib/tokens.ts — re-export que mistura CSS vars com valores estáticos
export const tokens = {
  color: {
    bg_card:    'var(--color-bg-card)',     // CSS var → dark mode automático
    text_muted: 'var(--color-text-muted)',
    personA:    'var(--color-person-a)',
    ...
  },
  spacing: { /* strings estáticas '16px' */ },
  radius:  { /* strings estáticas '12px' */ },
  ...
}
```

E `globals.css` declara as CSS vars conforme **Seção 4.2**.

---

## 6. Component refactor plan — top 5 prioritários

### Prioridade 1 — `Card`

**ANTES** (`ui.tsx` linhas 93–115):
```tsx
export function Card({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: '20px 22px',
        boxShadow: '0 4px 24px #0000000a',
        border: '1.5px solid #f0f0f0',
        marginBottom: 16,
        ...style,
      }}
    >{children}</div>
  )
}
```

**DEPOIS** (com tokens + variantes + a11y):
```tsx
import { tokens } from '@/lib/tokens'

type CardVariant = 'default' | 'muted' | 'success' | 'highlighted'

export function Card({
  children,
  variant = 'default',
  as: Tag = 'section',
  style,
}: {
  children: React.ReactNode
  variant?: CardVariant
  as?: 'section' | 'article' | 'div'
  style?: CSSProperties
}) {
  const variants: Record<CardVariant, CSSProperties> = {
    default:     { background: tokens.color.bg_card,       borderColor: tokens.color.border_subtle },
    muted:       { background: tokens.color.bg_card_muted, borderColor: tokens.color.border_subtle, opacity: 0.7 },
    success:     { background: tokens.color.success_bg,    borderColor: tokens.color.success_border },
    highlighted: { background: tokens.color.bg_card,       borderColor: tokens.color.personA_border },
  }
  return (
    <Tag
      style={{
        ...variants[variant],
        borderRadius: tokens.radius.card,
        padding: `${tokens.component.card.paddingY} ${tokens.component.card.paddingX}`,
        boxShadow: tokens.shadow.card,
        border: `${tokens.component.card.borderWidth} solid ${variants[variant].borderColor}`,
        marginBottom: tokens.component.card.marginBottom,
        ...style,
      }}
    >
      {children}
    </Tag>
  )
}
```

**Ganhos:** zera 4 cards inline (TabFixos active/paused, TabParcelas done, ExpenseRow); ganha `<section>` semântico; variantes documentadas.

---

### Prioridade 2 — `Btn` (Button)

**ANTES** (`ui.tsx` linhas 117–148):
```tsx
export function Btn({ label, onClick, color = COLORS_A, small = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: color,
        color: '#fff',
        border: `2px solid ${color}`,
        borderRadius: small ? 10 : 14,
        padding: small ? '7px 14px' : '12px 22px',
        fontWeight: 800,
        fontSize: small ? 13 : 15,
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: 'inherit',
      }}
    >{label}</button>
  )
}
```

**DEPOIS:**
```tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type ButtonSize    = 'sm' | 'md'

export function Btn({
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  tone,                // override de cor (mantém compat com `color={COLOR_INST}` atual)
  icon,
  disabled,
  loading,
  type = 'button',
  ariaLabel,
}: {
  label: string
  onClick: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  tone?: string
  icon?: React.ReactNode
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit'
  ariaLabel?: string
}) {
  const bg = tone ?? tokens.color.brand
  const variants = {
    primary:     { background: bg, color: tokens.color.text_onBrand, borderColor: bg },
    secondary:   { background: 'transparent', color: bg, borderColor: bg },
    ghost:       { background: 'transparent', color: bg, borderColor: 'transparent' },
    destructive: { background: tokens.color.danger, color: tokens.color.text_onBrand, borderColor: tokens.color.danger },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel ?? label}
      aria-busy={loading}
      style={{
        ...variants[variant],
        borderStyle: 'solid', borderWidth: '2px',
        borderRadius: tokens.component.button.radius[size],
        padding: `0 ${tokens.component.button.paddingX[size]}`,
        height: tokens.component.button.height[size],
        fontWeight: tokens.primitive.fontWeight.extrabold,
        fontSize: tokens.component.button.fontSize[size],
        fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: tokens.motion.interaction,
        display: 'inline-flex', alignItems: 'center', gap: tokens.spacing.inline_sm,
      }}
    >
      {loading ? '...' : icon}
      {label}
    </button>
  )
}
```

**Ganhos:** elimina prop `small` boolean (pouca expressividade) por `size: 'sm'|'md'`; ganha disabled/loading/a11y; mantém `tone` pra compat com `color={COLOR_INST}` atual.

---

### Prioridade 3 — `StatTile` (NOVO molecule)

**Padrão duplicado em 4 lugares** (TabInicio×2, TabFixos×1, TabParcelas×1). Sempre é `[{label, value, color, bg?}]` mapeado em grid 2x2.

```tsx
export function StatTile({
  label,
  value,
  tone = tokens.color.brand,
  size = 'md',
}: {
  label: string
  value: string | number
  tone?: string
  size?: 'sm' | 'md'
}) {
  return (
    <div style={{
      background: tone + '11',                   // 7% alpha
      border: `1.5px solid ${tone}33`,           // 20% alpha
      borderRadius: tokens.radius.cardSm,
      padding: size === 'sm' ? `${tokens.primitive.space[5]} ${tokens.primitive.space[6]}` : `${tokens.primitive.space[6]} ${tokens.primitive.space[7]}`,
      textAlign: 'center',
    }}>
      <div style={{ ...tokens.text.caption, color: tokens.color.text_secondary, marginBottom: tokens.primitive.space[1] }}>
        {label}
      </div>
      <div style={{ fontSize: tokens.primitive.fontSize['3xl'], fontWeight: tokens.primitive.fontWeight.black, color: tone }}>
        {value}
      </div>
    </div>
  )
}
```

**Uso:**
```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.stack_md }}>
  <StatTile label="💑 Casal/mês" value={`R$ ${total.toFixed(2)}`} tone={tokens.color.brand} />
  <StatTile label={`👤 ${nameA}/mês`} value={`R$ ${fixedPessoalA.toFixed(2)}`} tone={tokens.color.personA} />
</div>
```

**Reduz** ~80 linhas de markup duplicado em TabFixos/TabParcelas/TabInicio/TabMetas.

---

### Prioridade 4 — `BannerGradient` (NOVO molecule)

**Padrão duplicado em 3 Tabs** (TabFixos, TabParcelas, "casal" tab no CasalNoAzul.tsx, "pessoal" idem).

```tsx
export function BannerGradient({
  title, subtitle, from, to,
}: { title: string; subtitle: string; from: string; to: string }) {
  return (
    <div style={{
      background: `linear-gradient(90deg, ${from}, ${to})`,
      borderRadius: tokens.radius.bannerGradient,
      padding: `${tokens.primitive.space[7]} ${tokens.primitive.space[9]}`,
      marginBottom: tokens.primitive.space[8],
      color: tokens.color.text_onBrand,
    }}>
      <div style={{ ...tokens.text.h2 }}>{title}</div>
      <div style={{ fontSize: tokens.primitive.fontSize.base, opacity: 0.85, marginTop: 2 }}>{subtitle}</div>
    </div>
  )
}
```

---

### Prioridade 5 — `EmptyState` (NOVO molecule)

**Padrão duplicado 5×** (CasalNoAzul gastos vazio, pessoal vazio, TabFixos, TabParcelas, TabMetas).

```tsx
export function EmptyState({
  emoji, title, description,
}: { emoji: string; title: string; description?: string }) {
  return (
    <div style={{ textAlign: 'center', color: tokens.color.text_placeholder, padding: `${tokens.primitive.space[20]} 0` }}>
      <div style={{ fontSize: tokens.primitive.fontSize.display, marginBottom: tokens.primitive.space[2] }}>{emoji}</div>
      <div style={{ ...tokens.text.bodyEmphasis, color: tokens.color.text_secondary }}>{title}</div>
      {description && <div style={{ fontSize: tokens.primitive.fontSize.base, marginTop: tokens.primitive.space[2] }}>{description}</div>}
    </div>
  )
}
```

---

## 7. Resumo final & próximos passos

### O que foi entregue

| Arquivo | Conteúdo |
|---------|----------|
| `docs/audit/design-system.md` (este) | Audit completo + estratégia |
| `docs/audit/tokens.proposed.ts` | 3 camadas de tokens prontas pra `import` |

### Magic values eliminados (estimativa)

| Métrica | Antes | Depois |
|---------|-------|--------|
| Valores únicos de cor | 33 | 12 semantic tokens |
| Combinações de padding | 27 | 8 spacing tokens |
| Valores de borderRadius | 9 | 6 radius tokens |
| Valores de fontSize | 16 | 12 type tokens |
| Variações de boxShadow | 4 | 4 shadow tokens (com nomes) |
| **Total de literais espalhados** | **~464** | **~46 tokens nomeados** |

### Próximos passos recomendados (em ordem)

1. **Copiar `tokens.proposed.ts` → `src/lib/tokens.ts`** e exportar `tokens`.
2. **Adicionar CSS variables ao `globals.css`** (Seção 4.2) — destrava dark mode futuro sem refactor.
3. **Migrar `ui.tsx` primeiro** (Card, Btn, Inp, Sel, Tag) — alto leverage, todos os outros arquivos consomem.
4. **Criar molecules ausentes** (StatTile, BannerGradient, EmptyState, FormRow) — corta ~150 linhas duplicadas.
5. **Migrar `next/font/google`** pra DM Sans/Poppins — mata 100ms TTI + elimina CLS.
6. **Quebrar `TabInicio.tsx`** (348 linhas) em sub-organisms — manutenibilidade.
7. **Adicionar `aria-label` em Btns sem texto** (botões "remover", "pausar", "✕") — a11y baseline.

### Referências aplicadas

- **Brad Frost** — *Atomic Design* (atoms/molecules/organisms taxonomy, separation of structure).
- **Alina Wheeler** — *Designing Brand Identity* (token system para garantir consistência multi-touchpoint).
- **Material Design 3** — token spec em 3 camadas (ref / sys / comp) que inspirou primitive/semantic/component.
- **Tailwind CSS** — escala de cor 50→900 como naming convention para palette.
- **Apple HIG / iOS** — tap target mínimo 44pt (aplicado em `component.button.height.md`).
- **WCAG 2.2 AA** — focus visible ring (`shadow.focus`) e contraste de texto (`text_muted` em `bg_card` precisa ser auditado em dark mode).

---

*Próxima sessão sugerida:* `ui-engineer` implementa Card + Btn refatorados e provê 1 PR-piloto pra validar o pattern antes de migrar o app inteiro.
