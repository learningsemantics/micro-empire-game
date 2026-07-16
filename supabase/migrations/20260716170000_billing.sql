create table if not exists public.billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text unique not null,
  stripe_price_id text,
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  stripe_event_created bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.billing_customers enable row level security;
alter table public.subscriptions enable row level security;

create policy "Players can read their own billing customer"
on public.billing_customers for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Players can read their own subscription"
on public.subscriptions for select to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.billing_customers from anon, authenticated;
revoke all on public.subscriptions from anon, authenticated;
grant select on public.billing_customers to authenticated;
grant select on public.subscriptions to authenticated;

create or replace function public.set_subscription_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at before update on public.subscriptions
for each row execute function public.set_subscription_updated_at();
