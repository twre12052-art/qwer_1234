# 🔐 로그인 문제 해결 가이드

## 🐛 증상

```
✅ 회원가입: 성공
❌ 로그인: 실패
에러: "아이디 또는 비밀번호가 올바르지 않습니다"
```

---

## 🔍 원인

### 개발 과정에서 발생한 비밀번호 불일치

초기 개발 시 `verifyOtpOnly` 함수에 랜덤 비밀번호 생성 로직이 있었습니다:

```typescript
// 문제가 있던 코드 (이미 수정됨)
const userPassword = Math.random().toString(36).slice(-12);
await adminSupabase.auth.admin.updateUserById(user.id, {
  password: userPassword, // ← 기존 계정 비밀번호 변경!
});
```

**결과**:
1. 계정 A 생성 (비밀번호: password1234)
2. 계정 B 가입 시도
   - verifyOtpOnly 실행
   - **계정 A의 비밀번호가 랜덤으로 변경됨** 😱
3. 계정 A 로그인 실패 (비밀번호 불일치)

---

## ✅ 해결 방법

### 방법 1: Supabase에서 테스트 계정 삭제 후 재가입 (권장!)

#### Step 1: Supabase Dashboard 접속
```
https://supabase.com/dashboard
→ 프로젝트 선택
```

#### Step 2: Authentication → Users
```
1. Users 메뉴 클릭
2. 테스트 계정 선택 (testuser@care.local 등)
3. 우측 점 3개 클릭 → Delete User
4. 확인
```

#### Step 3: Table Editor → users 테이블
```
1. Table Editor → users 테이블
2. 같은 사용자 찾기
3. 행 선택 → Delete
```

#### Step 4: 새로 가입
```
이제 코드가 수정되었으므로:
1. 새 계정 가입
2. 로그인 정상 작동! ✅
```

---

### 방법 2: SQL로 일괄 정리 (빠름!)

#### Supabase SQL Editor에서 실행:

**옵션 A: 모든 테스트 계정 삭제**
```sql
-- 모든 케이스 삭제 (CASCADE)
DELETE FROM cases;

-- 모든 users 삭제
DELETE FROM users;

-- OTP 정리
DELETE FROM phone_otps WHERE used = true;
DELETE FROM phone_otps WHERE expires_at < NOW();
```

**옵션 B: 특정 계정만 삭제**
```sql
-- testuser111 삭제
DELETE FROM cases WHERE guardian_id IN (
  SELECT id FROM users WHERE name = 'testuser111'
);
DELETE FROM users WHERE name = 'testuser111';

-- testuser222 삭제
DELETE FROM cases WHERE guardian_id IN (
  SELECT id FROM users WHERE name = 'testuser222'
);
DELETE FROM users WHERE name = 'testuser222';
```

---

### 방법 3: 기존 계정 무시하고 새 계정으로 테스트

```
1. 기존 계정 (user001, user002 등) 무시
2. 새 아이디로 가입:
   - cleanuser1
   - cleanuser2
   - cleanuser3
3. 새 계정들은 정상 작동! ✅
```

---

## 🧪 로그인 테스트

### 정상 작동 확인:

```
1. 새 계정 가입:
   - 아이디: freshtest1
   - 비밀번호: test1234
   - 전화: 010-9999-9999

2. 회원가입 완료
   → alert: "회원가입이 완료되었습니다!"
   → 로그인 페이지로 이동

3. 로그인:
   - 아이디: freshtest1
   - 비밀번호: test1234
   → 성공! ✅
```

---

## 📊 계정 제한

```
Q: 아이디가 몇 개까지 만들어지나요?

A: 무제한입니다! ✅
   - 원하는 만큼 계정 생성 가능
   - 테스트 목적으로 100개도 가능
```

단, **아이디 중복은 체크**합니다:
```
✅ user001, user002, user003... (가능)
❌ user001, user001 (불가능 - 중복)
```

---

## 🔒 현재 중복 체크 정책

| 항목 | 중복 체크 | 이유 |
|------|-----------|------|
| **아이디** | ✅ 체크 | 로그인 식별자 |
| **전화번호** | ❌ 체크 안 함 | 테스트 편의성 |
| **이메일** | ❌ 체크 안 함 | 선택 항목 |

---

## 💡 코드 수정 완료 사항

### ✅ 수정된 것:
```typescript
// verifyOtpOnly - 단순화됨
export async function verifyOtpOnly(phone, code) {
  // OTP 검증만 수행
  // 비밀번호 변경 없음! ✅
  return { otpId };
}
```

### ✅ 앞으로 생성되는 계정:
```
모두 정상 작동! ✅
- 비밀번호 변경 없음
- 로그인 정상
```

---

## 🚀 권장 해결 방법

**가장 빠른 방법**:

```sql
-- Supabase SQL Editor에서 실행
DELETE FROM cases;
DELETE FROM users;
```

그 다음:
```
1. Ctrl + Shift + R (새로고침)
2. 새 계정 2-3개 가입
3. 각 계정으로 로그인 테스트
4. 모두 성공! ✅
```

---

**작성일**: 2025-12-07  
**상태**: 로그인 문제 원인 파악 완료

