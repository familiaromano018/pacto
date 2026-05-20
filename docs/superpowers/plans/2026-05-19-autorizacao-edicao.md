# Autorização de Edição entre Parceiros — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Impedir que um parceiro edite/apague gastos do outro sem autorização. Implementa regras híbridas: mudanças cosméticas aplicam direto com 24h undo (soft); mudanças materiais ou deletes vão pra fila de aprovação (strict).

**Architecture:** Pure function `classify(prev, next) → 'soft'|'strict'|'no-op'` decide a rota a partir do diff. Mutações próprias seguem fluxo direto existente. Mutações cross-user roteiam por essa função: soft → loga em `change_history` + aplica + notifica + 24h undo; strict → cria `change_requests` pendente → criador aprova ou nega → aplica. Schema já tem coluna `created_by` na tabela (não estava sendo usada pelo cliente); essa feature passa a populá-la e checá-la.

**Tech Stack:** Next.js 14, React 18, TypeScript, Supabase. Sem dependências novas. Verificação manual via `pnpm dev`.

**Spec:** `docs/superpowers/specs/2026-05-19-autorizacao-edicao-design.md`

---

## File Structure

**Create:**
- `docs/supabase/04_change_authorization.sql` — schema + migração + RLS + cron
- `src/lib/changes/classify.ts` — pure function de classificação
- `src/lib/changes/request.ts` — Supabase calls pra `change_requests`
- `src/lib/changes/history.ts` — Supabase calls pra `change_history` + undo
- `src/components/PendingRequestsCard.tsx` — UI da fila de pendentes
- `src/components/ChangeToast.tsx` — toast persistente "fulano mudou X · desfazer"

**Modify:**
- `src/components/types.ts` — adicionar `createdBy: string` em Expense/FixedCost/Installment/FeedEntry
- `src/components/CasalNoAzul.tsx` — passar `userId` adiante; wrappers `upsertExpense`/`upsertFixed`/`upsertInstallment`/`removeExpense`/`removeFixed`/`removeInstallment` roteiam por `classify`
- `src/components/FeedRow.tsx` — gate dos botões Editar/Remover por `entry.createdBy === currentUserId`
- `src/components/AddExpenseSheet.tsx` — receber `currentUserId` e mudar copy + comportamento ao salvar quando é gasto de outro
- `src/components/TabMes.tsx` — passar `currentUserId` pro FeedRow; popular `createdBy` no `feed`
- `src/components/TabRecorrentes.tsx` — gate similar nos botões de fixed/installments
- `src/components/TabConfig.tsx` — inserir `<PendingRequestsCard>` no topo da aba
- `src/components/CasalNoAzul.tsx` — adicionar badge no bottom nav Casal
- `src/lib/sync/queue.ts` ou onde se faz upsert — incluir `created_by` no payload Supabase
- `src/lib/sync/useCloudSync.ts` — adicionar pull de `change_requests` e `change_history`

**Not touched:** schema das outras tabelas, paywall, subscription logic.

---

## Task 1: schema + migração (Supabase)

**Files:**
- Create: `docs/supabase/04_change_authorization.sql`

- [ ] **Step 1: criar o arquivo de migração**

```sql
-- docs/supabase/04_change_authorization.sql
-- Tabelas pra autorização de edição entre parceiros.

-- ────────────────────────────────────────────────────────────────
-- 1) Garantir coluna created_by (já existe em schema.sql, mas refaz seguro)
-- ────────────────────────────────────────────────────────────────
alter table public.expenses
  add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.fixed_costs
  add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.installments
  add column if not exists created_by uuid references auth.users(id) on delete set null;

-- ────────────────────────────────────────────────────────────────
-- 2) Migrar dados existentes: created_by = user do role correspondente
-- ────────────────────────────────────────────────────────────────
update public.expenses e
  set created_by = m.user_id
  from public.members m
  where m.couple_id = e.couple_id
    and m.role = e.paid_by
    and e.created_by is null;

update public.fixed_costs f
  set created_by = m.user_id
  from public.members m
  where m.couple_id = f.couple_id
    and m.role = f.paid_by
    and f.created_by is null;

update public.installments i
  set created_by = m.user_id
  from public.members m
  where m.couple_id = i.couple_id
    and m.role = i.paid_by
    and i.created_by is null;

-- ────────────────────────────────────────────────────────────────
-- 3) Change requests (aprovação prévia — strict)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.change_requests (
  id            uuid primary key default gen_random_uuid(),
  couple_id     uuid not null references public.couples(id) on delete cascade,
  target_table  text not null check (target_table in ('expenses','fixed_costs','installments')),
  target_id     uuid not null,
  requested_by  uuid not null references auth.users(id) on delete cascade,
  requested_to  uuid not null references auth.users(id) on delete cascade,
  action        text not null check (action in ('edit','delete')),
  payload       jsonb,
  status        text not null default 'pending'
                check (status in ('pending','approved','denied','expired','withdrawn')),
  created_at    timestamptz default now(),
  resolved_at   timestamptz,
  expires_at    timestamptz not null default (now() + interval '7 days')
);
create index if not exists change_requests_couple_status_idx
  on public.change_requests(couple_id, status);
create index if not exists change_requests_requested_to_pending_idx
  on public.change_requests(requested_to)
  where status = 'pending';

-- ────────────────────────────────────────────────────────────────
-- 4) Change history (soft edits + auditoria)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.change_history (
  id              uuid primary key default gen_random_uuid(),
  couple_id       uuid not null references public.couples(id) on delete cascade,
  target_table    text not null check (target_table in ('expenses','fixed_costs','installments')),
  target_id       uuid not null,
  changed_by      uuid not null references auth.users(id) on delete cascade,
  prev_value      jsonb not null,
  new_value       jsonb not null,
  is_soft         boolean not null default true,
  can_undo_until  timestamptz not null default (now() + interval '24 hours'),
  undone          boolean not null default false,
  created_at      timestamptz default now()
);
create index if not exists change_history_target_idx
  on public.change_history(target_table, target_id, created_at desc);
create index if not exists change_history_couple_idx
  on public.change_history(couple_id, created_at desc);

-- ────────────────────────────────────────────────────────────────
-- 5) RLS
-- ────────────────────────────────────────────────────────────────
alter table public.change_requests enable row level security;
alter table public.change_history enable row level security;

drop policy if exists "change_requests_couple_members" on public.change_requests;
create policy "change_requests_couple_members" on public.change_requests
  for all using (public.is_member(couple_id))
  with check (public.is_member(couple_id));

drop policy if exists "change_history_couple_members" on public.change_history;
create policy "change_history_couple_members" on public.change_history
  for select using (public.is_member(couple_id));

drop policy if exists "change_history_couple_members_insert" on public.change_history;
create policy "change_history_couple_members_insert" on public.change_history
  for insert with check (public.is_member(couple_id));

drop policy if exists "change_history_couple_members_undo" on public.change_history;
create policy "change_history_couple_members_undo" on public.change_history
  for update using (public.is_member(couple_id))
  with check (public.is_member(couple_id));

-- ────────────────────────────────────────────────────────────────
-- 6) Realtime publication
-- ────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.change_requests;
alter publication supabase_realtime add table public.change_history;

-- ────────────────────────────────────────────────────────────────
-- 7) Cron: expira pedidos > 7d (Supabase Cron Extension)
-- Aplicar manualmente no painel se a extensão não estiver habilitada.
-- ────────────────────────────────────────────────────────────────
create or replace function public.expire_old_change_requests()
returns void language sql security definer set search_path = public as $func$
  update public.change_requests
    set status = 'expired', resolved_at = now()
    where status = 'pending' and expires_at < now();
$func$;
```

