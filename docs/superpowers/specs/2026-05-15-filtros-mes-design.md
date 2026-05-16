# Filtros por categoria e forma de pagamento na aba Mês

**Data**: 2026-05-15
**Projeto**: casal-no-azul
**Status**: design aprovado, aguardando spec review

## Contexto

A aba **Mês** já é o "extrato do mês" do app — lista combinada de gastos
avulsos + fixos ativos + parcelas ativas, com busca por texto e 4 chips de
filtro por pessoa (`Tudo / Casal / Nathan / Melka`).

Falta uma capacidade simples mas valiosa: filtrar **por categoria** e **por
forma de pagamento**. Com isso o user vê extratos como "todos os gastos no
crédito em Mercado este mês" — caso de uso real e comum, especialmente pra
auditar fatura de cartão antes de pagar.

A abordagem **descartada** era um drilldown na aba Visão (sheet abre ao
clicar no donut). É menos potente porque não combina filtros e duplica UI.
Filtros na Mês reusam a infraestrutura que já existe e ficam visíveis o
tempo todo.

## Objetivo

Adicionar dois filtros na aba **Mês** — **Categoria** e **Forma de
pagamento** — combináveis entre si, com os filtros que já existem (pessoa
+ busca), e com um botão de "Limpar tudo" + contador de resultados.

## Não-objetivos (YAGNI)

- **Drilldown nos cards da Visão** — descartado em favor desta abordagem.
- **Deep-link** da Visão pra Mês com filtro aplicado — fica pra depois,
  uma linha de código (não é MVP).
- **Filtros persistirem entre meses** — todo filtro reseta quando user
  muda de mês ou fecha o app (estado ephemeral, igual `query` hoje).
- **Filtros persistirem em URL/query-string** — não, app é PWA mobile-first,
  não tem cultura de URL state.
- **Filtro por tipo (avulso/fixo/parcela)** — fora de escopo. Pode entrar
  depois se aparecer demanda.
- **Multi-select** (várias categorias ao mesmo tempo) — só single-select.
  Combinar via OR dentro de uma dimensão complicaria UX e raramente é o
  caso de uso. Pra ver "Mercado + Farmácia", o user limpa o filtro de
  categoria.

## Decisões de design

### Layout

Adicionar uma **terceira linha** de filtros, abaixo dos chips de pessoa.
Não substitui nada — só estende:

```
┌────────────────────────────────────────────────┐
│  🔍 Buscar gasto...                            │  ← já existe
├────────────────────────────────────────────────┤
│  [ Tudo ] [ Casal ] [ Nathan ] [ Melka ]       │  ← já existe
├────────────────────────────────────────────────┤
│  [ 📂 Categoria ▾ ]  [ 💳 Pagamento ▾ ]  [ × ] │  ← NOVO
├────────────────────────────────────────────────┤
│  Mostrando 12 de 47 itens · R$ 1.847,30        │  ← NOVO (só se filtro ativo)
├────────────────────────────────────────────────┤
│  ... lista existente (FeedRow agrupado por dia)│
└────────────────────────────────────────────────┘
```

### Cada filtro

Cada seletor é um **`<select>` HTML nativo estilizado como chip**. Razões:
- Abre o picker nativo do OS (rolagem confortável no iOS/Android).
- Zero código de modal/dropdown customizado.
- Acessibilidade vem grátis (foco, teclado, screen reader).
- Já temos pattern de chip — só substituir `<button>` por `<select>`
  visualmente equivalente.

**Estado visual:**
- **Inativo** (= "Todas"): borda fina, fundo transparente, texto cinza —
  mesmo estilo dos chips de pessoa não-selecionados.
- **Ativo** (= categoria/método específico selecionado): borda destacada,
  fundo `bg_elevated`, texto `text_heading`, + ponto colorido do bucket
  (cor da categoria via emoji ou cor do método via `PAYMENT_METHOD_COLOR`).

### Opções do seletor Categoria

- Primeira opção: **"Todas as categorias"** (= sem filtro).
- Demais: **só as categorias que têm pelo menos 1 item no mês corrente
  filtrado pelos filtros anteriores** (pessoa + busca). Ordem: alfabética.
