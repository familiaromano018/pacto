-- ============================================================================
-- PACTO — Schema completo
-- ----------------------------------------------------------------------------
-- Cola TODO esse arquivo de uma vez no SQL Editor do Supabase e clica Run.
-- Tabelas, RLS e funções são criadas em ordem.
-- ============================================================================

-- ───────────────────────────────────────────────────────── EXTENSIONS ──
create extension if not exists "pgcrypto";

-- ───────────────────────────────────────────────────────── COUPLES ──
-- Uma row por casal. `code` é o convite que o parceiro digita pra entrar.
create table if not exists public.couples (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null,
  name_a        text default '',
  name_b        text default '',
  income_a      text default '',
  income_b      text default '',
  method        text default '50/50' check (method in ('50/50', 'proporcional')),
  privacy_mode  text default 'open' check (privacy_mode in ('open', 'private')),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ───────────────────────────────────────────────────────── MEMBERS ──
-- Vincula um auth.user a um couple. Primeiro a entrar é role 'A', segundo 'B'.
create table if not exists public.members (
  user_id     uuid references auth.users(id) on delete cascade not null,
  couple_id   uuid references public.couples(id) on delete cascade not null,
  role        text not null check (role in ('A', 'B')),
  joined_at   timestamptz default now(),
  primary key (user_id, couple_id)
);
create index if not exists members_couple_idx on public.members(couple_id);

-- ───────────────────────────────────────────────────────── EXPENSES (avulsos) ──
create table if not exists public.expenses (
  id              uuid primary key default gen_random_uuid(),
  couple_id       uuid references public.couples(id) on delete cascade not null,
  created_by      uuid references auth.users(id) on delete set null,
  desc_text       text not null,
  amount          numeric(12,2) not null check (amount >= 0),
  paid_by         text not null check (paid_by in ('A', 'B')),
  scope           text not null check (scope in ('casal', 'A', 'B')),
  category        text not null,
  payment_method  text check (payment_method in ('pix', 'debito', 'credito', 'dinheiro', 'boleto', 'transferencia')),
  month_key       text not null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists expenses_couple_month_idx on public.expenses(couple_id, month_key);

-- ───────────────────────────────────────────────────────── FIXED COSTS ──
create table if not exists public.fixed_costs (
  id              uuid primary key default gen_random_uuid(),
  couple_id       uuid references public.couples(id) on delete cascade not null,
  created_by      uuid references auth.users(id) on delete set null,
  desc_text       text not null,
  amount          numeric(12,2) not null check (amount >= 0),
  paid_by         text not null check (paid_by in ('A', 'B')),
  scope           text not null check (scope in ('casal', 'A', 'B')),
  category        text not null,
  payment_method  text check (payment_method in ('pix', 'debito', 'credito', 'dinheiro', 'boleto', 'transferencia')),
  due_day         smallint check (due_day between 1 and 31),
  active          boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists fixed_couple_idx on public.fixed_costs(couple_id);

-- ───────────────────────────────────────────────────────── INSTALLMENTS ──
create table if not exists public.installments (
  id               uuid primary key default gen_random_uuid(),
  couple_id        uuid references public.couples(id) on delete cascade not null,
  created_by       uuid references auth.users(id) on delete set null,
  desc_text        text not null,
  total_amount     numeric(12,2) not null check (total_amount >= 0),
  total_parcelas   smallint not null check (total_parcelas > 0),
  paid_parcelas    smallint default 0 check (paid_parcelas >= 0),
  parcela_mensal   numeric(12,2) not null,
  paid_by          text not null check (paid_by in ('A', 'B')),
  scope            text not null check (scope in ('casal', 'A', 'B')),
  category         text not null,
  payment_method   text check (payment_method in ('pix', 'debito', 'credito', 'dinheiro', 'boleto', 'transferencia')),
  due_day          smallint check (due_day between 1 and 31),
  started_at       timestamptz default now(),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
create index if not exists installments_couple_idx on public.installments(couple_id);

-- ───────────────────────────────────────────────────────── GOALS ──
create table if not exists public.goals (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid references public.couples(id) on delete cascade not null,
  created_by  uuid references auth.users(id) on delete set null,
  name        text not null,
  target      numeric(12,2) not null check (target >= 0),
  saved       numeric(12,2) default 0 check (saved >= 0),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists goals_couple_idx on public.goals(couple_id);

-- ───────────────────────────────────────────────────────── CLOSED MONTHS ──
create table if not exists public.closed_months (
  couple_id   uuid references public.couples(id) on delete cascade not null,
  month_key   text not null,
  closed_at   timestamptz default now(),
  totals      jsonb not null,
  primary key (couple_id, month_key)
);

-- ───────────────────────────────────────────────────────── CUSTOM CATEGORIES ──
create table if not exists public.custom_categories (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid references public.couples(id) on delete cascade not null,
  name        text not null,
  emoji       text not null,
  created_at  timestamptz default now(),
  unique (couple_id, name)
);
create index if not exists categories_couple_idx on public.custom_categories(couple_id);

-- ============================================================================
-- TRIGGERS — updated_at automático
-- ============================================================================
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare
  tbl text;
begin
  for tbl in select unnest(array['couples','expenses','fixed_costs','installments','goals']) loop
    execute format(
      'drop trigger if exists trg_%I_updated on public.%I;
       create trigger trg_%I_updated before update on public.%I
       for each row execute function public.tg_set_updated_at();',
      tbl, tbl, tbl, tbl
    );
  end loop;
end $$;

-- ============================================================================
-- FUNCTION — gerar código de convite
-- ============================================================================
-- Formato: PACTO-XXXX (4 caracteres alfanuméricos sem 0/O/1/I pra evitar confusão)
create or replace function public.generate_couple_code()
returns text language plpgsql as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  generated_code text := '';
  i int;
  exists_check int;
begin
  loop
    generated_code := 'PACTO-';
    for i in 1..4 loop
      generated_code := generated_code || substr(chars, floor(random() * length(chars))::int + 1, 1);
    end loop;
    select count(*) into exists_check from public.couples where couples.code = generated_code;
    exit when exists_check = 0;
  end loop;
  return generated_code;
end $$;

-- ============================================================================
-- FUNCTION — criar casal e adicionar criador como member A
-- ============================================================================
create or replace function public.create_couple_for_current_user()
returns uuid language plpgsql security definer as $$
declare
  new_couple_id uuid;
  new_code text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  -- Já tem couple? Retorna o existente
  select c.id into new_couple_id
    from public.couples c
    join public.members m on m.couple_id = c.id
   where m.user_id = auth.uid()
   limit 1;
  if new_couple_id is not null then
    return new_couple_id;
  end if;

  new_code := public.generate_couple_code();
  insert into public.couples (code) values (new_code) returning id into new_couple_id;
  insert into public.members (user_id, couple_id, role) values (auth.uid(), new_couple_id, 'A');
  return new_couple_id;
end $$;

-- ============================================================================
-- FUNCTION — entrar num casal via código
-- ============================================================================
create or replace function public.join_couple_with_code(invite_code text)
returns uuid language plpgsql security definer as $$
declare
  target_couple_id uuid;
  existing_role text;
  member_count int;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id into target_couple_id from public.couples where code = upper(invite_code);
  if target_couple_id is null then
    raise exception 'Código inválido';
  end if;

  -- Já é member?
  select role into existing_role from public.members where user_id = auth.uid() and couple_id = target_couple_id;
  if existing_role is not null then
    return target_couple_id;
  end if;

  -- User já tem outro couple? Bloquear (1 user = 1 couple por enquanto)
  if exists (select 1 from public.members where user_id = auth.uid()) then
    raise exception 'Você já faz parte de outro casal. Saia primeiro.';
  end if;

  -- Couple cheio?
  select count(*) into member_count from public.members where couple_id = target_couple_id;
  if member_count >= 2 then
    raise exception 'Este casal já tem 2 membros';
  end if;

  insert into public.members (user_id, couple_id, role) values (auth.uid(), target_couple_id, 'B');
  return target_couple_id;
end $$;

-- ============================================================================
-- RLS — Row Level Security
-- ============================================================================
alter table public.couples           enable row level security;
alter table public.members           enable row level security;
alter table public.expenses          enable row level security;
alter table public.fixed_costs       enable row level security;
alter table public.installments      enable row level security;
alter table public.goals             enable row level security;
alter table public.closed_months     enable row level security;
alter table public.custom_categories enable row level security;

-- Helper: user é member do couple X?
-- SECURITY DEFINER + search_path fixo evita recursão da policy de members
-- (que usa is_member, que faz SELECT em members, que dispararia a policy de novo).
create or replace function public.is_member(target_couple uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members
     where user_id = auth.uid() and couple_id = target_couple
  );
$$;

-- ── COUPLES policies ──
drop policy if exists "couples_select"   on public.couples;
drop policy if exists "couples_update"   on public.couples;
create policy "couples_select" on public.couples for select
  using (public.is_member(id));
create policy "couples_update" on public.couples for update
  using (public.is_member(id));

-- ── MEMBERS policies ──
drop policy if exists "members_select"   on public.members;
create policy "members_select" on public.members for select
  using (public.is_member(couple_id));

-- ── EXPENSES, FIXED_COSTS, INSTALLMENTS, GOALS, CLOSED_MONTHS, CUSTOM_CATEGORIES ──
-- Padrão: member do couple acessa.
-- Privacy_mode 'private': scope='A' só visível por role='A'; scope='B' só por role='B'.
do $$
declare
  tbl text;
begin
  for tbl in select unnest(array['expenses','fixed_costs','installments']) loop
    execute format($f$
      drop policy if exists "%1$s_select" on public.%1$I;
      drop policy if exists "%1$s_insert" on public.%1$I;
      drop policy if exists "%1$s_update" on public.%1$I;
      drop policy if exists "%1$s_delete" on public.%1$I;
      create policy "%1$s_select" on public.%1$I for select
        using (
          public.is_member(couple_id)
          and (
            scope = 'casal'
            or (select privacy_mode from public.couples where id = couple_id) = 'open'
            or (
              (select privacy_mode from public.couples where id = couple_id) = 'private'
              and scope = (select role from public.members where user_id = auth.uid() and couple_id = %1$I.couple_id)
            )
          )
        );
      create policy "%1$s_insert" on public.%1$I for insert
        with check (public.is_member(couple_id));
      create policy "%1$s_update" on public.%1$I for update
        using (public.is_member(couple_id));
      create policy "%1$s_delete" on public.%1$I for delete
        using (public.is_member(couple_id));
    $f$, tbl);
  end loop;

  for tbl in select unnest(array['goals','closed_months','custom_categories']) loop
    execute format($f$
      drop policy if exists "%1$s_all" on public.%1$I;
      create policy "%1$s_all" on public.%1$I for all
        using (public.is_member(couple_id))
        with check (public.is_member(couple_id));
    $f$, tbl);
  end loop;
end $$;

-- ============================================================================
-- REALTIME — habilitar publication pra subscriptions
-- ============================================================================
-- Supabase já cria a publication 'supabase_realtime'. Só adicionamos as tabelas.
alter publication supabase_realtime add table public.couples;
alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.fixed_costs;
alter publication supabase_realtime add table public.installments;
alter publication supabase_realtime add table public.goals;
alter publication supabase_realtime add table public.closed_months;
alter publication supabase_realtime add table public.custom_categories;
