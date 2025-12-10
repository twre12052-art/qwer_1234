# 🛠️ M4 운영자 대시보드 - 설정 및 테스트 가이드

## 📋 M4 구현 완료 내용

### ✅ 구현된 기능
1. **DB 스키마**: `activity_logs` 테이블
2. **Admin Actions**: 전체 케이스 조회, 기간 수정, 강제 종료, 삭제
3. **Admin 페이지**: 
   - `/admin/cases`: 전체 케이스 목록 + 통계
   - `/admin/cases/[id]`: 상세 + 활동 로그
4. **권한 검증**: middleware + server actions
5. **활동 로그**: 모든 변경 사항 자동 기록

---

## 🔧 Step 1: DB 설정 (필수!)

### Supabase SQL Editor에서 실행:

```sql
-- 1단계: 테스트 계정 정리 (선택적)
DELETE FROM cases;
DELETE FROM users;
DELETE FROM phone_otps WHERE used = true;

-- 2단계: activity_logs 테이블 생성 (필수!)
```

파일: `supabase/migrations/0006_m4_activity_logs.sql` 전체 내용 복사 붙여넣기

---

## 👤 Step 2: Admin 계정 생성

### 방법 1: 회원가입 후 SQL로 Admin 승격 (권장)

#### A. 회원가입
```
http://localhost:3000/signup

아이디: admin001
비밀번호: admin1234
이름: 관리자
생년월일: 900101-1
전화: 010-9999-9999
```

#### B. Supabase SQL로 Admin 승격
```sql
-- 방금 가입한 계정을 admin으로 승격
UPDATE users 
SET role = 'admin' 
WHERE name = 'admin001';

-- 확인
SELECT name, role FROM users WHERE name = 'admin001';
```

---

### 방법 2: 기존 계정 승격

```sql
-- 특정 사용자를 admin으로 승격
UPDATE users 
SET role = 'admin' 
WHERE name = 'user001';
```

---

## 🧪 Step 3: Admin 기능 테스트

### Test 1: Admin 로그인 및 접근

#### Step 1.1: Admin 로그인
```
1. 로그아웃
2. /login 접속
3. Admin 계정으로 로그인 (admin001)
```

#### Step 1.2: Admin 페이지 접근
```
1. 주소창에 입력: http://localhost:3000/admin/cases
2. 엔터
```

**✅ 예상 결과**:
```
→ 운영자 대시보드 표시
→ "🛠️ 운영자 대시보드" 제목
→ 통계 카드 4개 (전체/진행중/완료/취소)
→ 전체 케이스 테이블
```

---

### Test 2: 권한 검증

#### Step 2.1: 일반 사용자 차단
```
1. 로그아웃
2. 일반 계정(user001) 로그인
3. http://localhost:3000/admin/cases 접속 시도
```

**✅ 예상 결과**:
```
→ /cases 페이지로 자동 리다이렉트 ✅
→ Admin 페이지 접근 불가 ✅
```

---

### Test 3: 기간 수정 (과거 포함 가능!)

#### 사전 준비: 테스트 케이스 생성
```
1. 일반 계정(user001) 로그인
2. 케이스 생성:
   - 환자: 테스트환자
   - 시작일: 2025-12-10
   - 종료일: 2025-12-20
3. 로그아웃
```

#### Step 3.1: Admin으로 기간 수정
```
1. Admin 계정 로그인
2. /admin/cases 접속
3. 방금 생성한 케이스 [관리] 클릭
4. "기간 수정" 카드에서 [기간 수정하기] 클릭
5. 수정:
   - 시작일: 2025-12-01 (과거 날짜!)
   - 종료일: 2025-12-25
   - 사유: "보호자 요청으로 기간 조정"
6. [저장] 클릭
```

**✅ 예상 결과**:
```
→ "기간이 수정되었습니다" alert
→ 페이지 새로고침
→ 수정된 기간 표시
→ 활동 로그에 "기간 수정" 기록 추가 ✅
```

---

### Test 4: 강제 종료

