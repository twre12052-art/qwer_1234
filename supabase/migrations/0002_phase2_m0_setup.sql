-- ================================================
-- M0 2차: 프로젝트 기준선 & 환경 준비
-- ================================================
-- 실행 위치: Supabase Dashboard → SQL Editor
-- 작성일: 2024-12
-- 목적: 
--   1. Timezone 설정 (Asia/Seoul)
--   2. pg_cron 확장 활성화 확인
--   3. 디버그용 RPC 함수 생성

-- ================================================
-- 1. Timezone 설정
-- ================================================
-- 데이터베이스 전체의 기본 Timezone을 한국 시간(KST)으로 설정
ALTER DATABASE postgres SET timezone TO 'Asia/Seoul';

-- 현재 세션의 Timezone도 변경 (즉시 적용)
SET timezone TO 'Asia/Seoul';

-- 확인: 아래 쿼리 결과가 'Asia/Seoul'이어야 함
-- SHOW timezone;

-- ================================================
-- 2. pg_cron 확장 활성화 (수동 작업 필요)
-- ================================================
-- 주의: pg_cron은 SQL로 직접 활성화할 수 없습니다.
-- 아래 단계를 따라 수동으로 활성화하세요:
-- 
-- 1) Supabase Dashboard 접속
-- 2) Database 메뉴 클릭
-- 3) Extensions 탭 선택
-- 4) 검색창에 "pg_cron" 입력
-- 5) "pg_cron" 찾아서 Enable 버튼 클릭
--
-- 활성화 확인:
-- SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- ================================================
-- 3. 디버그용 RPC 함수 생성
-- ================================================

-- 3-1. 현재 시간 조회 함수
CREATE OR REPLACE FUNCTION debug_get_now()
RETURNS timestamptz 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT now();
$$;

-- 함수 사용 예시:
-- SELECT debug_get_now();

-- 3-2. Timezone 설정 조회 함수
CREATE OR REPLACE FUNCTION debug_show_timezone()
RETURNS text 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT current_setting('timezone');
$$;

-- 함수 사용 예시:
-- SELECT debug_show_timezone();

-- 3-3. pg_cron 확장 활성화 여부 확인 함수
CREATE OR REPLACE FUNCTION debug_check_pg_cron()
RETURNS boolean 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  );
$$;

-- 함수 사용 예시:
-- SELECT debug_check_pg_cron();

-- ================================================
-- 4. 권한 설정
-- ================================================
-- 디버그 함수들은 모든 인증된 사용자가 호출 가능하도록 설정
GRANT EXECUTE ON FUNCTION debug_get_now() TO authenticated;
GRANT EXECUTE ON FUNCTION debug_show_timezone() TO authenticated;
GRANT EXECUTE ON FUNCTION debug_check_pg_cron() TO authenticated;

-- anon 역할에도 권한 부여 (개발/테스트 용도)
GRANT EXECUTE ON FUNCTION debug_get_now() TO anon;
GRANT EXECUTE ON FUNCTION debug_show_timezone() TO anon;
GRANT EXECUTE ON FUNCTION debug_check_pg_cron() TO anon;

-- ================================================
-- 5. 검증 쿼리
-- ================================================
-- 아래 쿼리들을 실행하여 설정이 올바른지 확인하세요

-- Timezone 확인 (결과: Asia/Seoul)
SELECT current_setting('timezone') as current_timezone;

-- 현재 시간 확인 (KST 시간이 출력되어야 함)
SELECT 
  now() as db_current_time,
  now() AT TIME ZONE 'Asia/Seoul' as kst_time;

-- pg_cron 확장 확인 (결과: true)
SELECT debug_check_pg_cron() as pg_cron_enabled;

-- 디버그 함수 테스트
SELECT 
  debug_get_now() as current_time,
  debug_show_timezone() as timezone,
  debug_check_pg_cron() as pg_cron_status;

-- ================================================
-- 마이그레이션 완료
-- ================================================
-- ✅ 이 스크립트 실행 후:
--    1. /debug/db 페이지에서 모든 항목이 정상 표시되어야 함
--    2. Timezone = Asia/Seoul
--    3. pg_cron = 활성화됨
-- ================================================

