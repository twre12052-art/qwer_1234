-- ============================================
-- Storage RLS 정책 설정 (간단하고 확실한 버전)
-- ============================================
-- 이 SQL은 Storage Policies를 설정합니다.
-- ⚠️ 중요: Storage bucket이 먼저 생성되어 있어야 합니다!

-- ============================================
-- 1. 기존 정책 삭제
-- ============================================
DROP POLICY IF EXISTS "보호자는 자신의 케이스 파일 업로드 가능" ON storage.objects;
DROP POLICY IF EXISTS "보호자는 자신의 케이스 파일 조회 가능" ON storage.objects;
DROP POLICY IF EXISTS "보호자는 자신의 케이스 파일 삭제 가능" ON storage.objects;

-- ============================================
-- 2. Storage 정책 생성 (간단한 버전)
-- ============================================

-- 정책 1: INSERT (업로드)
-- 파일 경로가 {case_id}/{filename} 형식이어야 함
CREATE POLICY "보호자는 자신의 케이스 파일 업로드 가능"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'attachments'
  AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text 
      FROM public.cases 
      WHERE guardian_id = auth.uid()
    )
  )
);

-- 정책 2: SELECT (조회/다운로드)
CREATE POLICY "보호자는 자신의 케이스 파일 조회 가능"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'attachments'
  AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text 
      FROM public.cases 
      WHERE guardian_id = auth.uid()
    )
  )
);

-- 정책 3: DELETE (삭제)
CREATE POLICY "보호자는 자신의 케이스 파일 삭제 가능"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'attachments'
  AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text 
      FROM public.cases 
      WHERE guardian_id = auth.uid()
    )
  )
);

-- ============================================
-- 3. 정책 확인
-- ============================================
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  CASE 
    WHEN cmd = 'INSERT' THEN '업로드'
    WHEN cmd = 'SELECT' THEN '조회'
    WHEN cmd = 'DELETE' THEN '삭제'
  END as 설명
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%보호자는%'
ORDER BY cmd;

