# Card "Por forma de pagamento" na aba Visão

**Data**: 2026-05-15
**Projeto**: casal-no-azul
**Status**: design aprovado, aguardando spec review

## Contexto

O schema do app já carrega o campo opcional `paymentMethod` em `Expense`,
`FixedCost` e `Installment` (`pix | debito | credito | dinheiro | boleto |
transferencia`). Hoje esse dado é coletado no `AddExpenseSheet` mas nunca é
agregado em nenhuma view — o usuário não consegue responder "quanto eu gastei
no crédito esse mês?".

A aba **Visão** (`src/components/TabVisao.tsx`) já consolida o mês atual via
cards: total + delta, donut por categoria, barras por pessoa, linha acumulada,
variação vs mês anterior. Adicionar um card de formas de pagamento aproveita
toda a infra existente — sem mudar schema, sync, bottom nav nem dependências.

## Objetivo

Adicionar um novo `ChartCard` chamado **"Por forma de pagamento"** dentro de
`TabVisao`, logo após o card "Por categoria", que mostra a distribuição das
despesas do mês corrente entre os métodos de pagamento, no padrão visual donut
+ lista.

## Não-objetivos (YAGNI)

- Não cria nova tab no bottom nav.
- Não cria filtro/drill-down por método (sem sheet/modal).
- Não compara método vs mês anterior (a aba já tem o card geral de variação).
- Não muda o schema, nem o sync, nem o `AddExpenseSheet`.
- Não faz migration de dados antigos sem `paymentMethod`.

## Decisões de design

### Agregação

Mesma regra dos outros cards do `TabVisao` (mês corrente):

- `expenses` com `monthKey === monthKey`
- `fixedCosts` com `active === true` e `fixedAppearsInMonth(...) === true`
- `installments` ativas no mês (parcela atual ≤ `totalParcelas`) — usa
  `parcelaMensal` como valor

A agregação soma `amount` (ou `parcelaMensal`) num bucket por método. Itens
sem `paymentMethod` vão pro bucket `naoInformado`.

Resultado é um `Map<PaymentMethodKey, number>`, onde
`PaymentMethodKey = PaymentMethod | 'naoInformado'`.

### Visual

Idêntico ao card "Por categoria" (consistência > novidade):

- **Donut** central com número de métodos usados no centro (label
  "MÉTODOS" embaixo, igual "CATEGORIAS").
- **Lista lateral** ranqueada por valor desc, mostrando: bolinha colorida +
  ícone do método + label + %.
- Métodos com R$ 0 são ocultados (não entram nem no donut nem na lista).

### Paleta e ícones

Cada método tem cor + ícone SVG inline. Para manter o tom limpo do app, **não**
usamos emoji.

| Método         | Label PT-BR     | Cor (referência)                 | Ícone                       |
|----------------|-----------------|----------------------------------|-----------------------------|
| `pix`          | Pix             | `var(--color-success)` (verde)   | Raio / símbolo Pix          |
| `credito`      | Crédito         | `var(--color-brand)` (azul)      | Cartão de crédito           |
| `debito`       | Débito          | `#7da3ff` (azul claro)           | Cartão com cifrão           |
| `dinheiro`     | Dinheiro        | `var(--color-person-b)` (menta)  | Cédula                      |
| `boleto`       | Boleto          | `var(--color-installment)`       | Código de barras            |
| `transferencia`| Transferência   | `#94a3b8` (cinza)                | Setas trocando              |
| `naoInformado` | Não informado   | `var(--color-border-default)`    | Círculo tracejado / `?`     |

> As cores são referências às variáveis CSS já usadas em `tokens`. Se alguma
> variável não existir exatamente com esse nome, usar a equivalente mais
> próxima dos tokens atuais — sem inventar nova paleta.

### Edge cases

1. **Total do mês = 0** → o card herda o gate `isEmpty` que já oculta tudo
   abaixo do header total no `TabVisao`. Sem código extra.
