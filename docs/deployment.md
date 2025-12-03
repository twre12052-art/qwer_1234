# 프로덕션 배포 가이드 및 체크리스트 (M4)

본 문서는 Vercel 및 Supabase를 사용하여 서비스를 프로덕션 환경에 배포하기 위한 절차와 점검 사항을 기술합니다.

## 1. 배포 전 체크리스트 (Pre-deployment)

- [ ] **환경 변수 분리**: `.env.local` (개발용)과 배포 환경 변수가 구분되어 있는가?
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] **DB 스키마 동기화**: 로컬/개발 DB의 스키마 변경 사항이 프로덕션 DB에 모두 반영되었는가?
  - `users`, `cases`, `care_logs`, `payments`, `case_tokens` 테이블
  - RLS 정책 적용 여부
- [ ] **Lint & Build 테스트**: 로컬에서 `npm run build`가 에러 없이 완료되는가?
- [ ] **개인정보 처리방침**: `/privacy` 페이지가 정상적으로 접근 가능한가?

## 2. Supabase 프로덕션 설정

1. **새 프로젝트 생성**: Supabase 대시보드에서 프로덕션용 프로젝트(예: `care-service-prod`)를 생성합니다.
2. **스키마 적용**: SQL Editor를 통해 `supabase/schema.sql`의 내용을 실행합니다.
3. **Auth 설정**: 
   - Site URL 및 Redirect URL 설정 (Vercel 배포 도메인 추가)
   - 이메일 템플릿 등 필요한 Auth 설정 확인
4. **API Key 확인**: Project Settings > API에서 URL과 ANON_KEY를 확보합니다.

## 3. Vercel 배포 설정

1. **프로젝트 연결**: Vercel 대시보드에서 GitHub 저장소를 연결하여 새 프로젝트를 생성합니다.
2. **환경 변수 등록**: Settings > Environment Variables에 Supabase 프로덕션 키를 등록합니다.
   - `NEXT_PUBLIC_SUPABASE_URL`: [Prod URL]
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: [Prod Anon Key]
3. **배포 트리거**: `main` 브랜치에 푸시하여 배포를 시작합니다.

## 4. 배포 후 검증 (Post-deployment QA)

### 4.1 기본 헬스 체크
- [ ] 메인 페이지 접속 확인
- [ ] `/login` 페이지 진입 확인
- [ ] `/privacy` 페이지 진입 확인

### 4.2 핵심 시나리오 테스트 (Smoke Test)
1. **회원가입/로그인**: 테스트 계정으로 가입 및 로그인이 정상 동작하는가?
2. **케이스 생성**: `/cases/new`에서 케이스 생성이 되고 목록에 표시되는가?
3. **계약 동의**: 상세 페이지에서 계약 동의 후 상태가 변경되는가?
4. **간병인 링크**: 생성된 링크(`window.location.origin` 기반)가 프로덕션 도메인으로 올바르게 생성되는가?
5. **간병인 접속**: 시크릿 탭에서 링크 접속 시 동의 화면이 뜨는가?
6. **PDF 생성**: 모든 절차 완료 후 PDF 다운로드가 정상적으로 실행되는가? (한글 폰트 깨짐 확인)

## 5. 트러블슈팅

- **PDF 한글 깨짐**: Vercel 환경에서 폰트 로딩 이슈가 있을 수 있음. `src/modules/pdf/font.ts`의 CDN URL이 접근 가능한지 확인.
- **로그인 리다이렉트 오류**: Supabase Auth 설정의 Redirect URL에 Vercel 도메인이 누락되었는지 확인.
- **API 오류 (500)**: Vercel Logs를 확인하여 서버 액션에서 발생하는 구체적인 에러 메시지 확인.

