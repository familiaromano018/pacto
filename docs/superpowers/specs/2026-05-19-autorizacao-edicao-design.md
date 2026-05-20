# Autorização de Edição entre Parceiros

**Data**: 2026-05-19
**Projeto**: casal-no-azul (produto: Pacto)
**Status**: design aprovado, aguardando revisão da spec
**Sequência**: precede a feature de WhatsApp Onboarding (`2026-05-19-whatsapp-onboarding-design.md`)

## Contexto

O Pacto hoje permite que **qualquer parceiro** edite ou apague gastos
registrados pelo outro, sem aviso ou aprovação. Foi um descuido de
design: ambos os usuários do casal compartilham acesso total ao
`couple_id`, e a UI não distingue criador do registro.

Pra um produto que se posiciona como "transparência saudável" e "casa em
paz", isso é uma fricção de confiança esperando pra acontecer. Cenários
reais:

- Bia deleta gasto que Léo achava combinado — Léo se sente vigiado.
- Léo muda categoria do gasto da Bia ("Saúde" → "Pessoal") pra inflar o
  rateio dele — Bia descobre semanas depois.
- Edição acidental sem rastro — "eu nunca mexi nisso".

A feature trata esse buraco com **regras híbridas**: edições cosméticas
seguem soft (aplica direto + undo), edições materiais ou deleções viram
**strict** (aprovação prévia do criador).

Decisão de sequência: essa feature **precede** o WhatsApp porque o
WhatsApp escala o problema — bot criará muitos expenses e parceiros
precisam saber a quem pertencem.

## Objetivo

Garantir que **mudanças materiais** (valor significativo, categoria,
scope, mês, ou delete) em gastos do parceiro **requerem aprovação
explícita**. Mudanças cosméticas (descrição, forma de pagamento, valor
pequeno) aplicam direto mas com **notificação + janela de undo**.

## Não-objetivos (YAGNI)

- Não é controle de acesso entre múltiplos couples — sempre dois
  parceiros num couple.
- Não é aprovação em duas pessoas pra criar gasto novo (criar é livre,
  só editar/deletar é controlado).
- Não é histórico de auditoria completo pra impostos — só janela
  recente.
- Não é approval workflow multi-step (a → revisor → criador). Só
  parceiro criador aprova.
- Não é versionamento completo de cada campo — log mantém valor anterior
  e atual, sem cadeia profunda.

## Decisões de design

### Schema

Adicionar `created_by uuid` em `expenses`, `fixed_costs`, `installments`:

```sql
alter table public.expenses
  add column if not exists created_by uuid references auth.users(id);
alter table public.fixed_costs
  add column if not exists created_by uuid references auth.users(id);
alter table public.installments
  add column if not exists created_by uuid references auth.users(id);
```

**Migração de dados existentes:**

```sql
-- Pra dados pré-feature, assumir que paid_by é proxy razoável
update public.expenses
  set created_by = (
    select user_id from public.members
    where members.couple_id = expenses.couple_id
      and members.role = case when expenses.paid_by = 'A' then 'A' else 'B' end
    limit 1
  )
  where created_by is null;
-- Repetir pra fixed_costs e installments.
```

Daqui pra frente: app preenche com `auth.uid()`, WhatsApp preenche com
sender. Coluna **NOT NULL** após migração inicial.

### Regras híbridas

Decisão: classificar cada mutação em **soft** ou **strict** com base no
campo modificado.

| Campo modificado | Rota | Justificativa |
|---|---|---|
| `amount` (Δ < 10% do valor original) | **Soft** | Corrigir digitação (47 → 49) sem fricção |
| `amount` (Δ ≥ 10% do valor original) | **Strict** | Mudança material afeta rateio |
| `category` | **Strict** | Afeta análise + rateio entre tipos |
| `scope` (casal ↔ pessoal) | **Strict** | **Crítico** — muda o rateio mensal |
| `paid_by` | **Strict** | Muda quem pagou — material |
| `paymentMethod` | **Soft** | Cosmético, não afeta saldo |
| `desc` | **Soft** | Cosmético |
| `monthKey` | **Strict** | Afeta fechamento de meses |
| **Delete** (qualquer entidade) | **Strict** | Sempre |

