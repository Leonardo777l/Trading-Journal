-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- RESET (Caution: Deletes data to ensure clean schema)
drop table if exists public.trades cascade;
drop table if exists public.trading_accounts cascade;
drop table if exists public.profiles cascade;

-- PROFILES (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  tier text default 'Free' check (tier in ('Free', 'Pro')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRADING ACCOUNTS
create table public.trading_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('Challenge', 'Funded', 'Personal')),
  initial_balance numeric not null,
  current_balance numeric not null,
  daily_drawdown_limit numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRADES
create table public.trades (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references public.trading_accounts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  
  symbol text not null,
  direction text not null check (direction in ('Long', 'Short')),
  status text not null check (status in ('Win', 'Loss', 'BE', 'Open')),
  session text, -- London, NY, Asia
  
  entry_date timestamp with time zone not null,
  entry_price numeric,
  exit_price numeric,
  
  lot_size numeric,
  commission numeric default 0,
  gross_pnl numeric not null,
  net_pnl numeric generated always as (gross_pnl - commission) stored,
  
  pnl_percentage numeric,
  
  setup_tags text[], -- Array of strings for strategies
  images text[],     -- Array of image URLs
  notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Security)
alter table public.profiles enable row level security;
alter table public.trading_accounts enable row level security;
alter table public.trades enable row level security;

-- Profiles: Users can see and update their own profile
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Accounts: Users can only see/edit their own accounts
create policy "Users can view own accounts." on public.trading_accounts for select using (auth.uid() = user_id);
create policy "Users can insert own accounts." on public.trading_accounts for insert with check (auth.uid() = user_id);
create policy "Users can update own accounts." on public.trading_accounts for update using (auth.uid() = user_id);
create policy "Users can delete own accounts." on public.trading_accounts for delete using (auth.uid() = user_id);

-- Trades: Users can only see/edit their own trades
create policy "Users can view own trades." on public.trades for select using (auth.uid() = user_id);
create policy "Users can insert own trades." on public.trades for insert with check (auth.uid() = user_id);
create policy "Users can update own trades." on public.trades for update using (auth.uid() = user_id);
create policy "Users can delete own trades." on public.trades for delete using (auth.uid() = user_id);

-- TRIGGER: Create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, username)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SYNC: Insert missing profiles for existing users
-- Run this if resetting the database while users already exist in auth.users
insert into public.profiles (id, email, username)
select id, email, raw_user_meta_data->>'full_name'
from auth.users
on conflict (id) do nothing;