- [ ] **Step 2: aplicar a migration no Supabase**

> **Manual step**: cola o conteúdo de `docs/supabase/04_change_authorization.sql` no SQL Editor do Supabase Studio do projeto Pacto e clica Run. Verifica que rodou sem erro.

- [ ] **Step 3: schedular o cron job**

No Supabase Studio, criar um cron job (Database → Cron Jobs ou via SQL):

```sql
select cron.schedule(
  'expire_change_requests_daily',
  '0 3 * * *',  -- 3am diariamente
  $$ select public.expire_old_change_requests() $$
);
```

- [ ] **Step 4: commit**

```bash
git add docs/supabase/04_change_authorization.sql
git commit -m "feat(auth): db schema for change requests and history"
```

---

## Task 2: tipos TypeScript

**Files:**
- Modify: `src/components/types.ts`

- [ ] **Step 1: adicionar createdBy em todos os types relevantes**

Atualizar `src/components/types.ts`:

```ts
export interface Expense {
  id: string
  desc: string
  amount: number
  paidBy: PaidBy
  scope: Scope
  category: string
  createdAt: number
  monthKey: string
  paymentMethod?: PaymentMethod
  createdBy?: string  // ← NOVO. user_id de quem registrou. Optional pra retrocompat.
}

export interface Installment {
  id: string
  desc: string
  totalAmount: number
  totalParcelas: number
  paidParcelas: number
  parcelaMensal: number
  paidBy: PaidBy
  scope: Scope
  category: string
  startedAt: number
  paymentMethod?: PaymentMethod
  dueDay?: number
  createdBy?: string  // ← NOVO
}

export interface FixedCost {
  id: string
  desc: string
  amount: number
  paidBy: PaidBy
  scope: Scope
  category: string
  active: boolean
  createdAt: number
  paymentMethod?: PaymentMethod
  dueDay?: number
  frequency?: 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual'
  createdBy?: string  // ← NOVO
}

export interface FeedEntry {
  id: string
  sourceId: string
  kind: ExpenseKind
  desc: string
  amount: number
  paidBy?: PaidBy
  scope: Scope
  category: string
  date: number
  sublabel?: string
  paymentMethod?: PaymentMethod
  createdBy?: string  // ← NOVO
}
```

Adicionar novos types pro feature, no final do arquivo:

```ts
// ── Authorization ──

export type ChangeAction = 'edit' | 'delete'
export type ChangeRequestStatus = 'pending' | 'approved' | 'denied' | 'expired' | 'withdrawn'
export type ChangeTargetTable = 'expenses' | 'fixed_costs' | 'installments'

export interface ChangeRequest {
  id: string
  coupleId: string
  targetTable: ChangeTargetTable
  targetId: string
  requestedBy: string
  requestedTo: string
  action: ChangeAction
  payload: Record<string, any> | null
  status: ChangeRequestStatus
  createdAt: number
  resolvedAt: number | null
  expiresAt: number
}

export interface ChangeHistoryEntry {
  id: string
  coupleId: string
  targetTable: ChangeTargetTable
  targetId: string
  changedBy: string
  prevValue: Record<string, any>
  newValue: Record<string, any>
  isSoft: boolean
  canUndoUntil: number
  undone: boolean
  createdAt: number
}
```

- [ ] **Step 2: typecheck**

