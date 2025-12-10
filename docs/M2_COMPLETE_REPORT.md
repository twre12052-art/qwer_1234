# ✅ M2 완료 보고서 (보호자 플로우 MVP)

## 📌 요약

**Milestone**: M2 – 보호자 플로우 MVP  
**완료일**: 2025-12-07  
**상태**: ✅ 완료

---

## 🎯 달성한 목표

### WP2.1 - 내 케이스 목록
- ✅ 로그인한 보호자가 자신의 케이스만 조회 가능
- ✅ 케이스가 없을 때 안내 메시지 표시
- ✅ 카드형 UI로 케이스 목록 표시
- ✅ RLS 정책으로 보안 강화 (본인 케이스만 접근)

### WP2.2 - 케이스 생성 폼
- ✅ 환자 정보, 병원명, 기간, 간병비 입력
- ✅ 날짜 유효성 검증:
  - 시작일 ≥ 오늘
  - 종료일 ≥ 시작일
- ✅ 서버 + 클라이언트 이중 검증
- ✅ 생성 후 목록 페이지로 리다이렉트

### WP2.3 - 케이스 상세 화면
- ✅ 케이스 기본 정보 표시
- ✅ Timeline으로 진행 단계 시각화
- ✅ 상태별 액션 버튼:
  - 계약 동의
  - 간병인 링크 생성
  - 기간 연장/조기 종료
  - 서류 생성
  - **케이스 삭제** (신규)
- ✅ 다른 사용자 케이스 접근 차단

### WP2.4 - 카카오 알림톡 템플릿 준비
- ✅ 템플릿 3종 문구 작성:
  1. 간병 시작 안내
  2. 간병인 링크 안내
  3. 간병 종료 및 서류 발급 안내
- ✅ 가이드 문서 작성 (`docs/kakao_alimtalk_templates.md`)
- 📝 **사용자 직접 작업 필요**: Solapi 콘솔에서 검수 신청

### WP2.5 - 보호자 케이스 삭제 (신규)
- ✅ Confirm 모달 구현 (실수 방지)
- ✅ 삭제 Server Action (`deleteCase`)
- ✅ 소유권 검증 (본인 케이스만 삭제 가능)
- ✅ CASCADE 삭제 (연관 데이터 자동 삭제):
  - `case_tokens`
  - `care_logs`
  - `payments`
- ✅ 삭제 후 목록으로 리다이렉트

---

## 📁 구현한 파일

### 신규 파일
```
src/app/cases/[id]/delete-case-button.tsx    # 삭제 버튼 + Confirm 모달
docs/kakao_alimtalk_templates.md            # 카카오 템플릿 가이드
docs/M2_COMPLETE_REPORT.md                   # 이 문서
```

### 수정 파일
```
src/modules/case/actions.ts                 # deleteCase 액션 추가
src/app/cases/[id]/page.tsx                 # 삭제 버튼 추가
```

---

## 🧪 테스트 시나리오

### ✅ Scenario 1: 케이스 생성 및 조회
1. 보호자 로그인
2. "새 간병 등록" 버튼 클릭
3. 정보 입력 후 저장
4. 목록에서 생성된 케이스 확인 ✅

### ✅ Scenario 2: 날짜 유효성 검증
1. 과거 시작일 입력 → 에러 메시지 ✅
2. 종료일 < 시작일 → 에러 메시지 ✅
3. 유효한 날짜 → 정상 생성 ✅

### ✅ Scenario 3: 보안 (다른 사용자 케이스 차단)
1. A 계정: 케이스 생성
2. B 계정: A의 케이스 ID로 직접 접근 시도
3. "권한이 없습니다" 메시지 표시 ✅

### ✅ Scenario 4: 케이스 삭제
1. 케이스 상세 페이지에서 [케이스 삭제] 클릭
2. Confirm 모달 표시
3. [취소] 클릭 → 삭제되지 않음 ✅
4. 다시 [케이스 삭제] 클릭
5. [정말 삭제하기] 클릭
6. 케이스 + 연관 데이터 모두 삭제 ✅
7. 목록 페이지로 리다이렉트 ✅

---

## 🔒 보안 강화 사항

### 1. RLS (Row Level Security) 정책
```sql
-- cases 테이블: 본인 케이스만 접근
CREATE POLICY "Guardians can view their own cases" 
  ON public.cases
  FOR SELECT
  USING (auth.uid() = guardian_id);

CREATE POLICY "Guardians can delete their own cases" 
  ON public.cases
  FOR DELETE
  USING (auth.uid() = guardian_id);
```

### 2. Server Action 레벨 검증
- `getCase()`: guardian_id 필터링
- `deleteCase()`: 소유권 2중 확인
  1. 케이스 조회 시 소유자 확인
  2. DELETE 쿼리에도 `guardian_id = user.id` 조건 추가

