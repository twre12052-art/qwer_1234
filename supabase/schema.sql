-- Users table (extends auth.users)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cases table
create type case_status as enum (
  'GUARDIAN_PENDING',
  'CAREGIVER_PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

create table public.cases (
  id uuid default gen_random_uuid() primary key,
  guardian_id uuid references public.users(id) not null,
  
  -- Patient Info
  patient_name text not null,
  hospital_name text,
  diagnosis text,
  
  -- Care Period
  start_date date not null,
  end_date_expected date not null,
  end_date_final date, -- Actual end date (if different)
  
  -- Payment Info
  daily_wage integer not null,
  
  -- Caregiver Info (Entered by Guardian initially)
  caregiver_name text,
  caregiver_contact text,
  
  -- Caregiver Info (Confirmed/Entered by Caregiver)
  caregiver_phone text,
  caregiver_birth_date text, -- Encrypted later
  caregiver_account_bank text,
  caregiver_account_number text,
  
  -- Meta
  status case_status default 'GUARDIAN_PENDING' not null,
  guardian_agreed_at timestamp with time zone,
  caregiver_agreed_at timestamp with time zone,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Case Tokens (for Caregiver access)
create table public.case_tokens (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  token text default encode(gen_random_bytes(32), 'hex') not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone
);

-- Care Logs
create table public.care_logs (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  date date not null,
  content text,
  is_active boolean default true, -- If case ended early, future logs might be inactive
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(case_id, date)
);

-- Payments (Placeholder for M3)
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  total_amount integer,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies

-- Users
alter table public.users enable row level security;
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- Cases
alter table public.cases enable row level security;
create policy "Guardians can view their own cases" on public.cases
  for select using (auth.uid() = guardian_id);
create policy "Guardians can insert their own cases" on public.cases
  for insert with check (auth.uid() = guardian_id);
create policy "Guardians can update their own cases" on public.cases
  for update using (auth.uid() = guardian_id);

-- Allow caregivers to view cases via token (This logic handles in application or via special function, 
-- but for direct table access we might need a function or 'true' if we bypass RLS for token checks in server actions)
-- For now, we rely on Server Actions with Service Role for token verification, 
-- or we add a policy if the user is authenticated as caregiver (M2).
-- Since M1 is Guardian flow, we focus on Guardian policies.

-- Functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

