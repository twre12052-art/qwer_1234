-- ============================================
-- users 테이블 RLS 재귀 문제 완전 해결
-- ============================================
-- 문제: "Admins can view all users" 정책이 users를 다시 참조하여 재귀 발생
-- 해결: SECURITY DEFINER 함수 사용하여 재귀 방지

-- 1. 기존 문제 정책 삭제
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- 2. SECURITY DEFINER 함수로 Admin 확인 (재귀 방지)
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- 3. 새로운 Admin 정책 (함수 사용으로 재귀 방지)
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (is_current_user_admin());

-- 4. attachments RLS 정책도 SECURITY DEFINER 함수 사용
-- (이미 0010에서 만들었지만, 다시 확인)

-- check_case_guardian 함수가 제대로 작동하는지 확인
CREATE OR REPLACE FUNCTION check_case_guardian(case_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cases
    WHERE id = case_id_param
    AND guardian_id = auth.uid()
  );
$$;

-- attachments 정책 재생성 (확실하게)
DROP POLICY IF EXISTS "보호자는 자신의 케이스 첨부파일 조회 가능" ON public.attachments;
DROP POLICY IF EXISTS "보호자는 자신의 케이스 첨부파일 생성 가능" ON public.attachments;
DROP POLICY IF EXISTS "보호자는 자신의 케이스 첨부파일 삭제 가능" ON public.attachments;

CREATE POLICY "보호자는 자신의 케이스 첨부파일 조회 가능"
  ON public.attachments
  FOR SELECT
  USING (check_case_guardian(case_id));

CREATE POLICY "보호자는 자신의 케이스 첨부파일 생성 가능"
  ON public.attachments
  FOR INSERT
  WITH CHECK (check_case_guardian(case_id));

CREATE POLICY "보호자는 자신의 케이스 첨부파일 삭제 가능"
  ON public.attachments
  FOR DELETE
  USING (check_case_guardian(case_id));

