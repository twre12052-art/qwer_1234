-- ============================================
-- 첨부파일 RLS 정책 수정 (재귀 문제 해결)
-- ============================================
-- 문제: attachments RLS 정책이 cases를 참조하고,
--       cases RLS 정책이 users를 참조하면서 재귀 발생
-- 해결: RLS 정책을 단순화하여 직접 guardian_id 확인

-- 기존 정책 삭제
DROP POLICY IF EXISTS "보호자는 자신의 케이스 첨부파일 조회 가능" ON public.attachments;
DROP POLICY IF EXISTS "보호자는 자신의 케이스 첨부파일 생성 가능" ON public.attachments;
DROP POLICY IF EXISTS "보호자는 자신의 케이스 첨부파일 삭제 가능" ON public.attachments;

-- 새로운 정책: cases 테이블을 직접 참조하지 않고 guardian_id를 직접 확인
-- 하지만 attachments 테이블에는 guardian_id가 없으므로...
-- 대신 cases 테이블 조회를 최소화하는 방식으로 변경

-- 방법 1: SECURITY DEFINER 함수 사용 (권장)
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

-- 방법 2: 단순화된 정책 (cases 조회 최소화)
-- RLS 정책에서 cases 조회는 불가피하지만, 
-- SECURITY DEFINER 함수를 사용하면 재귀 방지 가능

-- 조회 정책
CREATE POLICY "보호자는 자신의 케이스 첨부파일 조회 가능"
  ON public.attachments
  FOR SELECT
  USING (check_case_guardian(case_id));

-- 생성 정책
CREATE POLICY "보호자는 자신의 케이스 첨부파일 생성 가능"
  ON public.attachments
  FOR INSERT
  WITH CHECK (check_case_guardian(case_id));

-- 삭제 정책
CREATE POLICY "보호자는 자신의 케이스 첨부파일 삭제 가능"
  ON public.attachments
  FOR DELETE
  USING (check_case_guardian(case_id));

