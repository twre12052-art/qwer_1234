-- ================================================
-- 간병일지 서명 기능 추가
-- ================================================
-- 목적: care_logs 테이블에 서명 데이터 저장 컬럼 추가
-- 작성일: 2025-01-XX
-- ================================================

-- care_logs 테이블에 signature_data 컬럼 추가 (Base64 인코딩된 이미지 데이터)
ALTER TABLE public.care_logs
ADD COLUMN IF NOT EXISTS signature_data TEXT;

-- 컬럼 추가 확인
COMMENT ON COLUMN public.care_logs.signature_data IS '간병인 서명 이미지 (Base64 인코딩된 PNG 데이터)';