### 3. 무한 재귀 문제 해결
- ❌ Before: `users` 테이블 조회 → RLS 정책 → 무한 재귀
- ✅ After: `auth.getUser().user.id` 직접 사용

### 4. 간병인 기능 RLS 우회
- 간병인은 인증되지 않은 토큰 접근
- `adminSupabase` (Service Role Key) 사용으로 RLS 우회
- 토큰 검증 후에만 데이터 접근 허용

---

## 📊 데이터베이스 구조

### cases 테이블
```sql
id uuid PRIMARY KEY
guardian_id uuid REFERENCES users(id)  -- 보호자 ID
patient_name text                      -- 환자명
hospital_name text                     -- 병원명
start_date date                        -- 시작일
end_date_expected date                 -- 종료 예정일
end_date_final date                    -- 실제 종료일
daily_wage integer                     -- 일당
caregiver_name text                    -- 간병인명
caregiver_contact text                 -- 간병인 연락처
status case_status                     -- 상태
created_at timestamptz
updated_at timestamptz
```

### CASCADE 관계
```
cases (parent)
├── case_tokens (ON DELETE CASCADE)
├── care_logs (ON DELETE CASCADE)
└── payments (ON DELETE CASCADE)
```

---

## 🐛 해결한 주요 이슈

### Issue 1: 중복 import로 인한 빌드 에러
**문제**: `redirect`가 2번 import되어 빌드 실패  
**해결**: 중복 import 제거

### Issue 2: 로그아웃 시 404 에러
**문제**: `/auth/phone` 페이지 삭제 후 로그아웃 시 404  
**해결**: `logout()` 함수의 `redirectTo`를 `/login`으로 변경

### Issue 3: 다른 사용자 케이스 노출 (보안 취약)
**문제**: `getCases()`가 모든 케이스 조회  
**해결**: `guardian_id` 필터링 + RLS 정책 강화

### Issue 4: 무한 재귀 에러
**문제**: `users` 테이블 조회 시 RLS 정책과 충돌  
**해결**: `auth.getUser().user.id` 직접 사용

### Issue 5: 간병인 기능 차단
**문제**: RLS 강화 후 간병인 기능 작동 안 함  
**해결**: 
- 간병인 관련 작업에 `adminSupabase` 사용
- `getCareLogsByToken`, `getCareLogByToken` 함수 추가

---

## 📝 남은 작업 (다음 단계)

### M3 단계로 이월
- [ ] 간병인 휴대폰 인증 강화 (보호자 번호 뒤 4자리 2차 검증)
- [ ] 간병일지 작성 UI 개선
- [ ] 모바일 UX 테스트 및 개선

### M5 단계 준비
- [ ] Solapi 콘솔에서 카카오 템플릿 검수 신청
- [ ] 템플릿 승인 후 환경 변수 설정
- [ ] PDF 생성 로직 한글 폰트 테스트

---

## 🎓 교훈 및 개선사항

### 1. 보안은 계층적으로
- **DB RLS**: 최종 방어선
- **Server Action**: 비즈니스 로직 검증
- **UI**: 사용자 편의성

### 2. 인증된 사용자 vs 비인증 접근 구분
- 보호자: RLS + Server Action 검증
- 간병인: 토큰 검증 + adminSupabase

### 3. 코드 수정 시 전체 흐름 테스트 필수
- 한 부분 수정 시 다른 기능이 깨질 수 있음
- 각 수정 후 주요 흐름 테스트 필요

### 4. Confirm UI는 사용자 보호
- 삭제 등 위험한 작업은 반드시 Confirm
- 에러 메시지는 명확하고 친절하게

---

## ✅ 완료 체크리스트

### 기능
- [x] 케이스 목록 조회
- [x] 케이스 생성 (날짜 검증 포함)
- [x] 케이스 상세 조회
- [x] 케이스 삭제 (Confirm 포함)
- [x] 다른 사용자 케이스 접근 차단

### 보안
- [x] RLS 정책 설정
- [x] guardian_id 필터링
- [x] 소유권 검증
- [x] CASCADE 삭제 설정

### 문서
- [x] 카카오 템플릿 가이드 작성
- [x] M2 완료 보고서 작성

### 테스트
- [x] 케이스 CRUD 테스트
- [x] 보안 테스트 (다른 사용자 차단)
- [x] 삭제 기능 테스트 (Confirm + CASCADE)
- [x] 전체 보호자 플로우 테스트

---

## 📞 다음 단계

**M3 – 간병인 링크 & 일지 플로우**
- 간병인 토큰 기반 접근
- 휴대폰 문자 인증
- 간병일지 작성
- 모바일 UX 최적화

**시작 전 확인사항**:
1. M2 테스트 완료 확인
2. Solapi 카카오 템플릿 검수 상태 확인
3. 데이터베이스 백업

---

**작성자**: AI Assistant  
**검토자**: -  
**승인일**: 2025-12-07  
**다음 단계**: M3 시작

