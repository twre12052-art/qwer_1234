# M0 – 프로젝트 기준선 & 환경 준비

## 🎯 목표
- 실제 Vercel URL에서 “간병노트 베이스 프로젝트”가 보이는 상태.
- Supabase(시간대/pg_cron), 환경 변수, 마이그레이션 구조 기초 세팅.

---

## ✅ WP0.1 – Vercel에 “Hello 간병노트” 띄우기

**목표**  
브라우저에서 배포된 URL로 접속했을 때  
“간병노트 베이스 프로젝트” 문구가 표시되는 상태.

**작업 내용**
- Next.js 프로젝트를 Vercel과 연결.
- 루트 페이지(`/`)에 간단한 문구 출력:
  - 예: `간병노트 베이스 프로젝트`
- GitHub → Vercel 자동 배포 파이프라인 확인.

**완료 & 테스트**
- 배포 URL 접속 → 문구 정상 표시.
- 코드 수정 후 `git push` → Vercel 자동 재배포 확인.

---

## ✅ WP0.2 – Supabase 연결 + Timezone/pg_cron + 마이그레이션 기초

**목표**  
앱이 Supabase와 정상 연결되고,  
Timezone/KST, 스케줄러, 마이그레이션 구조 기초를 잡는 것.

**작업 내용**
- Supabase URL / Anon Key를 `.env`에 설정, 클라이언트 초기화.
- `/debug/db` 페이지에서:
  - `select now()` 결과를 화면에 출력.
- Supabase SQL Editor에서 실행:
  - `ALTER DATABASE postgres SET timezone TO 'Asia/Seoul';`
- Supabase → Database → Extensions에서 `pg_cron` 활성화.
- **마이그레이션 전략(초기)**:
  - 가능하면 Supabase CLI 도입 후  
    `supabase/migrations/` 폴더로 스키마 변경을 SQL 파일로 관리.
  - 최소한 “모든 SQL을 파일에 남겨두기”부터 시작.

**완료 & 테스트**
- `/debug/db` 페이지에서 DB 연결 OK + 한국 시간 출력.
- Supabase 콘솔에서 Timezone = `Asia/Seoul`, `pg_cron` = enabled 확인.
- 앞으로 사용하는 CREATE/ALTER SQL이 어디에 기록되는지 기준이 잡혀 있음.

---

## ✅ WP0.3 – 환경 변수/비밀키 관리 안정화

**목표**  
API 키가 Git에 새지 않고, 환경 변수 체계가 정리된 상태.

**작업 내용**
- `.gitignore`에 `.env`, `.env.local` 등 확실히 포함.
- `.env.example` 작성:
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_KEY` (서버용)
  - `SOLAPI_API_KEY`
  - `GMAIL_USER`, `GMAIL_PASS`
  - `KAKAO_TEMPLATE_ID_*` (추후)
- 실제 값은:
  - 로컬 `.env` + Vercel Environment Variables에만 입력.
- 원칙 문서화:
  - Service Role Key는 **Route Handler/Server Action** 등 서버 코드에서만 사용.

**완료 & 테스트**
- GitHub에 올라간 코드에서 실제 키가 없는지 확인.
- 로컬 `.env` 변경 후 서버 재실행 → 값 반영 확인.
