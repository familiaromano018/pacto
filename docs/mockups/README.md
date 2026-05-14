# Casal no Azul — Mockups visuais (v2)

Mockups HTML standalone propondo o redesign do app. Cada arquivo abre direto no browser, sem build, sem dependência externa quebrável (só Google Fonts via `<link>`).

## Arquivos

| # | Arquivo | O que mostra |
|---|---------|--------------|
| 01 | `mockup-01-dashboard.html` | Tela inicial redesenhada — hero "quem deve" em destaque, stats compactos, recent list, FAB |
| 02 | `mockup-02-expenses-list.html` | **NOVO** — tela unificada de TODAS as despesas, com chips de filtro, busca, agrupamento contextual, total dinâmico + empty state |
| 03 | `mockup-03-add-expense.html` | Bottom sheet "novo gasto" (quick capture) + variante de parcela + tela de sucesso |
| 04 | `mockup-04-installments.html` | Parcelas redesenhadas — hero roxo com summary, progress segmentado, agrupamento por urgência, quitados em fantasma |
| 05 | `mockup-05-bottom-nav.html` | Comparison side-by-side: nav atual (6 tabs) vs proposta (4 tabs + FAB central) + mapeamento de transição |

Como usar: abre qualquer `.html` direto no browser (Chrome/Safari/Firefox). Não precisa server.

---

## Sistema de design (decisões consolidadas)

### Color tokens

| Token | Hex | Uso |
|-------|-----|-----|
| `--coral` | `#FF6B6B` | Primary / Ana / pendência / CTA |
| `--coral-dark` | `#ee5a5a` | Hover / press |
| `--teal` | `#4ECDC4` | Secondary / Pedro / "casal" |
| `--amber` | `#f59e0b` | Highlight / "casal" indicator |
| `--purple` | `#8b5cf6` | Parcelados / compromisso de longo prazo |
| `--green` | `#10b981` | Sucesso / pago / "ok" |
| `--red` | `#ef4444` | Alert / vence em breve |
| `--ink-900` | `#0f1419` | Texto principal / CTA escuro |
| `--ink-700` | `#2d3748` | Subtítulos |
| `--ink-500` | `#64748b` | Meta / labels secundários |
| `--ink-100` | `#f1f5f9` | Borders / divisórias |
| `--ink-50` | `#f8fafc` | BG de chips inactive |
| `--bg` | `#f3f4f6` | Background base do app |

**Mudança vs atual:** background do app passa de cinza chapado pra **gradient suave triplo** (`#faf5ff → #f0fdfa → #fff7ed`). Mais "warm", mantém identidade playful sem pesar.

### Typography

- **Inter** (400/500/600/700/800) — body, UI text, meta
- **Poppins** (600/700/800/900) — headlines, valores monetários, números fortes

**Por quê duas fonts:** Inter é o cavalo de batalha (legível, neutro). Poppins entra só onde queremos AUTORIDADE — valor em R$, headline hero, totals de seção. Mesmo grotesque feel, mas Poppins tem mais peso/personalidade nos pesos altos.

**Scale (mobile):**
- 26-32px → hero headline (Poppins 800)
- 56px → valor input gigante (Poppins 900) — apenas tela de cadastro
- 20-22px → page titles (Poppins 800)
- 14-15px → body / row titles (Inter 600-700)
- 12-13px → labels, captions (Inter 500-600)
- 10-11px → micro labels uppercase (Inter 700)

### Spacing & radius

- Container max-width: **420px mobile** (era 480)
- Border radius:
  - 14-18px → cards e inputs (era 12)
  - 22-28px → hero cards e bottom sheets
  - 100px → chips, pills (era variados)
- Card padding: 14-22px
- Shadow leve em cards: `0 1px 2px rgba(0,0,0,.04), 0 4px 14px rgba(0,0,0,.05)`
- Shadow forte em FAB e hero: shadow colorido coral 25-45% opacity

### Iconography

**Mudança importante:** emojis param de carregar peso de navegação principal. Bottom nav passa a usar **SVG stroke 2px estilo Lucide** (consistente, escalável, acessível).

Emojis continuam vivos onde fazem sentido:
- Categorias de despesa (🛒 🍕 🏠 ⛽ etc.)
- Decoração emocional ("Anotado! 🙌", "80% pago 🎉")
- Headlines emocionais ("Bom dia, Ana 👋")

Não mais em navegação primária.

### Visual identity — Ana & Pedro

Cada pessoa tem cor consistente em todo lugar:
- **Ana = coral** (`#FF6B6B`)
- **Pedro = teal** (`#4ECDC4`)
- **Casal = split gradient coral+teal** (ou âmbar `#f59e0b` quando precisa de neutro)

Aplicado em: avatares, payer-dots (mini 14px nas rows), borders de filter chips, cards segmentados de "quem pagou".

---