2. **Só um método com valor** → donut vira anel cheio de uma cor, lista com 1
   item. Comportamento natural do componente, sem tratamento especial.
3. **100% "Não informado"** (dados antigos só) → renderiza normal, com um
   nudge sutil de 1 linha abaixo da lista:
   *"Edite seus gastos pra escolher a forma de pagamento e ver a distribuição."*
   Só aparece quando `naoInformado === total` e total > 0.
4. **Mistura informado + não informado** → "Não informado" aparece como mais
   um item na lista, sem nudge.

## Arquitetura

### Arquivos novos

**`src/lib/payment.ts`** — fonte única pra metadados dos métodos:

```ts
export type PaymentMethodKey = PaymentMethod | 'naoInformado'

export const PAYMENT_METHOD_ORDER: PaymentMethodKey[] = [
  'pix', 'credito', 'debito', 'dinheiro', 'boleto', 'transferencia', 'naoInformado'
]

export const PAYMENT_METHOD_LABEL: Record<PaymentMethodKey, string> = { ... }
export const PAYMENT_METHOD_COLOR: Record<PaymentMethodKey, string> = { ... }
export function PaymentMethodIcon({ method, size }: { ... }): JSX.Element
```

Isso deixa `TabVisao.tsx` mais magro e abre porta pra reuso (ex: mostrar
ícone do método no `FeedRow` no futuro — fora de escopo agora).

### Arquivos alterados

**`src/components/TabVisao.tsx`**:

1. Estender `computeMonth(mk)` pra também devolver `byMethod: Map<PaymentMethodKey, number>`.
2. Adicionar `sortedMethods` (igual `sortedCategories`).
3. Renderizar um novo `<ChartCard title="Por forma de pagamento">` logo após o
   de categorias, reaproveitando `DonutChart` (ou um pequeno wrapper que
   troca emoji por ícone SVG).

### Reuso do DonutChart

O `DonutChart` atual recebe `emoji: string`. Duas opções:

- **(A)** Generalizar pra aceitar `icon: React.ReactNode` ao invés de `emoji`,
  e adaptar o card de categorias pra passar emoji dentro de um `<span>`.
- **(B)** Criar um `MethodDonutChart` separado, quase idêntico, que recebe ícone.

Vamos com **(A)**: uma mudança pequena (`emoji: React.ReactNode`) sem
duplicar o componente. O card de categorias continua passando o emoji como
string (string é `ReactNode` válido), zero regressão.

## Sync / storage

Nada muda. `paymentMethod` já está em `Expense`, `FixedCost`, `Installment`,
já é persistido em `localStorage` e já sincroniza com Supabase via
`useCloudSync`. O card é 100% derivado.

## Testes / verificação

Sem suite de testes automatizados no projeto. Verificação manual:

1. Abrir Visão com mês atual sem gastos → card não aparece (gate `isEmpty`).
2. Adicionar 1 gasto com método "Pix" → card aparece com 1 item, donut 100% verde.
3. Adicionar gastos em métodos diferentes → ordem por valor desc, % correto.
4. Ter um gasto antigo sem `paymentMethod` + um com → 2 itens, sendo um
   "Não informado" cinza.
5. Editar o antigo, escolher um método → ele migra do bucket "Não informado"
   pro método escolhido em tempo real (já que tudo é derivado).
6. Mês 100% "Não informado" → nudge aparece.
7. Trocar de mês (anterior/próximo) → card recalcula. Mês futuro vazio →
   card desaparece com o resto.

## Riscos / aberto

- **Cores**: as variáveis CSS sugeridas podem não bater 1:1 com o que existe
  em `tokens`. Na implementação, conferir `src/lib/tokens.ts` e usar as mais
  próximas, sem inventar nada.
- **Ícone do Pix**: o símbolo oficial é proprietário; vamos usar uma versão
  estilizada (diamante/raio) inline em SVG.
