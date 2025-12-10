-- ================================================
-- M4: activity_logs 테이블 생성
-- ================================================
-- 목적: 운영자의 모든 케이스 관리 활동 기록
-- 작성일: 2025-12-07
-- ================================================

-- ================================================
-- 1. activity_logs 테이블 생성
-- ================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 작업을 수행한 사용자 (운영자 또는 시스템)
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  
  -- 대상 케이스
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  
  -- 작업 유형 (CHANGE_PERIOD, FORCE_END, DELETE_CASE 등)
  action text NOT NULL,
  
  -- 추가 정보 (JSON 형식)
  -- 예: {"before": "2025-12-10", "after": "2025-12-15", "reason": "보호자 요청"}
  meta jsonb DEFAULT '{}'::jsonb,
  
  -- 생성 시간
  created_at timestamptz DEFAULT NOW() NOT NULL
);

-- ================================================
-- 2. 인덱스 생성
-- ================================================
CREATE INDEX IF NOT EXISTS idx_activity_logs_case_id ON activity_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ================================================
-- 3. RLS 정책
-- ================================================
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Admin은 모든 로그 조회 가능
DROP POLICY IF EXISTS "Admin can view all activity logs" ON activity_logs;
CREATE POLICY "Admin can view all activity logs" ON activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admin은 모든 로그 생성 가능
DROP POLICY IF EXISTS "Admin can insert activity logs" ON activity_logs;
CREATE POLICY "Admin can insert activity logs" ON activity_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 보호자는 자신의 케이스 로그만 조회 가능
DROP POLICY IF EXISTS "Guardians can view own case logs" ON activity_logs;
CREATE POLICY "Guardians can view own case logs" ON activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = activity_logs.case_id
      AND cases.guardian_id = auth.uid()
    )
  );

-- ================================================
-- 4. 헬퍼 함수: 활동 로그 기록
-- ================================================
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id uuid,
  p_case_id uuid,
  p_action text,
  p_meta jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO activity_logs (user_id, case_id, action, meta)
  VALUES (p_user_id, p_case_id, p_action, p_meta)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- ================================================
-- 5. 완료 확인
-- ================================================
-- 테이블이 제대로 생성되었는지 확인
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'activity_logs'
ORDER BY ordinal_position;

-- RLS 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'activity_logs';