## Decisões que diferem do app atual & POR QUÊ

### 1. Background → gradient triplo suave
**Antes:** cinza `#f3f4f6` chapado.
**Agora:** gradient `lavanda → mint → peach`.
**Por quê:** o cinza chapado deixava o app frio. O gradient pastel reforça a vibe "casal warm/playful" sem competir com cards (que continuam brancos).

### 2. Bottom nav: 6 → 4 tabs + FAB
**Antes:** Início · Fixos · Parcelas · Análise · Metas · Perfil (todos com peso igual).
**Agora:** Início · Gastos · [FAB] · Análise · Casal.
**Por quê:** Lei de Hick. Fixos/Parcelas/Avulsos viram filtros dentro de "Gastos". Perfil/Metas viram sub-views dentro de "Casal". FAB destaca primary action (cadastrar). Tap targets crescem ~40%.

### 3. Hierarquia do dashboard
**Antes:** 7 cards brancos com peso visual idêntico.
**Agora:** 1 hero gradient coral GIGANTE ("quem deve pra quem") + 2 stats compactos + 1 composition card + recent list.
**Por quê:** "quem deve" é a info mais consultada e a única acionável imediatamente. Tem que dominar. Resto é referência, fica menor.

### 4. Tela "Gastos" (NOVA, lista unificada)
**Antes:** não existia. Usuário precisava ir em Fixos OU Parcelas OU... pra ver tudo.
**Agora:** uma lista única com chips de filtro (Todos/Ana/Pedro/Casal/Fixos/Parcelados/Avulsos), busca livre, agrupamento contextual (esta semana / parcelas em aberto / fixos do mês), total dinâmico que atualiza com filtro.
**Por quê:** requisito explícito do user. Resolve a fragmentação mental de "onde tá aquele gasto que lancei?".

### 5. Cadastro de gasto: bottom sheet "quick capture"
**Antes:** página inteira separada com form vertical longo.
**Agora:** bottom sheet que sobe sobre o contexto. Valor em 56px com cursor pulsante (teclado numérico aparece automático). Categoria como chips coloridos. Quem pagou = 3 cards segmentados. Tipo = 3 cards radio. Submit com sucesso celebratório.
**Por quê:** reduzir fricção. Cadastrar gasto é o ato mais repetido — tem que ser leve. Bottom sheet mantém contexto da tela anterior (mental model não quebra).

### 6. Parcelas: hero roxo + progress segmentado
**Antes:** cards grandes individuais por parcela, expandíveis.
**Agora:** hero summary roxo com "total devendo" + "liberta em jan/27" (storytelling de fim). Cards densos com progress como X dots discretos (verde=pago, coral pulsante=atual, cinza=pendente).
**Por quê:** o usuário pensa "quantas faltam" não "% pago". Dots batem com o modelo mental. Roxo diferencia visualmente da seção coral (pendência) e teal (composição).

### 7. Payer-dot inline
**NOVO componente:** círculo de 14px com inicial branca, gradient coral (Ana) / teal (Pedro) / split (Casal). Usado em todas as listas pra mostrar quem pagou sem ocupar espaço de coluna.

### 8. Tags coloridas por tipo
- `casal` → âmbar pastel (`#fef3c7` / `#92400e`)
- `fixo` → roxo pastel (`#ede9fe` / `#8b5cf6`)
- `parcela` → vermelho pastel (`#fee2e2` / `#b91c1c`)
- `avulso` → verde pastel (`#d1fae5` / `#047857`)

Tags pequenas (9-10px) pra não roubar protagonismo do valor.

---

## Tom & voice (mantido, refinado)

Continua brincalhão e direto. Manteve:
- "Bom dia, Ana 👋"
- "Anotado! Sua planilha agradece 🙌"
- "Cofrinho vazio (ainda)" no empty state
- "Liberta em jan/27" (parcelas)
- "Fim das brigas. Começa a planilha 😂" (mantido como tagline na onboarding)

Adicionou:
- "Bora começar a registrar..." (empty state CTA copy)
- "80% pago 🎉" pill nos parcelados quase quitados
- "vence em 4 dias" pill âmbar pra urgência

Não adicionou:
- Linguagem genérica "Pendente / Em aberto / Concluído". Toda label tem PERSONALIDADE.

---

## Próximos passos sugeridos

1. **Validar com user** os 5 mockups antes de codar.
2. Extrair tokens deste design pra arquivo `tokens.css` ou Tailwind config.
3. Migrar `TabInicio.tsx` primeiro (impacto visual maior).
4. Implementar tela "Gastos" (nova, blocker pra unificação) — maior valor pro usuário.
5. Migrar Bottom Nav (mudança de IA estrutural — fazer com flag pra rollback fácil).
6. Refazer parcelas (refinamento, não bloqueia).
7. Refazer cadastro (último — quando tudo já tá fluindo).
