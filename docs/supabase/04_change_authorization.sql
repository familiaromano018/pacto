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
-- 7) Cron: expira pedidos > 7d
-- ────────────────────────────────────────────────────────────────
create or replace function public.expire_old_change_requests()
returns void language sql security definer set search_path = public as $func$
  update public.change_requests
    set status = 'expired', resolved_at = now()
    where status = 'pending' and expires_at < now();
$func$;