- Formato: `🛒 Mercado (5)` — emoji + nome + contagem entre parênteses.
- Categoria com 0 itens depois do filtro pessoa/busca **não aparece** —
  evita opções "vazias" no dropdown que confundem.

**Por que não mostrar todas as categorias que o user já criou?** Categorias
com 0 itens no mês são confusas ("escolhi e ficou vazio?"). O dropdown é
"escolher entre o que existe", não "categoria geral".

### Opções do seletor Pagamento

- Primeira opção: **"Todas as formas"** (= sem filtro).
- Demais: **só os métodos com pelo menos 1 item no mês corrente filtrado**,
  na ordem canônica de `PAYMENT_METHOD_ORDER`.
- Formato: `Pix (8)` (sem ícone — `<option>` HTML não suporta SVG).
- Inclui `naoInformado` ("Não informado") quando aplicável.

### Combinação de filtros

Todos os filtros são **AND**. A função `filtered` existente (TabMes.tsx
linhas 104-117) ganha 2 condições extras:

```ts
if (categoryFilter !== 'all') r = r.filter((e) => e.category === categoryFilter)
if (paymentFilter !== 'all') r = r.filter((e) => paymentMethodKey(e.paymentMethod) === paymentFilter)
```

A ordem dos filtros é: **pessoa → categoria → pagamento → busca**. Essa
ordem afeta as contagens nos dropdowns (cada seletor mostra contagens
considerando os filtros **anteriores na cadeia**, mas não os **posteriores**,
pra evitar opções zeradas).

> **Decisão de simplicidade:** todas as contagens dos dropdowns vão usar
> apenas `filter` (pessoa) + `query` (busca) aplicados, **não** o outro
> filtro de categoria/pagamento. Razão: deixar Categoria mostrar contagens
> que ignoram Pagamento (e vice-versa) é menos confuso — user vê o universo
> da outra dimensão estável. Caso o user combine "Crédito" + "Mercado" e
> isso dê 0 resultados, o empty state explica.

### Contador de resultados

Aparece **só quando algum filtro de categoria/pagamento estiver ativo**
(busca + chip de pessoa por si só não mostram contador — comportamento
atual preserva). Posição: logo abaixo da linha de chips novos, acima da
lista. Formato:

```
Mostrando 12 de 47 itens · R$ 1.847,30
```

- `12`: itens depois de TODOS os filtros aplicados.
- `47`: itens no mês inteiro, sem nenhum filtro.
- `R$ 1.847,30`: soma dos 12.

### Botão "Limpar tudo"

Posição: à direita da linha de chips novos, com ícone `×`. Comportamento:
limpa **categoria + pagamento** (mas **não** mexe em busca nem chip de
pessoa — esses têm seus próprios botões de limpar).

**Aparece só quando** `categoryFilter !== 'all' || paymentFilter !== 'all'`.

### Empty state com filtros zerados

Se `filtered.length === 0` mas `feed.length > 0` (mês tem dados, mas
filtros zeraram), substituir o render padrão da lista por:

```
   Nenhum gasto bate com esses filtros.
   [ Limpar filtros ]
```

O botão "Limpar filtros" do empty state **limpa tudo**: categoria,
pagamento, busca, **e** chip de pessoa (volta pra "Tudo"). É um botão de
escape mais amplo que o "× Limpar tudo" da linha de filtros, porque o
user já tá frustrado.

### Reset em troca de mês

Mesma regra do `query` hoje (que **não** reseta — mas seria bom). Decisão
explícita pra essa feature:
- `categoryFilter` e `paymentFilter` **resetam pra `'all'`** quando
  `monthKey` muda.
- Razão: categorias e métodos disponíveis mudam por mês; um filtro
  setado num mês pode ficar inválido em outro (categoria sem gastos).

`query` e `filter` (pessoa) continuam como estão hoje (não resetam).

## Arquitetura

### Arquivos

**Modificado:** `src/components/TabMes.tsx`

