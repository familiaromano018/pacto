-- 06_unified_method.sql
-- Pacto "Conta 100% Unificada": adiciona 'unificada' como método de divisão
-- válido na tabela couples. Nesse modo não há acerto entre as pessoas —
-- todo gasto sai do bolso comum.
--
-- Rode isto no SQL editor do Supabase em bancos já existentes.

alter table public.couples drop constraint if exists couples_method_check;

alter table public.couples
  add constraint couples_method_check
  check (method in ('50/50', 'proporcional', 'unificada'));
