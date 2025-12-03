-- ============================================
-- 간병노트 1차 MVP - 데이터베이스 초기화 스크립트
-- ============================================
-- 이 파일은 Supabase SQL Editor에 복사/붙여넣기하여 한 번에 실행할 수 있습니다.
-- 생성되는 테이블: users, cases, case_tokens, care_logs, payments
-- ============================================

-- 필수 확장 기능 활성화
create extension if not exists "pgcrypto";

-- ============================================
-- 1. ENUM 타입 정의
-- ============================================

-- 케이스 상태 ENUM
create type case_status as enum (
  'GUARDIAN_PENDING',   -- 보호자 동의 대기
  'CAREGIVER_PENDING',  -- 간병인 동의 대기
  'IN_PROGRESS',        -- 간병 진행 중
  'COMPLETED',          -- 간병 완료
  'CANCELLED'           -- 취소됨
);

-- ============================================
-- 2. 테이블 생성
-- ============================================

-- 2.1 Users 테이블 (Supabase Auth 확장)
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2.2 Cases 테이블 (간병 케이스)
create table if not exists public.cases (
  id uuid default gen_random_uuid() primary key,
  guardian_id uuid references public.users(id) not null,
  
  -- 환자 정보
  patient_name text not null,
  hospital_name text,
  diagnosis text,
  
  -- 간병 기간
  start_date date not null,
  end_date_expected date not null,
  end_date_final date,
  
  -- 간병 비용
  daily_wage integer not null,
  
  -- 간병인 정보 (보호자 입력)
  caregiver_name text,
  caregiver_contact text,
  
  -- 간병인 정보 (간병인 직접 입력)
  caregiver_phone text,
  caregiver_birth_date text,
  caregiver_account_bank text,
  caregiver_account_number text,
  
  -- 상태 관리
  status case_status default 'GUARDIAN_PENDING' not null,
  guardian_agreed_at timestamptz,
  caregiver_agreed_at timestamptz,
  
  -- 타임스탬프
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2.3 Case Tokens 테이블 (간병인 접속용 토큰)
create table if not exists public.case_tokens (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  token text default encode(gen_random_bytes(32), 'hex') not null unique,
  created_at timestamptz default now() not null,
  expires_at timestamptz
);

-- 2.4 Care Logs 테이블 (간병일지)
create table if not exists public.care_logs (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  date date not null,
  content text,
  is_active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(case_id, date)
);

-- 2.5 Payments 테이블 (간병비 지급 정보)
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  total_amount integer,
  paid_at timestamptz,
  created_at timestamptz default now() not null
);

-- ============================================
-- 3. 인덱스 생성 (성능 최적화)
-- ============================================

create index if not exists idx_cases_guardian_id on public.cases(guardian_id);
create index if not exists idx_cases_status on public.cases(status);
create index if not exists idx_case_tokens_token on public.case_tokens(token);
create index if not exists idx_care_logs_case_id on public.care_logs(case_id);
create index if not exists idx_care_logs_date on public.care_logs(date);
create index if not exists idx_payments_case_id on public.payments(case_id);

-- ============================================
-- 4. RLS (Row Level Security) 활성화
-- ============================================

alter table public.users enable row level security;
alter table public.cases enable row level security;
alter table public.case_tokens enable row level security;
alter table public.care_logs enable row level security;
alter table public.payments enable row level security;

-- ============================================
-- 5. RLS 정책 (테스트용 - 모든 접근 허용)
-- ============================================
-- ⚠️ 경고: 아래 정책은 개발/테스트 목적입니다.
-- ⚠️ 프로덕션 배포 전에 반드시 보안 정책으로 교체하세요!

-- Users 테이블
drop policy if exists "테스트용_users_모두허용" on public.users;
create policy "테스트용_users_모두허용" on public.users
  for all
  using (true)
  with check (true);

-- Cases 테이블
drop policy if exists "테스트용_cases_모두허용" on public.cases;
create policy "테스트용_cases_모두허용" on public.cases
  for all
  using (true)
  with check (true);

-- Case Tokens 테이블
drop policy if exists "테스트용_case_tokens_모두허용" on public.case_tokens;
create policy "테스트용_case_tokens_모두허용" on public.case_tokens
  for all
  using (true)
  with check (true);

-- Care Logs 테이블
drop policy if exists "테스트용_care_logs_모두허용" on public.care_logs;
create policy "테스트용_care_logs_모두허용" on public.care_logs
  for all
  using (true)
  with check (true);

-- Payments 테이블
drop policy if exists "테스트용_payments_모두허용" on public.payments;
create policy "테스트용_payments_모두허용" on public.payments
  for all
  using (true)
  with check (true);

-- ============================================
-- 6. 트리거 함수 (updated_at 자동 업데이트)
-- ============================================

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 각 테이블에 트리거 적용
drop trigger if exists update_users_updated_at on public.users;
create trigger update_users_updated_at
  before update on public.users
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists update_cases_updated_at on public.cases;
create trigger update_cases_updated_at
  before update on public.cases
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists update_care_logs_updated_at on public.care_logs;
create trigger update_care_logs_updated_at
  before update on public.care_logs
  for each row
  execute function public.update_updated_at_column();

-- ============================================
-- 7. Auth 트리거 (Supabase Auth 연동)
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- 완료! 🎉
-- ============================================
-- 테이블 생성이 완료되었습니다.
-- 아래 쿼리로 테이블 목록을 확인하세요:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