**Limite de 10% do amount** é absoluto: `abs(novo - antigo) >= 0.1 * antigo` (e se `antigo === 0`, sempre strict).

### Tabela de pedidos de mudança

```sql
create table public.change_requests (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  target_table text not null check (target_table in
    ('expenses','fixed_costs','installments')),
  target_id uuid not null,
  requested_by uuid not null references auth.users(id) on delete cascade,
  requested_to uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('edit','delete')),
  payload jsonb,  -- valores novos pra edit; null pra delete
  status text not null default 'pending'
    check (status in ('pending','approved','denied','expired','withdrawn')),
  created_at timestamptz default now(),
  resolved_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days')
);

create index change_requests_couple_status_idx
  on public.change_requests(couple_id, status);
create index change_requests_requested_to_idx
  on public.change_requests(requested_to)
  where status = 'pending';
```

Pedido **expira após 7 dias**: cron diário marca `status='expired'` quando
`expires_at < now() AND status='pending'`, e envia push pro requester.

### Tabela de undo (soft changes)

```sql
create table public.change_history (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  target_table text not null check (target_table in
    ('expenses','fixed_costs','installments')),
  target_id uuid not null,
  changed_by uuid not null references auth.users(id) on delete cascade,
  prev_value jsonb not null,  -- snapshot anterior do registro inteiro
  new_value jsonb not null,   -- snapshot novo
  is_soft boolean not null default true,
  can_undo_until timestamptz not null default (now() + interval '24 hours'),
  undone boolean not null default false,
  created_at timestamptz default now()
);

create index change_history_target_idx
  on public.change_history(target_table, target_id, created_at desc);
create index change_history_couple_idx
  on public.change_history(couple_id, created_at desc);
```

Toda mutação **soft cross-user** insere em `change_history` antes de
aplicar. `can_undo_until = now() + 24h`. Após expirar, vira histórico
imutável.

Mutações strict aprovadas também loggam em `change_history` mas com
`is_soft=false, can_undo_until=now()` (sem janela de undo — já passou pela
aprovação).

Mutações **own-edits** (criador editando o próprio) não logam — é só o
dono mexendo no que é dele.

### Fluxo: edição soft (cross-user, valor pequeno)

```
Bia edita gasto do Léo (paymentMethod: pix → crédito)
  ↓
Cliente verifica regra: paymentMethod = soft
  ↓
INSERT em change_history (prev_value, new_value, can_undo_until=+24h)
  ↓
UPDATE expense (aplica direto)
  ↓
Notificação pro Léo (push + toast persistente no próximo login)
  ↓
Léo abre app: toast "Bia mudou forma de pagamento do gasto X — Desfazer"
  ↓
Se Léo clica "Desfazer" em < 24h:
   UPDATE expense de volta + change_history.undone=true
Senão: nada (registro fica como histórico)
```

### Fluxo: edição strict (cross-user, valor grande / scope / delete)

```
Bia abre gasto do Léo, clica "Editar" (na verdade vira "Pedir alteração")
  ↓
Cliente exibe form pra Bia colocar os novos valores
  ↓
INSERT em change_requests (status=pending, payload=novos valores, expires_at=+7d)
  ↓
Notificação pro Léo
  ↓
Léo abre app, vê badge "1" na aba Casal
  ↓
Léo entra na tela "Pendentes", vê:
    [Bia → Editar gasto "Mercado": R$47 → R$70 · scope casal → pessoal Bia]
    [ Aprovar ]  [ Negar ]
  ↓
Aprovar:
  UPDATE expense + INSERT change_history (is_soft=false)
  + UPDATE change_request status=approved, resolved_at=now()
  + Notificação pra Bia ("Léo aprovou sua mudança")

Negar:
  UPDATE change_request status=denied
  + Notificação pra Bia ("Léo negou. Gasto permanece como estava.")
```

### UX da tela "Pendentes"

Localização: aba **Casal** (TabConfig), seção nova "Solicitações
pendentes" no topo da tela (acima de tudo se houver pedidos pendentes).

Estrutura visual (mockup textual):

