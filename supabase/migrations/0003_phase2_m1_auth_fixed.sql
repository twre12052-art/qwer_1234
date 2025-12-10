-- ================================================
-- M1 2차: 계정/인증/유저 기본 레이어 (수정본)
-- ================================================
-- 실행 위치: Supabase Dashboard → SQL Editor
-- 작성일: 2024-12-06
-- 목적:
--   1. 기존 users 테이블에 phone 인증 관련 컬럼 추가
--   2. phone_otps 테이블 생성 (인증번호 관리)
--   3. rate_limits 테이블 생성
--   4. RLS 정책 업데이트
-- ================================================

-- ================================================
-- 1. users 테이블 컬럼 추가 (기존 테이블 수정)
-- ================================================

-- 1-1. phone 관련 컬럼 추가
DO $$ 
BEGIN
  -- phone 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone text UNIQUE;
  END IF;

  -- phone_verified_at 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone_verified_at'
  ) THEN
    ALTER TABLE users ADD COLUMN phone_verified_at timestamptz;
  END IF;

  -- auth_email 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'auth_email'
  ) THEN
    ALTER TABLE users ADD COLUMN auth_email text UNIQUE;
  END IF;

  -- role 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role text DEFAULT 'guardian' NOT NULL
      CHECK (role IN ('guardian', 'admin'));
  END IF;

  -- birth_date 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'birth_date'
  ) THEN
    ALTER TABLE users ADD COLUMN birth_date date;
  END IF;

  -- contact_email 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE users ADD COLUMN contact_email text;
  END IF;

  -- name 컬럼 추가 (full_name과 별도)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'name'
  ) THEN
    ALTER TABLE users ADD COLUMN name text;
  END IF;
END $$;

-- 1-2. 기존 full_name 데이터를 name으로 복사
UPDATE users SET name = full_name WHERE name IS NULL;

-- 1-3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_auth_email ON users(auth_email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 1-4. updated_at 자동 갱신 트리거 (이미 있을 수 있음)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 재생성 (이미 있으면 교체)
DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 2. phone_otps 테이블 생성 (인증번호 관리)
-- ================================================
CREATE TABLE IF NOT EXISTS phone_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 전화번호 (휴대폰 번호)
  phone text NOT NULL,
  
  -- 인증번호 해시 (SHA-256)
  code_hash text NOT NULL,
  
  -- 만료 시간 (기본 5분)
  expires_at timestamptz NOT NULL,
  
  -- 시도 횟수 (무차별 대입 공격 방지)
  attempt_count int DEFAULT 0 NOT NULL,
  
  -- 사용 여부
  used boolean DEFAULT false NOT NULL,
  
  -- 생성 시간
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_phone_otps_phone ON phone_otps(phone);
CREATE INDEX IF NOT EXISTS idx_phone_otps_expires_at ON phone_otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_phone_otps_used ON phone_otps(used);

-- ================================================
-- 3. rate_limits 테이블 (문자 발송 제한)
-- ================================================
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 제한 대상 (phone 번호)
  identifier text NOT NULL,
  
  -- 제한 타입 (sms_send: 문자 발송)
  limit_type text NOT NULL
    CHECK (limit_type IN ('sms_send', 'api_call')),
  
  -- 시도 횟수
  attempt_count int DEFAULT 1 NOT NULL,
  
  -- 마지막 시도 시간
  last_attempt_at timestamptz DEFAULT now() NOT NULL,
  
  -- 첫 시도 시간 (하루 제한 계산용)
  first_attempt_at timestamptz DEFAULT now() NOT NULL,
  
  -- 생성 시간
  created_at timestamptz DEFAULT now() NOT NULL,
  
  -- 복합 UNIQUE (identifier + limit_type)
  UNIQUE(identifier, limit_type)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, limit_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_last_attempt ON rate_limits(last_attempt_at);

-- ================================================
-- 4. RLS (Row Level Security) 정책 업데이트
-- ================================================

-- users 테이블 RLS는 이미 활성화되어 있을 것임
-- 기존 정책 삭제 후 재생성

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- 새 정책 생성
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- phone_otps 테이블 RLS 활성화
ALTER TABLE phone_otps ENABLE ROW LEVEL SECURITY;

-- 정책: 인증 로직은 서버에서만 처리 (Service Role Key 사용)
DROP POLICY IF EXISTS "Only service role can access phone_otps" ON phone_otps;
CREATE POLICY "Only service role can access phone_otps"
  ON phone_otps FOR ALL
  USING (false);

-- rate_limits 테이블 RLS 활성화
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- 정책: RateLimit도 서버에서만 처리
DROP POLICY IF EXISTS "Only service role can access rate_limits" ON rate_limits;
CREATE POLICY "Only service role can access rate_limits"
  ON rate_limits FOR ALL
  USING (false);

-- ================================================
-- 5. 헬퍼 함수 생성
-- ================================================

-- 5-1. 현재 사용자의 role 조회 함수
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role
  FROM users
  WHERE id = auth.uid();
$$;

-- 5-2. 현재 사용자가 admin인지 확인
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- 5-3. OTP 정리 함수 (만료된 OTP 삭제)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM phone_otps
  WHERE expires_at < now() - interval '1 day'
  OR (used = true AND created_at < now() - interval '1 hour');
$$;

-- 5-4. RateLimit 초기화 함수 (하루가 지난 기록 삭제)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM rate_limits
  WHERE last_attempt_at < now() - interval '1 day';
$$;

-- ================================================
-- 6. 검증 쿼리
-- ================================================

-- 테이블 존재 확인
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('users', 'phone_otps', 'rate_limits') THEN '✅'
    ELSE '❌'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'phone_otps', 'rate_limits')
ORDER BY table_name;

-- users 테이블 컬럼 확인
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('phone', 'auth_email', 'role', 'name', 'birth_date', 'contact_email', 'phone_verified_at')
ORDER BY column_name;

-- RLS 활성화 확인
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ 활성화' ELSE '❌ 비활성화' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'phone_otps', 'rate_limits')
ORDER BY tablename;

-- 헬퍼 함수 확인
SELECT 
  proname as function_name,
  CASE WHEN proname IN ('get_current_user_role', 'is_admin', 'cleanup_expired_otps', 'cleanup_old_rate_limits') 
    THEN '✅' 
    ELSE '❌' 
  END as status
FROM pg_proc
WHERE proname IN ('get_current_user_role', 'is_admin', 'cleanup_expired_otps', 'cleanup_old_rate_limits')
ORDER BY proname;

-- ================================================
-- 마이그레이션 완료 메시지
-- ================================================
DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ M1 2차 마이그레이션 완료!';
  RAISE NOTICE '================================================';
  RAISE NOTICE '생성된 항목:';
  RAISE NOTICE '  - users 테이블: phone 관련 컬럼 추가 ✅';
  RAISE NOTICE '  - phone_otps 테이블: 신규 생성 ✅';
  RAISE NOTICE '  - rate_limits 테이블: 신규 생성 ✅';
  RAISE NOTICE '  - RLS 정책: 업데이트 완료 ✅';
  RAISE NOTICE '  - 헬퍼 함수 4개: 생성 완료 ✅';
  RAISE NOTICE '';
  RAISE NOTICE '다음 단계:';
  RAISE NOTICE '  1. 위 검증 쿼리 결과 확인';
  RAISE NOTICE '  2. npm run dev 실행';
  RAISE NOTICE '  3. http://localhost:3000/auth/phone 접속';
  RAISE NOTICE '================================================';
END $$;

