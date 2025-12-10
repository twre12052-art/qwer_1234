-- ================================================
-- M5: notification_logs 테이블 생성
-- ================================================
-- 목적: 이메일/카카오 알림 발송 이력 기록
-- 작성일: 2025-12-07
-- ================================================

-- ================================================
-- 1. notification_logs 테이블 생성
-- ================================================
CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 관련 케이스
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  
  -- 수신자 정보
  recipient text NOT NULL,
  
  -- 채널 (email_submit, kakao_alert, sms_otp)
  channel text NOT NULL,
  
  -- 발송 내용 또는 템플릿 코드
  content text,
  
  -- 상태 (success, failed, pending)
  status text NOT NULL,
  
  -- 에러 정보 (실패 시)
  error_message text,
  
  -- 추가 정보 (JSON)
  meta jsonb DEFAULT '{}'::jsonb,
  
  -- 발송 시간
  created_at timestamptz DEFAULT NOW() NOT NULL
);

-- ================================================
-- 2. 인덱스 생성
-- ================================================
CREATE INDEX IF NOT EXISTS idx_notification_logs_case_id ON notification_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_channel ON notification_logs(channel);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);

-- ================================================
-- 3. RLS 정책
-- ================================================
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Admin은 모든 알림 로그 조회 가능
DROP POLICY IF EXISTS "Admin can view all notification logs" ON notification_logs;
CREATE POLICY "Admin can view all notification logs" ON notification_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 보호자는 자신의 케이스 알림 로그만 조회 가능
DROP POLICY IF EXISTS "Guardians can view own case notifications" ON notification_logs;
CREATE POLICY "Guardians can view own case notifications" ON notification_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = notification_logs.case_id
      AND cases.guardian_id = auth.uid()
    )
  );

-- ================================================
-- 4. 완료 확인
-- ================================================
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'notification_logs'
ORDER BY ordinal_position;

