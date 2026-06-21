-- 10_category_budgets.sql
-- Pacto "Orçamento por categoria": adiciona a coluna category_budgets (jsonb)
-- em couples — mapa categoria -> limite mensal em R$ (ex: {"Mercado": 1200}).
-- Mesmo padrão do category_split (08). RLS já cobre couples.
--
-- Rode isto no SQL editor do Supabase ANTES de usar o recurso em produção.

alter table public.couples
  add column if not exists category_budgets jsonb default '{}'::jsonb;
