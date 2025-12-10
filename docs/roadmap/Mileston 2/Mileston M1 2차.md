# M1 – 계정/인증/유저 기본 레이어

## 🎯 목표
- 휴대폰 문자 인증으로 가입/로그인이 가능하고,
- `users` + `role` 기반 권한 구조를 만든다.
- 문자 인증에 **최소 RateLimit**을 적용한다.

---

## ✅ WP1.1 – 휴대폰 문자 인증 로그인/회원가입 “해피 패스” (+ RateLimit)

**목표**  
“휴대폰 번호 + 문자 6자리 코드”로  
가입/로그인 후 `/cases`까지 진입 가능한 상태.

**작업 내용**
- DB 테이블:
  - `users`  
    - `id`, `auth_email`, `name`, `birth_date`, `contact_email`,  
      `phone`, `phone_verified_at`, `role`, `created_at`, `updated_at`
  - `phone_otps`  
    - `phone`, `code_hash`, `expires_at`, `created_at`, `attempt_count` 등
- `/auth/phone` 화면:
  - 전화번호 입력 → [인증번호 받기]
  - 인증번호 입력 → [인증 확인]
- 서버 로직:
  - 6자리 코드 생성 → `phone_otps` 저장(해시+만료).
  - **RateLimit 적용(중요)**:
    - 동일 번호에 대해:
      - 1분에 1회 이상 요청 시 거부.
      - 하루 10회 이상 요청 시 거부.
  - 개발 모드:
    - 실제 Solapi 발송 대신 콘솔 로그 또는 테스트 번호 1개만 발송.
  - 운영 모드:
    - Solapi로 실제 SMS 발송.
  - 인증 성공 시:
    - `전화번호@care.local` 형식으로 Supabase Auth 유저 생성/로그인.
    - `users` 테이블에 기본 정보/role 저장.
  - 성공 후 `/cases`로 이동.

**완료 & 테스트**
- 실제 번호로 인증 → `/cases`까지 진입 확인.
- 잘못된/만료 코드 → 인증 실패 메시지.
- 같은 번호로 연속 요청 시 RateLimit이 걸리는지 확인.

---

## ✅ WP1.2 – 프로필(/profile) 조회/수정

**목표**  
로그인한 사용자가 자신의 기본 정보를 보고 수정할 수 있는 상태.

**작업 내용**
- `/profile` 페이지:
  - 이름, 생년월일, 이메일, 전화번호 표시.
  - 이름/생년월일/이메일 수정 가능.
  - 전화번호는 인증과 연결된 값 → 읽기 전용.
- 서버:
  - `auth.uid()` 기준 `users` 레코드 조회/업데이트.

**완료 & 테스트**
- `/profile`에서 내 정보 조회/수정 가능.
- 다른 계정에서 내 정보가 보이지 않는지 확인.

---

## ✅ WP1.3 – role 구조 & /admin 접근 제한

**목표**  
운영자(Admin)와 일반 보호자를 명확히 구분.

**작업 내용**
- `users.role` 컬럼 (`guardian`, `admin`) 유지/활용.
- Supabase 콘솔에서 내 계정 `role='admin'` 설정.
- `/admin` 라우트:
  - 서버에서 `role === 'admin'` 확인.
  - 아니면 403/에러 페이지.
  - 맞으면 “Admin Home” 출력.

**완료 & 테스트**
- 일반 계정: `/admin` 차단 확인.
- admin 계정: `/admin` 진입 확인.
