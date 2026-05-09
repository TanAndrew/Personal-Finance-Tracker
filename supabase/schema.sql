-- Run this in your Supabase SQL editor to set up the database

-- Transactions table
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text check (type in ('income', 'expense')) not null,
  amount numeric(12, 2) not null,
  category text not null,
  note text,
  date date not null,
  created_at timestamptz default now() not null
);

-- Savings goals table
create table public.savings_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  monthly_income numeric(12, 2) not null,
  monthly_savings_target numeric(12, 2) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Investment holdings table
create table public.investments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  ticker text not null,
  name text,
  shares numeric(12, 6) not null,
  avg_cost numeric(12, 4) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Row Level Security: users can only see their own data
alter table public.transactions enable row level security;
alter table public.savings_goals enable row level security;
alter table public.investments enable row level security;

create policy "Users can manage their own transactions"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own savings goals"
  on public.savings_goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own investments"
  on public.investments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
