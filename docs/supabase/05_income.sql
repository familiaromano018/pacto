-- 05_income.sql
-- Receita avulsa: marca um lançamento da tabela expenses como entrada (income)
-- em vez de gasto (expense). Mantém todo o resto do encanamento (sync, RLS,
-- realtime) inalterado — receita é só um expense com type='income'.
--
-- Rode isto no SQL editor do Supabase em bancos já existentes.

alter table public.expenses
  add column if not exists type text not null default 'expense'
  check (type in ('expense', 'income'));
