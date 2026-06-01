-- 08_category_split.sql
-- Pacto "Divisão por Categorias": adiciona 'categorias' como método válido e
-- uma coluna category_split (jsonb) com o mapa categoria -> 'A' | 'B' | 'ambos'.
-- 'ambos' (ou categoria sem dono) divide 50/50; 'A'/'B' = aquela pessoa assume
-- 100% do custo daquela categoria nas contas do casal.
--
-- Rode isto no SQL editor do Supabase em bancos já existentes.

alter table public.couples drop constraint if exists couples_method_check;

alter table public.couples
  add constraint couples_method_check
  check (method in ('50/50', 'proporcional', 'unificada', 'categorias'));

alter table public.couples
  add column if not exists category_split jsonb default '{}'::jsonb;