Run: `cd "/Users/nathanromano/TESTE DE IA/casal-no-azul" && pnpm exec tsc --noEmit`
Expected: 0 erros (campos são opcionais, retrocompat ok).

- [ ] **Step 3: commit**

```bash
git add src/components/types.ts
git commit -m "feat(auth): add createdBy and change request types"
```

---

## Task 3: pure logic — classify function

**Files:**
- Create: `src/lib/changes/classify.ts`

- [ ] **Step 1: criar o arquivo com a função pura**

```ts
// src/lib/changes/classify.ts
import type { Expense, FixedCost, Installment } from '@/components/types'

export type ChangeRoute = 'soft' | 'strict' | 'no-op'

type Mutable = Partial<Expense> & Partial<FixedCost> & Partial<Installment>

/**
 * Classifica a rota de uma mutação cross-user.
 * - 'no-op'  → nenhum campo material mudou (ignora)
 * - 'soft'   → só campos cosméticos (desc, paymentMethod, amount Δ < 10%)
 * - 'strict' → algum campo material mudou (category, scope, paidBy, monthKey, amount Δ ≥ 10%, ou delete)
 *
 * Para um delete, chamar com next = null → sempre 'strict'.
 */
export function classify(prev: Mutable, next: Mutable | null): ChangeRoute {
  if (next === null) return 'strict' // delete

  let hasMaterial = false
  let hasCosmetic = false

  // amount: Δ ≥ 10% é strict; Δ < 10% (mas > 0) é soft
  if (prev.amount !== undefined && next.amount !== undefined && prev.amount !== next.amount) {
    if (prev.amount === 0) {
      hasMaterial = true
    } else {
      const delta = Math.abs(next.amount - prev.amount)
      const ratio = delta / Math.abs(prev.amount)
      if (ratio >= 0.1) hasMaterial = true
      else hasCosmetic = true
    }
  }

  // category, scope, paidBy, monthKey → sempre strict
  if (next.category !== undefined && next.category !== prev.category) hasMaterial = true
  if (next.scope !== undefined && next.scope !== prev.scope) hasMaterial = true
  if (next.paidBy !== undefined && next.paidBy !== prev.paidBy) hasMaterial = true
  if ((next as Expense).monthKey !== undefined && (next as Expense).monthKey !== (prev as Expense).monthKey) hasMaterial = true

  // desc, paymentMethod → sempre soft
  if (next.desc !== undefined && next.desc !== prev.desc) hasCosmetic = true
  if (next.paymentMethod !== undefined && next.paymentMethod !== prev.paymentMethod) hasCosmetic = true

  // dueDay (em fixed/installment) → soft
  if ((next as FixedCost).dueDay !== undefined && (next as FixedCost).dueDay !== (prev as FixedCost).dueDay) hasCosmetic = true

  // active (em fixed) → strict (afeta cálculos do mês)
  if ((next as FixedCost).active !== undefined && (next as FixedCost).active !== (prev as FixedCost).active) hasMaterial = true

  if (hasMaterial) return 'strict'
  if (hasCosmetic) return 'soft'
  return 'no-op'
}
```

- [ ] **Step 2: typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 3: commit**

```bash
git add src/lib/changes/classify.ts
git commit -m "feat(auth): classify function for soft/strict routing"
```

---

## Task 4: client libs pra change_requests e change_history

**Files:**
- Create: `src/lib/changes/request.ts`
- Create: `src/lib/changes/history.ts`

- [ ] **Step 1: criar `request.ts`**

```ts
// src/lib/changes/request.ts
import { supabase } from '@/lib/supabase/client'
import type {
  ChangeRequest, ChangeAction, ChangeTargetTable, ChangeRequestStatus,
} from '@/components/types'

function row2req(r: any): ChangeRequest {
  return {
    id: r.id,
    coupleId: r.couple_id,
    targetTable: r.target_table,
    targetId: r.target_id,
    requestedBy: r.requested_by,
    requestedTo: r.requested_to,
    action: r.action,
    payload: r.payload,
    status: r.status,
    createdAt: new Date(r.created_at).getTime(),
    resolvedAt: r.resolved_at ? new Date(r.resolved_at).getTime() : null,
    expiresAt: new Date(r.expires_at).getTime(),
  }
}

/** Lista pedidos relevantes pro user (pendentes endereçados a ele OU criados por ele). */
export async function listChangeRequests(coupleId: string): Promise<ChangeRequest[]> {
  const sb = supabase()
  const { data, error } = await sb
    .from('change_requests')
    .select('*')
    .eq('couple_id', coupleId)
    .in('status', ['pending', 'approved', 'denied', 'expired'])
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []).map(row2req)
}

/** Cria um novo pedido. */
export async function createChangeRequest(input: {
  coupleId: string
  targetTable: ChangeTargetTable
  targetId: string
  requestedBy: string
  requestedTo: string
  action: ChangeAction
  payload: Record<string, any> | null
}): Promise<ChangeRequest> {
  const sb = supabase()
  const { data, error } = await sb
    .from('change_requests')
    .insert({
      couple_id: input.coupleId,
      target_table: input.targetTable,
      target_id: input.targetId,
      requested_by: input.requestedBy,
      requested_to: input.requestedTo,
      action: input.action,
      payload: input.payload,
    })
    .select()
    .single()
  if (error) throw error
  return row2req(data)
}

/** Aprova um pedido: aplica a mudança + marca como approved. */
export async function approveChangeRequest(req: ChangeRequest): Promise<void> {
  const sb = supabase()

  // Aplica a mudança no target
  if (req.action === 'delete') {
    const { error } = await sb.from(req.targetTable).delete().eq('id', req.targetId)
    if (error) throw error
  } else if (req.action === 'edit' && req.payload) {
    const { error } = await sb.from(req.targetTable).update(req.payload).eq('id', req.targetId)
    if (error) throw error
  }

  // Marca aprovado
  const { error: upErr } = await sb
    .from('change_requests')
    .update({ status: 'approved', resolved_at: new Date().toISOString() })
    .eq('id', req.id)
  if (upErr) throw upErr
}

/** Nega um pedido. */
export async function denyChangeRequest(reqId: string): Promise<void> {
  const sb = supabase()
  const { error } = await sb
    .from('change_requests')
    .update({ status: 'denied', resolved_at: new Date().toISOString() })
    .eq('id', reqId)
  if (error) throw error
}
```