- 2 novos states:
  - `const [categoryFilter, setCategoryFilter] = useState<string>('all')`
  - `const [paymentFilter, setPaymentFilter] = useState<PaymentMethodKey | 'all'>('all')`
- `useEffect` que reseta os 2 quando `monthKey` muda.
- Novo `useMemo` `categoryOptions` e `paymentOptions` (derivados do `feed`
  filtrado por pessoa + query, contagens e ordenação).
- `filtered` useMemo ganha as 2 condições adicionais.
- Render novo: bloco de 2 `<select>` + botão `×` + contador (se ativo) +
  empty state filtrado, inserido entre a linha de chips atual e o início
  da lista.

**Não toca em:** `Visão`, `Recorrentes`, `Metas`, `Casal`, schema, sync,
`AddExpenseSheet`.

### Reuso

- **`paymentMethodKey`** + **`PAYMENT_METHOD_LABEL`** + **`PAYMENT_METHOD_ORDER`**
  já existem em `src/lib/payment.tsx`.
- **`categoryEmoji`** já existe em `src/lib/categories.ts` — usado pra
  emoji ao lado do nome da categoria no dropdown.
- **`formatBRL`** já existe em `src/lib/format.ts` — pra o contador.

### Estilo

Reusa **tokens semânticos** que já existem. Sem novas variáveis CSS.
Chip pattern dos selects copia visual dos chips de pessoa (linhas
296-340 de `TabMes.tsx` hoje) — bordas, raios, espaçamentos, transitions.

## Edge cases

1. **Mês inteiro vazio** (`feed.length === 0`) → a linha nova de filtros
   **não aparece**, igual a linha de chips de pessoa atual já se esconde
   (`{feed.length > 0 && ...}`). Empty state hero do `TabMes` cobre.
2. **Categoria selecionada some no mês corrente** (todas as ocorrências
   foram editadas/removidas) → `filtered` retorna `[]`, empty state com
   "Limpar filtros" aparece.
3. **User troca de mês** → ambos resetam pra `'all'`.
4. **Categoria custom removida** → o filtro pode estar setado pra um nome
   que não tem mais matches; mostra empty state, user limpa.
5. **`naoInformado` no dropdown** → aparece quando há ao menos 1 entry
   sem `paymentMethod`. Label "Não informado" (mesmo do card da Visão).
6. **Combinação que zera** (Categoria=Mercado + Pagamento=Boleto, e
   ninguém pagou Mercado em Boleto) → empty state filtrado.

## Sync / storage

Nada. Estado puramente local, ephemeral, mesma natureza do `query` /
`filter` atuais.

## Testes / verificação

Sem testes automatizados. Manual em `pnpm dev`:

1. Aba Mês num mês cheio → linha de chips novos aparece com "Categoria ▾"
   e "Pagamento ▾".
2. Selecionar uma categoria → lista filtra, contador aparece.
3. Selecionar um pagamento adicional → lista filtra mais, contador
   atualiza.
4. Clicar "× Limpar tudo" → categoria e pagamento voltam pra "Todas",
   chip de pessoa e busca permanecem.
5. Combinar pessoa=Nathan + categoria=Mercado + pagamento=Pix → filtros
   combinam, contador certo.
6. Forçar empty state (categoria+pagamento sem matches) → empty filtrado
   aparece, botão "Limpar filtros" reseta tudo (inclusive pessoa).
7. Trocar de mês → filtros resetam, query e pessoa permanecem.
8. Categoria selecionada que tem só 1 item → editar pra outra categoria
   → recomputa, item some, se era o último mostra empty state.
9. Card "Por forma de pagamento" da Visão segue intocado (regressão check).

## Riscos / aberto

- **`<select>` nativo no iOS** pode ter visual estranho com fontes
  customizadas. Mitigação: testar visualmente; se feio, considerar
  bottom-sheet picker numa segunda iteração.
- **Mobile: muitos chips em fila** podem causar scroll horizontal forçado.
  Já temos `overflowX: 'auto'` nos chips de pessoa; replicar na linha
  nova.
- **Categoria com nome muito longo** → truncar com `text-overflow: ellipsis`
  no `<select>` width-limited (~140px).
