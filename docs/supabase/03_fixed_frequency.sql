alter table public.fixed_costs
  add column if not exists frequency text default 'monthly'
  check (frequency in ('monthly','bimonthly','quarterly','semiannual','annual'));

update public.fixed_costs set frequency = 'monthly' where frequency is null;