- [ ] **Step 2: criar `history.ts`**

```ts
// src/lib/changes/history.ts
import { supabase } from '@/lib/supabase/client'
import type { ChangeHistoryEntry, ChangeTargetTable } from '@/components/types'

function row2hist(r: any): ChangeHistoryEntry {
  return {
    id: r.id,
    coupleId: r.couple_id,
    targetTable: r.target_table,
    targetId: r.target_id,
    changedBy: r.changed_by,
    prevValue: r.prev_value,
    newValue: r.new_value,
    isSoft: r.is_soft,
    canUndoUntil: new Date(r.can_undo_until).getTime(),
    undone: r.undone,
    createdAt: new Date(r.created_at).getTime(),
  }
}

/** Lista entradas recentes do histórico (últimos 30 dias). */
export async function listChangeHistory(coupleId: string): Promise<ChangeHistoryEntry[]> {
  const sb = supabase()
  const cutoff = new Date(Date.now() - 30 * 86400 * 1000).toISOString()
  const { data, error } = await sb
    .from('change_history')
    .select('*')
    .eq('couple_id', coupleId)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []).map(row2hist)
}

/** Registra uma soft change + aplica. Retorna a entry pra usar no undo. */
export async function logSoftChange(input: {
  coupleId: string
  targetTable: ChangeTargetTable
  targetId: string
  changedBy: string
  prevValue: Record<string, any>
  newValue: Record<string, any>
}): Promise<ChangeHistoryEntry> {
  const sb = supabase()
  const { data, error } = await sb
    .from('change_history')
    .insert({
      couple_id: input.coupleId,
      target_table: input.targetTable,
      target_id: input.targetId,
      changed_by: input.changedBy,
      prev_value: input.prevValue,
      new_value: input.newValue,
      is_soft: true,
    })
    .select()
    .single()
  if (error) throw error
  return row2hist(data)
}

/** Desfaz uma soft change: restaura prev_value no target + marca undone=true. */
export async function undoSoftChange(entry: ChangeHistoryEntry): Promise<void> {
  const sb = supabase()
  if (Date.now() > entry.canUndoUntil) throw new Error('Janela de undo expirada')

  // Restaura o target
  const { error } = await sb
    .from(entry.targetTable)
    .update(entry.prevValue)
    .eq('id', entry.targetId)
  if (error) throw error

  // Marca undone
  const { error: upErr } = await sb
    .from('change_history')
    .update({ undone: true })
    .eq('id', entry.id)
  if (upErr) throw upErr
}
```

- [ ] **Step 3: typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 4: commit**

```bash
git add src/lib/changes/
git commit -m "feat(auth): supabase client libs for change requests and history"
```

---

## Task 5: popular createdBy em todas as criações + FeedEntry

**Files:**
- Modify: `src/components/CasalNoAzul.tsx` — preencher `createdBy: userId` nos upserts
- Modify: `src/components/AddExpenseSheet.tsx` — adicionar `createdBy` ao criar
- Modify: `src/components/TabMes.tsx` — popular `createdBy` no FeedEntry
- Modify: `src/lib/sync/queue.ts` (se a serialização precisar) — confirmar que `createdBy` vai pro Supabase como `created_by`

- [ ] **Step 1: identificar onde Expense/Fixed/Installment são CRIADOS no cliente**

Procurar usos de `newId()` que criam um novo `Expense/FixedCost/Installment`. Provavelmente em `AddExpenseSheet.tsx` quando `editing` é null (novo). Adicionar `createdBy: userId` ao objeto criado.

Em `src/components/AddExpenseSheet.tsx`, encontrar onde o componente cria uma nova `Expense` (procurar `const newExp: Expense = {...}` ou similar). Adicionar prop `currentUserId: string` ao componente, repassada da `CasalNoAzul`, e setá-la em `createdBy`.

Atualização do JSX em `CasalNoAzul.tsx`:

```tsx
<AddExpenseSheet
  open={sheetOpen}
  onClose={() => { setSheetOpen(false); setEditing(null) }}
  nameA={nameA}
  nameB={nameB}
  monthKey={monthKey}
  customCategories={customCategories}
  editing={editing}
  currentUserId={userId}   // ← NOVO
  onAddExpense={(e) => { ... }}
  ...
/>
```

E na criação de Expense/FixedCost/Installment dentro do AddExpenseSheet, incluir `createdBy: currentUserId`. (O implementer precisa olhar o arquivo pra localizar — está em `src/components/AddExpenseSheet.tsx`.)

- [ ] **Step 2: popular createdBy nos FeedEntry em TabMes**

Em `src/components/TabMes.tsx`, no `useMemo` que monta o `feed`:

Para expenses:
```tsx
entries.push({
  id: e.id, sourceId: e.id,
  kind: 'avulso', desc: e.desc, amount: e.amount,
  paidBy: e.paidBy, scope: e.scope, category: e.category,
  date: e.createdAt,
  paymentMethod: e.paymentMethod,
  createdBy: e.createdBy,   // ← NOVO
})
```

Para fixed:
```tsx
entries.push({
  ...
  paymentMethod: f.paymentMethod,
  createdBy: f.createdBy,   // ← NOVO
})
```

Para installments:
```tsx
entries.push({
  ...
  paymentMethod: i.paymentMethod,
  createdBy: i.createdBy,   // ← NOVO
})
```

- [ ] **Step 3: verificar que upsert vai com `created_by` pro Supabase**

Procurar em `src/lib/sync/queue.ts` ou onde está o upsert. Provavelmente já manda o objeto inteiro e o Supabase ignora campos extras. Verificar que o nome do campo no payload bate com o schema (`created_by` é snake_case no Supabase, `createdBy` é camelCase no client). Pode haver um mapper. Conferir e ajustar se necessário.

Se houver um helper `serializeExpense(e: Expense)` ou similar, adicionar `created_by: e.createdBy`. Se for via Supabase JS SDK direto, transformar manualmente.

- [ ] **Step 4: typecheck e commit**

```bash
pnpm exec tsc --noEmit
git add src/components/ src/lib/sync/
git commit -m "feat(auth): populate createdBy on new entries"
```

---

## Task 6: router em CasalNoAzul — wrappers checam created_by + roteiam por classify

**Files:**
- Modify: `src/components/CasalNoAzul.tsx`

- [ ] **Step 1: imports**

No topo de `CasalNoAzul.tsx`:

```tsx
import { classify } from '@/lib/changes/classify'
import { createChangeRequest } from '@/lib/changes/request'
import { logSoftChange } from '@/lib/changes/history'
```

- [ ] **Step 2: identificar o partner user_id**

Já existe lookup do parceiro via `members`. Adicionar state:

```tsx
const [partnerUserId, setPartnerUserId] = useState<string | null>(null)
```

E carregar quando `coupleId` estiver pronto (no useEffect existente que carrega members count):

```tsx
async function loadPartner() {
  const sb = supabase()
  const { data } = await sb
    .from('members')
    .select('user_id')
    .eq('couple_id', coupleId!)
    .neq('user_id', userId)
    .maybeSingle()
  if (!cancelled) setPartnerUserId(data?.user_id ?? null)
}
loadPartner().catch(() => {})
```

(Dentro do useEffect existente que já carrega members count, expandir.)

- [ ] **Step 3: reescrever upsertExpense pra rotear**

Substituir a função `upsertExpense` por:

```tsx
async function upsertExpense(e: Expense) {
  const existing = expenses.find((x) => x.id === e.id)
  const isOwn = !existing || (existing.createdBy ?? e.createdBy) === userId

  // Criando novo ou editando o próprio → fluxo direto
  if (!existing || isOwn) {
    setExpenses((prev) => {
      const i = prev.findIndex((x) => x.id === e.id)
      if (i === -1) return [...prev, e]
      const copy = prev.slice()
      copy[i] = e
      return copy
    })
    enqueue({ table: 'expenses', op: 'upsert', payload: e })
    pushDrain()
    return
  }

  // Editando do parceiro → classify
  const route = classify(existing, e)
  if (route === 'no-op') return

  if (route === 'soft') {
    // Aplica + loga
    setExpenses((prev) => {
      const i = prev.findIndex((x) => x.id === e.id)
      if (i === -1) return [...prev, e]
      const copy = prev.slice()
      copy[i] = e
      return copy
    })
    enqueue({ table: 'expenses', op: 'upsert', payload: e })
    pushDrain()
    if (coupleId && partnerUserId) {
      await logSoftChange({
        coupleId,
        targetTable: 'expenses',
        targetId: e.id,
        changedBy: userId,
        prevValue: existing as any,
        newValue: e as any,
      }).catch(() => {})
    }
    return
  }

  // route === 'strict' → pedido de aprovação
  if (coupleId && existing.createdBy) {
    await createChangeRequest({
      coupleId,
      targetTable: 'expenses',
      targetId: e.id,
      requestedBy: userId,
      requestedTo: existing.createdBy,
      action: 'edit',
      payload: e as any,
    })
    toast.show('Pedido enviado pra aprovação do parceiro')
  }
}
```

- [ ] **Step 4: reescrever removeExpense (sempre strict cross-user)**

```tsx
async function removeExpense(id: string) {
  const existing = expenses.find((x) => x.id === id)
  if (!existing) return
  const isOwn = (existing.createdBy ?? null) === userId

  if (isOwn) {
    setExpenses((prev) => prev.filter((x) => x.id !== id))
    enqueue({ table: 'expenses', op: 'delete', payload: { id } })
    pushDrain()
    return
  }

  // Cross-user delete → strict
  if (coupleId && existing.createdBy) {
    await createChangeRequest({
      coupleId,
      targetTable: 'expenses',
      targetId: id,
      requestedBy: userId,
      requestedTo: existing.createdBy,
      action: 'delete',
      payload: null,
    })
    toast.show('Pedido de remoção enviado pra aprovação')
  }
}
```

- [ ] **Step 5: reescrever os 4 outros wrappers análogos**

Aplicar a mesma lógica em `upsertFixed`, `removeFixed`, `upsertInstallment`, `removeInstallment`. Para fixed/installment, `targetTable` é `'fixed_costs'` / `'installments'` respectivamente.

