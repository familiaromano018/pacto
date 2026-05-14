# 💑 Casal no Azul

Planejador financeiro para casais — fim das brigas sobre quem pagou o quê.

## Features

- **📌 Custos fixos** — aluguel, Netflix, academia. Pausar/reativar sem apagar
- **💑 Gastos do casal** — avulsos compartilhados com rateio automático
- **👤 Gastos pessoais** — de cada um, fora do rateio
- **💳 Parcelados** — controle parcela a parcela, do casal ou individual
- **🎯 Metas** — objetivos do casal com barra de progresso
- **🔥 Renda comprometida** — % da renda gasta por pessoa

## Setup

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js 14 (App Router)
- TypeScript
- React state (sem lib externa de estado)

## Estrutura

```
src/
  app/
    layout.tsx        # root layout + fonts
    page.tsx          # entry point
    globals.css
  components/
    CasalNoAzul.tsx   # orquestrador principal + state
    Setup.tsx         # tela de configuração inicial
    TabInicio.tsx     # dashboard / resumo
    TabFixos.tsx      # custos fixos mensais
    TabParcelas.tsx   # contas parceladas
    TabMetas.tsx      # metas do casal
    ExpenseRow.tsx    # linha de gasto reutilizável
    ui.tsx            # componentes primitivos (Avatar, Card, Btn, etc)
    constants.ts      # categorias, emojis, cores
    types.ts          # TypeScript types
```

## Próximos passos sugeridos

- Persistência com localStorage ou Supabase
- Login por casal (auth)
- Notificações de vencimento de parcelas
- Export PDF/Excel do mês
