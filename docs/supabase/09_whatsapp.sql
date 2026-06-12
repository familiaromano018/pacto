-- ============================================================================
-- PACTO — Integração WhatsApp (Fase 0: fundação)
-- ----------------------------------------------------------------------------
-- Liga um número de WhatsApp a um usuário, pra ele lançar/consultar gastos
-- por mensagem. Cada usuário verifica o próprio número (assim o `paid_by`
-- 'A'/'B' sai de graça: quem mandou = quem é).
--
-- Cola este arquivo no SQL Editor do Supabase e clica Run.
-- Depende de: schema.sql (tabela members, função tg_set_updated_at).
-- ============================================================================

-- ───────────────────────────────────────────────────────── USER_WHATSAPP ──
-- Uma row por usuário. `phone` guardado só com dígitos em E.164 (ex: 5511999998888).
-- Fluxo de verificação:
--   1. app gera `verify_code` (6 dígitos) e mostra "envie X pro WhatsApp do Pacto"
--   2. usuário manda o código pelo Zap
--   3. webhook bate o código, grava `phone` = remetente e marca `verified = true`
create table if not exists public.user_whatsapp (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  phone              text,
  verified           boolean not null default false,
  verify_code        text,
  verify_expires_at  timestamptz,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- Um número verificado pertence a no máximo um usuário.
create unique index if not exists user_whatsapp_phone_unique
  on public.user_whatsapp(phone)
  where phone is not null and verified;

-- Lookup rápido por código pendente (usado pelo webhook na verificação).
create index if not exists user_whatsapp_verify_code_idx
  on public.user_whatsapp(verify_code)
  where verify_code is not null;

drop trigger if exists trg_user_whatsapp_updated on public.user_whatsapp;
create trigger trg_user_whatsapp_updated before update on public.user_whatsapp
  for each row execute function public.tg_set_updated_at();

-- ───────────────────────────────────────────────────────── RLS ──
-- Cada usuário só enxerga/edita a própria linha. O webhook usa service-role
-- (bypassa RLS), então não precisa de policy pra ele.
alter table public.user_whatsapp enable row level security;

drop policy if exists "user_whatsapp_all" on public.user_whatsapp;
create policy "user_whatsapp_all" on public.user_whatsapp for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