```
┌──────────────────────────────────────────┐
│ Solicitações pendentes · 2               │
├──────────────────────────────────────────┤
│ 📝 Bia quer editar                       │
│ "Mercado · R$ 47" → "Mercado · R$ 70"    │
│ Pediu há 2h · expira em 6d 22h           │
│ [ Aprovar ]  [ Negar ]                   │
├──────────────────────────────────────────┤
│ 🗑️ Bia quer apagar                       │
│ "Conta de luz · R$ 184 · Fixo"           │
│ Pediu há 1d 4h · expira em 5d 20h        │
│ [ Aprovar ]  [ Negar ]                   │
└──────────────────────────────────────────┘
```

Badge numérico no bottom nav (ícone Casal) com count de pedidos
pendentes pro user atual.

### UX dos botões na lista (Mês)

`FeedRow` modifica:

| Quem | Botão Editar | Botão Remover |
|---|---|---|
| `created_by === auth.uid()` | "Editar" — abre sheet de edição normal | "Remover" — confirma + deleta |
| `created_by !== auth.uid()` | "Pedir alteração" — abre sheet com mesma UX mas, ao salvar, cria pedido | "Pedir remoção" — confirma + cria pedido |

Visualmente: botão "Pedir..." usa um ícone diferente (✋ ou similar) +
cor laranja sutil pra deixar claro que é pedido, não ação direta.

### Quem é informado de quê

| Evento | Notifica quem | Como |
|---|---|---|
| Soft edit aplicada | Criador do gasto | Toast no próximo abrir do app + entry em "Histórico" |
| Strict request criado | Criador do gasto | Push (se PWA push ativo) + badge na Casal |
| Strict request aprovado | Requester | Push + toast no próximo abrir |
| Strict request negado | Requester | Push + toast no próximo abrir |
| Strict request expirado (7d) | Requester | Toast no próximo abrir |
| Soft undo executado | Quem fez a edição soft original | Toast no próximo abrir |

Push notifications dependem de PWA permission (fora de escopo desta spec
— se não tiver, fallback toast funciona).

### Como WhatsApp interage com essa feature (preparação)

Esta spec não implementa WhatsApp, mas estabelece o contrato:

1. **Criar gasto via WhatsApp** preenche `created_by = sender_user_id`.
2. **Correção via WhatsApp dentro de 5min** é sempre own-edit (sender ===
   created_by). Sem aprovação necessária.
3. **Edição via WhatsApp de gasto de outro user**: bloqueada. Bot
   responde "Esse gasto foi a Bia que registrou. Pede pra ela alterar."
4. Notificações originadas no app aparecem no app, não no WhatsApp (pra
   manter as duas superfícies bem definidas).

## Arquitetura

### Mudanças em arquivos existentes

**Backend (Supabase migration):**
- `docs/supabase/04_change_authorization.sql` — schema novo + dados
  existentes migrados.

**Cliente (Next.js / React):**
- `src/components/types.ts` — adicionar `createdBy: string` em `Expense`,
  `FixedCost`, `Installment`.
- `src/components/FeedRow.tsx` — gate de botões Editar/Remover por
  `createdBy === currentUserId`.
- `src/components/AddExpenseSheet.tsx` — ao salvar edição cross-user,
  cria change_request em vez de mutar direto.
- `src/components/CasalNoAzul.tsx` — passar `currentUserId` pra TabMes;
  remover/editar wrappers (`upsertExpense`, `removeExpense`, etc) agora
  verificam regra híbrida + roteiam pra soft/strict.
- `src/components/TabConfig.tsx` — adicionar seção "Solicitações
  pendentes" no topo + badge na bottom nav.
- `src/components/TabMes.tsx` — passar `currentUserId` pro `FeedRow`.

### Arquivos novos

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/changes/classify.ts` | Pure function `classify(prev, next) → 'soft' \| 'strict'` ou `'no-op'` |
| `src/lib/changes/request.ts` | Cliente Supabase pra criar/buscar/resolver `change_requests` |
| `src/lib/changes/history.ts` | Cliente pra criar/buscar/desfazer `change_history` |
| `src/components/PendingRequestsCard.tsx` | Componente do card "Pendentes" na TabConfig |
| `src/components/ChangeHistoryToast.tsx` | Toast persistente "Bia mudou X · Desfazer" |

### Sync com Supabase

- `change_requests` e `change_history` entram nos canais realtime
  existentes (`pacto:${coupleId}:*`).
- Cliente escuta `INSERT` em `change_requests` filtrado por
  `requested_to=eq.${userId}` pra atualizar badge em real-time.
- Cliente escuta `INSERT` em `change_history` filtrado por
  `target_id IN (gastos do user)` pra mostrar toast de soft edit.

### RLS

```sql
alter table public.change_requests enable row level security;
alter table public.change_history enable row level security;

