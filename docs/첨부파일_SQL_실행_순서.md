# 📎 첨부파일 기능 SQL 실행 순서

## ✅ 필수 SQL 실행 순서

### 1️⃣ attachments 테이블 생성
```
파일: supabase/migrations/0009_attachments_table.sql
→ Supabase Dashboard → SQL Editor → 실행
```

### 2️⃣ RLS 재귀 문제 해결
```
파일: supabase/migrations/0011_fix_users_rls_recursion.sql
→ Supabase Dashboard → SQL Editor → 실행
```

### 3️⃣ Storage Policies 설정
```
파일: supabase/migrations/0012_storage_policies_fixed.sql
→ Supabase Dashboard → SQL Editor → 실행
→ 마지막 SELECT 쿼리 결과 확인 (3개 정책 생성 확인)
```

---

## 🔧 Storage Bucket 생성 (Dashboard)

```
1. Supabase Dashboard → Storage
2. [New bucket] 클릭
3. 설정:
   - Name: attachments
   - Public bucket: ✓ (체크!)
4. [Create bucket] 클릭
```

---

## 🧪 검증 방법

### SQL 실행 후 확인

1. **attachments 테이블 확인**
```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'attachments';
```

2. **RLS 함수 확인**
```sql
SELECT proname FROM pg_proc 
WHERE proname IN ('check_case_guardian', 'is_current_user_admin');
```

3. **Storage Policies 확인**
```sql
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%보호자는%';
```
→ 3개 정책이 나와야 함 (INSERT, SELECT, DELETE)

4. **Storage Bucket 확인**
```sql
SELECT name, id, public 
FROM storage.buckets 
WHERE name = 'attachments';
```

---

## ✅ 완료 체크리스트

- [ ] 0009_attachments_table.sql 실행 완료
- [ ] 0011_fix_users_rls_recursion.sql 실행 완료
- [ ] 0012_storage_policies_fixed.sql 실행 완료
- [ ] Storage Bucket 생성 완료 (attachments, Public: ✓)
- [ ] 검증 쿼리 실행 → 모든 항목 확인
- [ ] 파일 업로드 테스트 성공

---

**작성일**: 2025-12-08

