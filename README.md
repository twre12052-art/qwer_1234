# 간병노트 (Care Service) - 1차 MVP

가족·지인 간병 시 보험 청구용 서류(계약서, 일지, 지급확인서)를 자동으로 생성해주는 웹 서비스입니다.

## 🎯 프로젝트 목표

복잡한 서류 작업을 자동화하여 간병인과 보호자의 부담을 줄이고, 보험 청구에 필요한 표준 서류를 쉽게 생성할 수 있도록 돕습니다.

## ✨ 주요 기능 (1차 MVP 완료)

### M1: 보호자 기능
- ✅ 이메일/비밀번호 로그인 및 회원가입
- ✅ 간병 케이스 생성 (환자정보, 간병인정보, 기간, 비용)
- ✅ 케이스 목록 조회 및 상세 보기
- ✅ 계약 동의 (보호자)
- ✅ 간병인 초대 링크 생성 및 공유

### M2: 간병인 기능
- ✅ 초대 링크를 통한 접근 (별도 회원가입 없음)
- ✅ 계약 내용 확인 및 동의
- ✅ 매일 간병일지 작성
- ✅ 작성한 일지 조회

### M3: 기간 관리
- ✅ 조기 종료 (보호자)
- ✅ 기간 연장 (보호자)

### M4: 결제 및 PDF 생성
- ✅ 간병비 지급 정보 입력
- ✅ PDF 서류 자동 생성 (한글 지원)
  - 간병 계약서
  - 간병일지 요약
  - 간병비 지급 확인서

## 🛠 기술 스택

- **Frontend/Backend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security)
- **PDF Generation**: @react-pdf/renderer v4
- **Testing**: Playwright (E2E)

## 📦 설치 및 실행

### 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 데이터베이스 마이그레이션

Supabase 대시보드에서 SQL Editor를 열고 `supabase/migrations/0001_init_database.sql` 파일 내용을 실행합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── login/              # 로그인/회원가입
│   ├── cases/              # 보호자용 케이스 관리
│   ├── caregiver/          # 간병인용 페이지 (토큰 접속)
│   └── api/pdf/            # PDF 생성 API
├── modules/                # 비즈니스 로직 (도메인별)
│   ├── auth/               # 인증
│   ├── case/               # 케이스 관리
│   ├── careLog/            # 간병일지
│   ├── payment/            # 결제 정보
│   ├── pdf/                # PDF 생성
│   └── shared/             # 공통 (Supabase 클라이언트, 타입)
└── middleware.ts           # 인증 미들웨어

public/fonts/               # 한글 폰트 파일 (나눔고딕)
e2e/                        # E2E 테스트 (Playwright)
supabase/migrations/        # DB 마이그레이션 SQL
```

## 🧪 테스트

E2E 테스트 실행:

```bash
npm run test:e2e
```

## 🔐 주요 보안 기능

- Supabase Row Level Security (RLS) 적용
- 보호자: 이메일/비밀번호 인증
- 간병인: 고유 토큰 기반 접근 제어
- 케이스별 권한 분리 (본인 데이터만 접근)

## 📝 개발 가이드

자세한 개발 규칙 및 아키텍처는 `docs/core/agents.md`를 참조하세요.

## 🚀 다음 단계 (2차 개발)

1차 MVP가 완료되었습니다. 2차 개발 계획은 별도 문서로 진행됩니다.

## 📄 라이선스

Private Project

## 👥 기여자

- AI Agent (Development)
- Product Owner (MY)