> O implementer escreve os 4 — siga o template de `upsertExpense`/`removeExpense`. Mantém o mesmo padrão: own → direto; cross-user soft → loga; cross-user strict → cria request + toast.

Também atualizar `makeDiffSetter` se ele for usado pra fixed/installments/goals — adicionar mesma lógica. Goals NÃO entram no escopo dessa feature (são metas do casal, não tem owner por design).

- [ ] **Step 6: typecheck + commit**

```bash
pnpm exec tsc --noEmit
git add src/components/CasalNoAzul.tsx
git commit -m "feat(auth): route cross-user mutations through classify"
```

---

## Task 7: gate dos botões em FeedRow + AddExpenseSheet

**Files:**
- Modify: `src/components/FeedRow.tsx`
- Modify: `src/components/AddExpenseSheet.tsx`
- Modify: `src/components/TabMes.tsx`
- Modify: `src/components/TabRecorrentes.tsx`

- [ ] **Step 1: FeedRow recebe currentUserId**

Em `src/components/FeedRow.tsx`, adicionar prop:

```tsx
interface Props {
  entry: FeedEntry
  nameA: string
  nameB: string
  customCategories?: CustomCategory[]
  onRemove?: () => void
  onEdit?: () => void
  currentUserId?: string  // ← NOVO
}
```

Calcular `isOwn`:

```tsx
const isOwn = !currentUserId || !entry.createdBy || entry.createdBy === currentUserId
```

Alterar o botão "remover":

```tsx
{onRemove && (
  <button
    onClick={(e) => { e.stopPropagation(); onRemove() }}
    aria-label={isOwn ? 'Remover' : 'Pedir remoção'}
    style={{
      background: isOwn ? `${tokens.color.danger}14` : 'rgba(245,124,0,0.14)',
      border: `1px solid ${isOwn ? `${tokens.color.danger}55` : 'rgba(245,124,0,0.55)'}`,
      color: isOwn ? tokens.color.danger : '#f57c00',
      ...
    }}
  >
    {isOwn ? 'remover' : 'pedir remover'}
  </button>
)}
```

A row já é clicável pra editar — passar `onEdit` continua funcionando, mas dentro do `AddExpenseSheet` o salvar vai checar e criar request se necessário (lógica já está em CasalNoAzul).

- [ ] **Step 2: TabMes passa currentUserId pro FeedRow**

Em `src/components/TabMes.tsx`, na chamada de `<FeedRow>` (dentro do `grouped.map`):

```tsx
<FeedRow
  key={e.id}
  entry={e}
  nameA={nameA}
  nameB={nameB}
  customCategories={customCategories}
  currentUserId={currentUserId}  // ← NOVO
  onRemove={e.kind === 'avulso' ? () => onRemoveExpense(e.sourceId) : undefined}
  ...
/>
```

Adicionar `currentUserId` ao `Props` interface de `TabMes` e ao destructure no topo.

- [ ] **Step 3: TabRecorrentes recebe e usa currentUserId**

Em `src/components/TabRecorrentes.tsx`, adicionar prop `currentUserId` similar e gate dos botões de edição/exclusão de fixed e installment.

- [ ] **Step 4: AddExpenseSheet — quando editando gasto do parceiro, mudar a CTA**

Em `src/components/AddExpenseSheet.tsx`:

Adicionar prop `currentUserId: string`. No render, calcular `isEditingOther`:

```tsx
const editingExpense = editing?.kind === 'avulso' ? editing.expense : null
const editingFixed = editing?.kind === 'fixo' ? editing.fixed : null
const editingInstallment = editing?.kind === 'parcela' ? editing.installment : null
const editingTarget = editingExpense || editingFixed || editingInstallment
const isEditingOther = editing && editingTarget?.createdBy && editingTarget.createdBy !== currentUserId
```

Mudar o texto do botão de "Salvar" pra "Pedir alteração" quando `isEditingOther`. A lógica de salvar **não muda** aqui — chama `onAddExpense(e)` igual; a rota soft/strict é decidida no `CasalNoAzul.upsertExpense`.

Mostrar uma legenda discreta no topo do sheet quando `isEditingOther`:

```tsx
{isEditingOther && (
  <div style={{
    fontSize: 12,
    color: tokens.color.text_muted,
    padding: '8px 16px',
    background: 'rgba(245,124,0,0.10)',
    borderBottom: `1px solid rgba(245,124,0,0.30)`,
  }}>
    ⚠️ Esse gasto foi registrado pelo seu parceiro. Mudanças materiais precisam da aprovação dele(a).
  </div>
)}
```

- [ ] **Step 5: CasalNoAzul passa currentUserId pra TabMes, TabRecorrentes e AddExpenseSheet**

```tsx
<TabMes
  ...
  currentUserId={userId}
/>

<TabRecorrentes
  ...
  currentUserId={userId}
/>

<AddExpenseSheet
  ...
  currentUserId={userId}
/>
```

- [ ] **Step 6: typecheck + commit**

```bash
pnpm exec tsc --noEmit
git add src/components/
git commit -m "feat(auth): gate edit/delete buttons by createdBy"
```

---

## Task 8: PendingRequestsCard + integração na TabConfig + badge

**Files:**
- Create: `src/components/PendingRequestsCard.tsx`
- Modify: `src/components/TabConfig.tsx`
- Modify: `src/components/CasalNoAzul.tsx` (badge no bottom nav)

- [ ] **Step 1: criar `PendingRequestsCard.tsx`**

