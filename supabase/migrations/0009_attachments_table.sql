-- ============================================
-- 첨부파일 테이블 생성
-- ============================================
-- 케이스별로 업로드된 서류 파일들을 관리합니다.
-- 4종 서류: 병원 영수증, 병원 세부영수증, 입퇴원 확인서, 간호일지

-- 첨부파일 타입 ENUM
create type attachment_type as enum (
  'HOSPITAL_RECEIPT',      -- 병원 영수증
  'HOSPITAL_DETAIL',       -- 병원 세부영수증
  'ADMISSION_DISCHARGE',  -- 입퇴원 확인서
  'NURSING_LOG'            -- 간호일지
);

-- 첨부파일 테이블
create table if not exists public.attachments (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  file_type attachment_type not null,
  file_name text not null,
  file_url text not null,  -- Supabase Storage URL
  file_size integer not null,  -- bytes
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 인덱스 생성
create index if not exists idx_attachments_case_id on public.attachments(case_id);
create index if not exists idx_attachments_file_type on public.attachments(file_type);

-- RLS 정책
alter table public.attachments enable row level security;

-- 보호자는 자신의 케이스 첨부파일만 조회/생성/삭제 가능
create policy "보호자는 자신의 케이스 첨부파일 조회 가능"
  on public.attachments
  for select
  using (
    exists (
      select 1 from public.cases
      where cases.id = attachments.case_id
      and cases.guardian_id = auth.uid()
    )
  );

create policy "보호자는 자신의 케이스 첨부파일 생성 가능"
  on public.attachments
  for insert
  with check (
    exists (
      select 1 from public.cases
      where cases.id = attachments.case_id
      and cases.guardian_id = auth.uid()
    )
  );

create policy "보호자는 자신의 케이스 첨부파일 삭제 가능"
  on public.attachments
  for delete
  using (
    exists (
      select 1 from public.cases
      where cases.id = attachments.case_id
      and cases.guardian_id = auth.uid()
    )
  );

-- Admin 정책은 나중에 추가 (RLS 재귀 문제 방지)
-- 현재는 보호자만 사용 가능

