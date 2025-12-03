# Supabase 데이터베이스 마이그레이션 가이드

## 📋 실행 방법

### 1. Supabase 대시보드 접속
1. [Supabase Dashboard](https://app.supabase.com) 로그인
2. 프로젝트 선택 (`opwqefptdwakvemcwxhb`)
3. 좌측 메뉴에서 **"SQL Editor"** 클릭

### 2. SQL 스크립트 실행
1. `0001_init_database.sql` 파일 열기
2. 파일 내용 **전체 복사** (Ctrl+A → Ctrl+C)
3. Supabase SQL Editor에 **붙여넣기** (Ctrl+V)
4. 우측 하단 **"Run"** 버튼 클릭

### 3. 실행 결과 확인
성공 시 다음과 같은 메시지가 표시됩니다:
```
Success. No rows returned
```

테이블 목록을 확인하려면 아래 쿼리를 실행하세요:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**예상 결과:**
- `care_logs`
- `case_tokens`
- `cases`
- `payments`
- `users`

---

## ⚠️ 중요: 배포 전 보안 정책 교체

현재 RLS 정책은 **모든 사용자가 모든 데이터에 접근 가능**하도록 설정되어 있습니다.  
**테스트/개발 용도로만 사용**하고, 프로덕션 배포 전에 반드시 아래 스크립트를 실행하여 정책을 교체하세요.

### 프로덕션용 보안 정책

`supabase/migrations/0002_production_rls.sql` 파일을 참고하거나, 아래 내용을 SQL Editor에서 실행하세요:

```sql
-- 테스트용 정책 삭제
drop policy if exists "테스트용_users_모두허용" on public.users;
drop policy if exists "테스트용_cases_모두허용" on public.cases;
drop policy if exists "테스트용_case_tokens_모두허용" on public.case_tokens;
drop policy if exists "테스트용_care_logs_모두허용" on public.care_logs;
drop policy if exists "테스트용_payments_모두허용" on public.payments;

-- Users: 본인 정보만 조회/수정
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Cases: 보호자만 자신의 케이스 관리
create policy "Guardians view own cases" on public.cases
  for select using (auth.uid() = guardian_id);
create policy "Guardians insert own cases" on public.cases
  for insert with check (auth.uid() = guardian_id);
create policy "Guardians update own cases" on public.cases
  for update using (auth.uid() = guardian_id);

-- Case Tokens: 보호자만 자신의 케이스 토큰 조회
create policy "Guardians view own tokens" on public.case_tokens
  for select using (
    exists (
      select 1 from public.cases 
      where cases.id = case_tokens.case_id 
      and cases.guardian_id = auth.uid()
    )
  );

-- Care Logs: 해당 케이스의 보호자만 조회
create policy "Guardians view case logs" on public.care_logs
  for select using (
    exists (
      select 1 from public.cases 
      where cases.id = care_logs.case_id 
      and cases.guardian_id = auth.uid()
    )
  );

-- Payments: 보호자만 자신의 케이스 지급 정보 관리
create policy "Guardians manage payments" on public.payments
  for all using (
    exists (
      select 1 from public.cases 
      where cases.id = payments.case_id 
      and cases.guardian_id = auth.uid()
    )
  );
```

---

## 🔍 트러블슈팅

### 에러: "type case_status already exists"
이미 테이블이 생성된 상태입니다. 아래 명령어로 초기화 후 재실행하세요:
```sql
drop table if exists public.payments cascade;
drop table if exists public.care_logs cascade;
drop table if exists public.case_tokens cascade;
drop table if exists public.cases cascade;
drop table if exists public.users cascade;
drop type if exists case_status;
```

### 에러: "relation auth.users does not exist"
Supabase Auth가 활성화되지 않았습니다. 대시보드에서 Authentication 섹션을 확인하세요.

---

## 📁 마이그레이션 파일 목록

- `0001_init_database.sql` - 초기 데이터베이스 스키마 생성 (테스트용 RLS 포함)
- `0002_production_rls.sql` - (추후 생성) 프로덕션용 보안 정책

---

## 📚 참고 자료

- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL 데이터 타입](https://www.postgresql.org/docs/current/datatype.html)