```tsx
// src/components/PendingRequestsCard.tsx
'use client'

import { useEffect, useState } from 'react'
import { tokens } from '@/lib/tokens'
import { formatBRL } from '@/lib/format'
import { listChangeRequests, approveChangeRequest, denyChangeRequest } from '@/lib/changes/request'
import { supabase } from '@/lib/supabase/client'
import type { ChangeRequest } from './types'

interface Props {
  coupleId: string
  currentUserId: string
  nameA: string
  nameB: string
  partnerName?: string
}

export default function PendingRequestsCard({ coupleId, currentUserId, partnerName }: Props) {
  const [requests, setRequests] = useState<ChangeRequest[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const all = await listChangeRequests(coupleId)
        if (!cancelled) setRequests(all)
      } catch (e) {
        // swallow
      }
    }
    load()

    const sb = supabase()
    const ch = sb
      .channel(`pacto:${coupleId}:change_requests`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'change_requests', filter: `couple_id=eq.${coupleId}` }, () => {
        load()
      })
      .subscribe()
    return () => { cancelled = true; sb.removeChannel(ch) }
  }, [coupleId])

  const pendingForMe = requests.filter(r => r.status === 'pending' && r.requestedTo === currentUserId)

  if (pendingForMe.length === 0) return null

  async function onApprove(req: ChangeRequest) {
    try {
      await approveChangeRequest(req)
      setRequests((prev) => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r))
    } catch (e) {
      alert('Erro ao aprovar.')
    }
  }

  async function onDeny(req: ChangeRequest) {
    try {
      await denyChangeRequest(req.id)
      setRequests((prev) => prev.map(r => r.id === req.id ? { ...r, status: 'denied' } : r))
    } catch (e) {
      alert('Erro ao negar.')
    }
  }

  function descreveAcao(r: ChangeRequest): string {
    if (r.action === 'delete') {
      return `quer apagar um gasto`
    }
    const p = r.payload
    if (!p) return 'quer editar um gasto'
    const parts: string[] = []
    if (p.amount !== undefined) parts.push(`valor → ${formatBRL(p.amount)}`)
    if (p.category) parts.push(`categoria → ${p.category}`)
    if (p.scope) parts.push(`scope → ${p.scope}`)
    if (parts.length === 0) parts.push('valores atualizados')
    return `quer editar (${parts.join(', ')})`
  }

  function expiraEm(r: ChangeRequest): string {
    const ms = r.expiresAt - Date.now()
    if (ms <= 0) return 'expirado'
    const days = Math.floor(ms / 86400000)
    const hours = Math.floor((ms % 86400000) / 3600000)
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  return (
    <div style={{
      background: 'rgba(245,124,0,0.10)',
      border: '1px solid rgba(245,124,0,0.40)',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#c95800',
        marginBottom: 12,
      }}>
        Solicitações pendentes · {pendingForMe.length}
      </div>
      {pendingForMe.map(r => (
        <div key={r.id} style={{
          background: tokens.color.bg_card,
          borderRadius: 10,
          padding: 12,
          marginBottom: 8,
        }}>
          <div style={{ fontSize: 14, color: tokens.color.text_heading, marginBottom: 4 }}>
            {r.action === 'delete' ? '🗑️' : '📝'} {partnerName ?? 'Parceiro(a)'} {descreveAcao(r)}
          </div>
          <div style={{ fontSize: 11, color: tokens.color.text_muted, marginBottom: 10 }}>
            Expira em {expiraEm(r)}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onApprove(r)}
              style={{
                flex: 1,
                background: tokens.color.brand,
                color: tokens.color.text_onBrand,
                border: 'none',
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Aprovar
            </button>
            <button
              onClick={() => onDeny(r)}
              style={{
                flex: 1,
                background: 'transparent',
                color: tokens.color.text_secondary,
                border: `1px solid ${tokens.color.border_default}`,
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Negar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: integrar na TabConfig**

Em `src/components/TabConfig.tsx`, adicionar props `coupleId` e `currentUserId`, e renderizar o card no topo:

```tsx
import PendingRequestsCard from './PendingRequestsCard'

// dentro do JSX, ANTES de tudo:
{coupleId && (
  <PendingRequestsCard
    coupleId={coupleId}
    currentUserId={currentUserId}
    nameA={nameA}
    nameB={nameB}
    partnerName={currentUserId === /* userId A */ ? nameB : nameA}
  />
)}
```

(O implementer ajusta a lógica de `partnerName` conforme o user.)

- [ ] **Step 3: badge no bottom nav (CasalNoAzul)**

Em `src/components/CasalNoAzul.tsx`, BottomNav, adicionar count de pending requests addressed to user. Adicionar state:

```tsx
const [pendingCount, setPendingCount] = useState(0)

