-- ================================================
-- 보안 수정: RLS 정책 강화
-- ================================================
-- 목적: 테스트용 정책 제거 및 보안 정책으로 교체
-- 실행: Supabase Dashboard → SQL Editor
-- ================================================

-- ================================================
-- 1. 기존 테스트용 정책 제거
-- ================================================

-- Users 테이블
DROP POLICY IF EXISTS "테스트용_users_모두허용" ON public.users;

-- Cases 테이블
DROP POLICY IF EXISTS "테스트용_cases_모두허용" ON public.cases;

-- Case Tokens 테이블
DROP POLICY IF EXISTS "테스트용_case_tokens_모두허용" ON public.case_tokens;

-- Care Logs 테이블
DROP POLICY IF EXISTS "테스트용_care_logs_모두허용" ON public.care_logs;

-- Payments 테이블
DROP POLICY IF EXISTS "테스트용_payments_모두허용" ON public.payments;

-- ================================================
-- 2. 보안 정책 생성 (본인의 데이터만 접근)
-- ================================================

-- ============================================
-- Users 테이블: 본인 프로필만 조회/수정
-- ============================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- Cases 테이블: 보호자는 자신의 케이스만
-- ============================================
DROP POLICY IF EXISTS "Guardians can view their own cases" ON public.cases;
CREATE POLICY "Guardians can view their own cases" ON public.cases
  FOR SELECT
  USING (auth.uid() = guardian_id);

DROP POLICY IF EXISTS "Guardians can insert their own cases" ON public.cases;
CREATE POLICY "Guardians can insert their own cases" ON public.cases
  FOR INSERT
  WITH CHECK (auth.uid() = guardian_id);

DROP POLICY IF EXISTS "Guardians can update their own cases" ON public.cases;
CREATE POLICY "Guardians can update their own cases" ON public.cases
  FOR UPDATE
  USING (auth.uid() = guardian_id);

DROP POLICY IF EXISTS "Guardians can delete their own cases" ON public.cases;
CREATE POLICY "Guardians can delete their own cases" ON public.cases
  FOR DELETE
  USING (auth.uid() = guardian_id);

-- ============================================
-- Case Tokens: 본인 케이스의 토큰만 조회
-- ============================================
DROP POLICY IF EXISTS "Guardians view own tokens" ON public.case_tokens;
CREATE POLICY "Guardians view own tokens" ON public.case_tokens
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = case_tokens.case_id
      AND cases.guardian_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Guardians insert own tokens" ON public.case_tokens;
CREATE POLICY "Guardians insert own tokens" ON public.case_tokens
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = case_tokens.case_id
      AND cases.guardian_id = auth.uid()
    )
  );

-- ============================================
-- Care Logs: 본인 케이스의 일지만 접근
-- ============================================
DROP POLICY IF EXISTS "Guardians view case logs" ON public.care_logs;
CREATE POLICY "Guardians view case logs" ON public.care_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = care_logs.case_id
      AND cases.guardian_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Guardians manage case logs" ON public.care_logs;
CREATE POLICY "Guardians manage case logs" ON public.care_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = care_logs.case_id
      AND cases.guardian_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = care_logs.case_id
      AND cases.guardian_id = auth.uid()
    )
  );

-- ============================================
-- Payments: 본인 케이스의 지급 정보만 접근
-- ============================================
DROP POLICY IF EXISTS "Guardians manage payments" ON public.payments;
CREATE POLICY "Guardians manage payments" ON public.payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = payments.case_id
      AND cases.guardian_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = payments.case_id
      AND cases.guardian_id = auth.uid()
    )
  );

-- ================================================
-- 3. RLS 활성화 확인
-- ================================================

-- 이미 활성화되어 있지만, 다시 한번 확인
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 완료!
-- ================================================
-- 이제 각 사용자는 본인의 데이터만 볼 수 있습니다.
-- ================================================

