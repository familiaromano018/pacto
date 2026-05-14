create table if not exists public.subscriptions (
  couple_id uuid primary key references public.couples(id) on delete cascade,
  paid_by_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'trial' check (status in ('trial','active','past_due','canceled','expired')),
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  hotmart_subscriber_code text,
  hotmart_transaction_id text,
  hotmart_event_log jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists subscriptions_status_idx on public.subscriptions(status);
create index if not exists subscriptions_trial_ends_idx on public.subscriptions(trial_ends_at);
create index if not exists subscriptions_period_end_idx on public.subscriptions(current_period_end);
create index if not exists subscriptions_subscriber_idx on public.subscriptions(hotmart_subscriber_code);

drop trigger if exists trg_subscriptions_updated on public.subscriptions;
create trigger trg_subscriptions_updated before update on public.subscriptions
  for each row execute function public.tg_set_updated_at();

create or replace function public.tg_create_trial_on_couple()
returns trigger language plpgsql security definer set search_path = public as $func$
begin
  insert into public.subscriptions (couple_id, status, trial_ends_at)
  values (new.id, 'trial', now() + interval '14 days')
  on conflict (couple_id) do nothing;
  return new;
end
$func$;

drop trigger if exists trg_couples_create_trial on public.couples;
create trigger trg_couples_create_trial after insert on public.couples
  for each row execute function public.tg_create_trial_on_couple();

create or replace function public.couple_has_access(target_couple uuid)
returns boolean language sql stable security definer set search_path = public as $func$
  select exists (
    select 1 from public.subscriptions
    where couple_id = target_couple
    and (
      (status = 'trial' and trial_ends_at > now())
      or
      (status = 'active' and current_period_end > now())
    )
  );
$func$;

drop function if exists public.get_my_subscription();

create function public.get_my_subscription()
returns jsonb language sql stable security definer set search_path = public as $func$
  select to_jsonb(t) from (
    select
      subs.couple_id,
      subs.status,
      subs.trial_ends_at,
      subs.current_period_end,
      (
        case
          when subs.status = 'trial' and subs.trial_ends_at is not null
            then greatest(0, ceil(extract(epoch from (subs.trial_ends_at - now())) / 86400)::int)
          when subs.status = 'active' and subs.current_period_end is not null
            then greatest(0, ceil(extract(epoch from (subs.current_period_end - now())) / 86400)::int)
          else 0
        end
      )::int as days_remaining,
      (
        (subs.status = 'trial' and subs.trial_ends_at > now())
        or
        (subs.status = 'active' and subs.current_period_end > now())
      ) as has_access
    from public.subscriptions subs
    inner join public.members mem on mem.couple_id = subs.couple_id and mem.user_id = auth.uid()
    limit 1
  ) t;
$func$;

create or replace function public.find_couple_by_buyer_email(buyer_email text)
returns uuid language sql security definer set search_path = public, auth as $func$
  select m.couple_id from public.members m
  join auth.users u on u.id = m.user_id
  where lower(u.email) = lower(buyer_email)
  order by m.joined_at asc
  limit 1;
$func$;

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select" on public.subscriptions;
create policy "subscriptions_select" on public.subscriptions for select using (public.is_member(couple_id));

alter publication supabase_realtime add table public.subscriptions;

insert into public.subscriptions (couple_id, status, trial_ends_at)
  select c.id, 'trial', now() + interval '14 days'
  from public.couples c
  where not exists (select 1 from public.subscriptions s where s.couple_id = c.id);