#### Step 4.1: 진행 중인 케이스 강제 종료
```
1. /admin/cases에서 IN_PROGRESS 케이스 선택
2. "강제 종료" 카드에서 [강제 종료] 클릭
3. 사유 입력:
   "환자 퇴원으로 인한 조기 종료"
4. [종료 확정] 클릭
```

**✅ 예상 결과**:
```
→ "케이스가 강제 종료되었습니다" alert
→ 상태: "취소됨"으로 변경
→ 활동 로그에 "강제 종료" 기록 추가 ✅
→ 사유 포함됨 ✅
```

---

### Test 5: 케이스 삭제

#### Step 5.1: Confirm - 취소
```
1. /admin/cases/[id]
2. "위험 구역" → [케이스 완전 삭제] 클릭
3. 모달 표시
4. [취소] 클릭
```

**✅ 예상 결과**:
```
→ 모달 닫힘
→ 케이스 유지됨 ✅
```

#### Step 5.2: Confirm - 삭제
```
1. [케이스 완전 삭제] 클릭
2. 사유 입력: "중복 등록으로 인한 삭제"
3. [정말 삭제하기] 클릭
```

**✅ 예상 결과**:
```
→ "케이스가 삭제되었습니다" alert
→ /admin/cases 목록으로 이동
→ 삭제된 케이스 사라짐 ✅
```

---

### Test 6: 활동 로그 확인

#### Step 6.1: 로그 기록 확인
```
1. 기간 수정, 강제 종료 등 작업 수행
2. /admin/cases/[id] 접속
3. "활동 로그" 섹션 확인
```

**✅ 예상 결과**:
```
→ 모든 변경 이력 표시 ✅
→ 시간순 정렬
→ 작업자 이름 표시
→ meta 정보 (before/after, reason) 표시 ✅
```

---

## 📊 테스트 체크리스트

### 권한:
- [ ] Admin 계정: /admin 접근 가능
- [ ] 일반 계정: /admin 접근 차단
- [ ] 미인증: /admin 접근 시 로그인 페이지

### Admin 기능:
- [ ] 전체 케이스 목록 조회
- [ ] 통계 카드 (전체/진행중/완료/취소)
- [ ] 케이스 상세 조회
- [ ] 기간 수정 (과거 날짜 포함)
- [ ] 강제 종료 (사유 필수)
- [ ] 케이스 삭제 (Confirm + 사유)
- [ ] 활동 로그 조회

### 데이터:
- [ ] activity_logs 테이블 생성됨
- [ ] 기간 수정 시 로그 기록
- [ ] 강제 종료 시 로그 기록
- [ ] 삭제 시 로그 기록 (삭제 전)

---

## 🚨 문제 해결

### 문제 1: "relation activity_logs does not exist"
```
원인: SQL 마이그레이션 미실행
해결: 0006_m4_activity_logs.sql 실행
```

### 문제 2: "/admin 접근 시 무한 리다이렉트"
```
원인: role이 'admin'이 아님
해결: SQL로 role 업데이트
UPDATE users SET role = 'admin' WHERE name = 'admin001';
```

### 문제 3: "권한이 없습니다"
```
원인: middleware에서 차단
확인: users 테이블에서 role 확인
SELECT name, role FROM users;
```

---

## ✅ 완료 기준

모든 테스트가 통과하면 M4 완료:
- [ ] Admin 계정 생성 및 로그인 성공
- [ ] /admin/cases 전체 목록 표시
- [ ] 기간 수정 기능 작동 (과거 포함)
- [ ] 강제 종료 기능 작동
- [ ] 케이스 삭제 기능 작동
- [ ] 활동 로그 정상 기록
- [ ] 일반 사용자 /admin 접근 차단

---

## 🎯 다음 단계

M4 완료 후:
1. ✅ M4 완료 보고서 작성
2. 🔄 Git commit & push
3. 🚀 M5 (PDF/이메일/카카오 연동) 시작

---

**작성일**: 2025-12-07  
**버전**: 1.0  
**단계**: M4 구현 완료