create policy "change_requests_couple_members" on public.change_requests
  for all using (public.is_member(couple_id));

create policy "change_history_couple_members" on public.change_history
  for select using (public.is_member(couple_id));

-- INSERT no history só via funções server-side (não vamos expor pro
-- cliente diretamente — força ir pelo classify+route).
```

## Edge cases

1. **Parceiro deletado do casal antes de aprovar** → request fica órfão.
   Cron diário marca como `expired` e notifica requester.

2. **Gasto deletado enquanto há request pendente sobre ele** → request
   marca `status='withdrawn'` automaticamente (trigger no DELETE).

3. **Race condition: dois pedidos pendentes simultâneos no mesmo gasto**
   → permitido. Aprovação do primeiro aplica; segundo vira "obsoleto"
   se baseado em estado antigo (validação no resolve).

4. **Edição own-edit logo após criação WhatsApp** → não loga, não notifica
   (é o próprio user).

5. **Dados antigos sem `created_by` após migração** → migration preenche
   via `paid_by` proxy. Se ambíguo, default ao membro A do casal.

6. **Conflito: Léo edita gasto da Bia, ela tá editando o mesmo gasto agora**
   → último a salvar vence (last-write-wins), igual já é hoje. Não
   adicionamos lock otimista nessa feature — fora de escopo.

7. **Push notification não disponível (browser sem permissão)** → toast
   no próximo abrir do app + badge na bottom nav.

8. **Soft edit em valor 0** → fórmula `abs(novo-antigo) >= 0.1 * antigo`
   divide por zero. Regra especial: se `antigo === 0`, **sempre strict**.

## Sync / storage

`change_requests` e `change_history` são novas tabelas — usam o mesmo
padrão de `useCloudSync` + realtime channel do projeto. Sem mudança no
sync engine.

Estado puramente local (badges, toasts) calculado em runtime a partir
das tabelas sincronizadas.

## Testes / verificação

Manual no `pnpm dev`:

1. **Setup:** dois browsers logados, mesma couple_id, dois user_ids
   diferentes (Léo e Bia).
2. Léo cria gasto → vê no app dele e no app da Bia.
3. Bia tenta editar (forma de pagamento) → aplica direto + Léo recebe
   toast "Bia mudou X · Desfazer".
4. Léo clica "Desfazer" → reverte.
5. Bia tenta editar (amount: 47 → 80, mudança > 10%) → vai pra fila
   pendente.
6. Léo abre Casal → vê pedido. Aprova → amount muda + Bia recebe toast.
7. Léo cria pedido de delete num gasto da Bia. Bia nega → gasto fica.
8. Léo cria pedido. Bia não responde por 7d → expira → Léo notificado.
9. Léo edita o próprio gasto → muda direto, sem notificação na Bia.
10. Bia tenta editar (scope casal → pessoal Bia) → strict mesmo sendo
    valor pequeno.

## Riscos / aberto

- **Migração de dados antigos:** o proxy `paid_by → created_by` pode
  estar errado em alguns casos (ex: Léo registrou um gasto que a Bia
  pagou). Solução pragmática: aceitar imprecisão pros dados existentes,
  garantir corretude daqui pra frente. Documentar pro user via banner
  no primeiro login pós-feature: "A partir de agora, edições do parceiro
  precisam de autorização. Históricos antigos podem ter atribuição
  aproximada."

- **UX de "Pedir alteração" vs "Editar":** se a UX for confusa
  (parceiro pensa que editou mas só pediu), pode gerar frustração.
  Mitigação: copy clara + toast confirmando "Pedido enviado pra Léo
  aprovar" após criar request.

- **Notificação push depende de PWA permission.** Sem isso, user só
  vê quando abre o app. Mitigação aceita — fallback toast cobre.

- **Janela de undo de 24h soft** pode ser pouco se user só abre o app
  semanalmente. Decisão pragmática: 24h alinha com fluxo diário. Se
  virar reclamação, estender pra 72h numa v1.1.
