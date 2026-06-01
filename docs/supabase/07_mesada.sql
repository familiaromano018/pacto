-- 07_mesada.sql
-- Mesada: valor mensal igual que cada pessoa pode gastar livremente (gastos
-- pessoais) sem virar cobrança. Combina com o pacto "Conta 100% Unificada",
-- mas funciona com qualquer método. Guardado como texto, igual income_a/b.
--
-- Rode isto no SQL editor do Supabase em bancos já existentes.

alter table public.couples
  add column if not exists mesada text default '0';
