create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  role text not null default 'rep',
  territory text,
  created_at timestamptz not null default now()
);

create table if not exists searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  query_text text not null,
  normalized_geography text not null,
  radius text,
  category text,
  created_at timestamptz not null default now()
);

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  website text,
  city text,
  state_region text,
  country text,
  science_focus text,
  employee_band text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists opportunity_signals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  signal_type text not null,
  source_type text not null,
  source_url text,
  source_title text,
  source_date date,
  signal_summary text not null,
  confidence_score integer,
  sourcing_likelihood text,
  geography_match text,
  duplicate_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists saved_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  opportunity_signal_id uuid references opportunity_signals(id) on delete cascade,
  status text not null default 'new',
  notes text,
  created_at timestamptz not null default now()
);