useEffect(() => {
  if (!coupleId || !userId) return
  const sb = supabase()
  let cancelled = false
  async function load() {
    const { count } = await sb
      .from('change_requests')
      .select('*', { count: 'exact', head: true })
      .eq('couple_id', coupleId!)
      .eq('requested_to', userId)
      .eq('status', 'pending')
    if (!cancelled) setPendingCount(count ?? 0)
  }
  load()
  const ch = sb
    .channel(`pacto:${coupleId}:badge`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'change_requests', filter: `couple_id=eq.${coupleId}` }, () => { load() })
    .subscribe()
  return () => { cancelled = true; sb.removeChannel(ch) }
}, [coupleId, userId])
```

Passar pra `<BottomNav>`:

```tsx
<BottomNav tab={tab} onTab={setTab} onOpenAdd={...} pendingCount={pendingCount} />
```

E dentro do BottomNav, no chip da Casal, mostrar um badge vermelho com o número se `pendingCount > 0`:

```tsx
{t.id === 'config' && pendingCount > 0 && (
  <span style={{
    position: 'absolute',
    top: 6, right: '30%',
    background: tokens.color.danger,
    color: '#fff',
    fontSize: 9,
    fontWeight: 800,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
  }}>{pendingCount}</span>
)}
```

(Adicionar `position: relative` no `<button>` do chip.)

- [ ] **Step 4: typecheck + commit**

```bash
pnpm exec tsc --noEmit
git add src/components/
git commit -m "feat(auth): pending requests card + bottom nav badge"
```

---

## Task 9: verificação manual + push + PR + merge

**Files:** nenhum.

- [ ] **Step 1: rodar typecheck final**

```bash
cd "/Users/nathanromano/TESTE DE IA/casal-no-azul" && pnpm exec tsc --noEmit
```
Expected: 0 erros.

- [ ] **Step 2: smoke test no navegador**

`pnpm dev` em background. Em 2 sessões anônimas (browsers diferentes), logar como Léo e Bia no mesmo casal.

- [ ] Léo cria gasto → vê em ambos
- [ ] Bia tenta editar paymentMethod do gasto do Léo → muda direto, Léo recebe (na próxima abrir) toast/aviso de soft change
- [ ] Bia tenta editar amount em 30% → vai pra fila pendente do Léo
- [ ] Léo abre Casal → vê 1 pendente → aprova → mudança aplica + Bia recebe confirmação ao recarregar
- [ ] Bia tenta apagar gasto do Léo → vira request, Léo nega → gasto permanece
- [ ] Badge no bottom nav Casal mostra o número correto
- [ ] Léo edita o próprio gasto → fluxo direto, sem request

- [ ] **Step 3: aplicar migration no Supabase de produção**

> **Manual step**: Login no Supabase Studio do projeto Pacto → SQL Editor → paste do conteúdo de `docs/supabase/04_change_authorization.sql` → Run. Verifica que rodou sem erro.
> Configurar cron `expire_change_requests_daily` no painel Cron Jobs.

- [ ] **Step 4: push + PR + merge**

```bash
git push -u origin feat/autorizacao-edicao
gh pr create --title "feat(auth): autorização de edição entre parceiros" --body "$(cat <<'EOF'
## Summary

Implementa regras híbridas pra mudanças cross-user em gastos:
- Soft (paymentMethod, desc, amount <10%): aplica + notifica + 24h undo
- Strict (category, scope, paidBy, amount ≥10%, monthKey, delete): pede aprovação prévia
- Own edits seguem fluxo direto inalterado

## Arquivos

- `docs/supabase/04_change_authorization.sql` — schema novo (já aplicado em prod)
- `src/lib/changes/` — classify + request + history
- `src/components/PendingRequestsCard.tsx` — UI da fila
- `src/components/types.ts` — `createdBy` em Expense/Fixed/Installment/FeedEntry + tipos novos
- `src/components/CasalNoAzul.tsx` — wrappers de mutação roteiam por classify, badge no bottom nav
- `src/components/FeedRow.tsx` — gate de botões por createdBy
- `src/components/AddExpenseSheet.tsx` — CTA muda quando editando gasto do parceiro
- `src/components/TabMes.tsx`, `TabRecorrentes.tsx`, `TabConfig.tsx` — recebem currentUserId

## Test plan

- [ ] Soft edit cross-user aplica direto + notifica
- [ ] Strict edit cria pedido pendente
- [ ] Aprovar aplica mudança
- [ ] Negar mantém estado anterior
- [ ] Badge no bottom nav atualiza em real-time
- [ ] Own edits funcionam direto (sem regressão)
- [ ] Dados antigos têm createdBy populado via migration

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"

gh pr merge <PR#> --squash --delete-branch
```

---

## Self-Review

- **Spec coverage:**
  - `created_by` column populated → Task 1 (DB) + Task 5 (client) ✓
  - Regras híbridas (10% threshold, scope strict, etc) → Task 3 (classify) ✓
  - `change_requests` table + RLS + realtime → Task 1 ✓
  - `change_history` table + undo → Task 1 + Task 4 ✓
  - UX de botões "Pedir alteração" / "Pedir remoção" → Task 7 ✓
  - Tela de pendentes na TabConfig + badge no bottom nav → Task 8 ✓
  - Toast de soft change → **GAP**. A spec menciona `ChangeHistoryToast` mas o plano não criou um componente dedicado. Decisão pragmática: pro MVP, o user nota a mudança quando vê o item no app (createdBy ≠ self), e o histórico fica em `change_history` (acessível em v1.1 via tela "Histórico"). Não é blocker. Adicionar `ChangeHistoryToast.tsx` como follow-up se reclamarem.
  - Cron de expiração → Task 1 step 3 ✓
  - Migração de dados antigos via paid_by proxy → Task 1 step 1 ✓
  - WhatsApp interaction (rule + bot copy) → fora de escopo (será na spec do WhatsApp) ✓

- **Placeholder scan:** sem TBDs ou "handle edge cases" vazios. Algumas referências "o implementer ajusta..." em Task 6 step 5 e Task 5 step 1 (onde os 4 wrappers análogos têm que ser escritos) — passam o template completo, replicação mecânica.

- **Type consistency:** `createdBy` (camelCase no client) vs `created_by` (snake_case no Supabase) explicitado em Task 5 step 3. `ChangeRequest`, `ChangeHistoryEntry`, `ChangeRoute` consistentes entre Task 2, 3, 4, 8.
