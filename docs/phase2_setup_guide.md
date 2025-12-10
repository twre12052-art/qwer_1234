# 🚀 2차 개발 환경 설정 가이드 (M0)

> **목표**: Vercel 배포 확인 + Supabase Timezone/pg_cron 설정 + 환경 변수 관리

---

## 📋 체크리스트

완료한 항목에 체크하세요:

- [ ] 1. `.env.local` 파일 생성 및 설정
- [ ] 2. Supabase SQL 스크립트 실행
- [ ] 3. pg_cron 확장 활성화
- [ ] 4. `/debug/db` 페이지에서 모든 항목 확인
- [ ] 5. Vercel 배포 확인 (선택)

---

## 🔧 1. 환경 변수 설정

### 1-1. `.env.local` 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 내용을 입력하세요:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

# SMS/Kakao (M1 이후 설정)
SOLAPI_API_KEY=
SOLAPI_API_SECRET=
SOLAPI_SENDER_PHONE=

# Email (M5에서 설정)
GMAIL_USER=
GMAIL_APP_PASSWORD=

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**중요**: 
- `SUPABASE_SERVICE_KEY`는 Supabase Dashboard → Settings → API에서 확인 가능
- 현재는 M0 단계이므로 Supabase 키만 설정하면 됩니다

---

## 🗄️ 2. Supabase 데이터베이스 설정

### 2-1. SQL 스크립트 실행

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 `SQL Editor` 클릭
   - 또는 `Database` → `SQL Editor`

3. **스크립트 실행**
   - `supabase/migrations/0002_phase2_m0_setup.sql` 파일 내용을 복사
   - SQL Editor에 붙여넣기
   - 우측 하단 `Run` 버튼 클릭

### 2-2. pg_cron 확장 활성화

SQL로는 활성화할 수 없으므로 아래 단계를 따라주세요:

1. Supabase Dashboard에서 `Database` 메뉴 클릭
2. `Extensions` 탭 선택
3. 검색창에 "pg_cron" 입력
4. **pg_cron** 찾아서 `Enable` 버튼 클릭
5. 활성화 완료까지 약 10초 소요

### 2-3. 설정 확인

SQL Editor에서 아래 쿼리를 실행하여 확인:

```sql
-- 1. Timezone 확인 (결과: Asia/Seoul)
SELECT current_setting('timezone');

-- 2. pg_cron 활성화 확인 (결과: true)
SELECT EXISTS (
  SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
);

-- 3. 현재 시간 확인 (KST 시간이어야 함)
SELECT now();
```

---

## 🧪 3. 로컬 개발 서버 테스트

### 3-1. 서버 실행

```bash
npm run dev
```

### 3-2. /debug/db 페이지 접속

브라우저에서 아래 URL 접속:
```
http://localhost:3000/debug/db
```

**확인 사항**:
- ✅ 연결 성공 메시지
- ✅ 현재 시간이 한국 시간으로 표시됨
- ✅ Timezone: `Asia/Seoul`
- ✅ pg_cron: `활성화됨`

**문제가 있다면**:
1. `.env.local` 파일의 Supabase URL/Key 재확인
2. 서버 재시작 (`Ctrl+C` 후 `npm run dev`)
3. Supabase SQL 스크립트가 정상 실행되었는지 확인

---

## 🌐 4. Vercel 배포 (선택)

이미 1차 MVP가 배포되어 있다면 이 단계는 건너뛰어도 됩니다.

### 4-1. Vercel 환경 변수 설정

1. Vercel Dashboard → 프로젝트 선택
2. `Settings` → `Environment Variables`
3. 아래 변수들을 추가:

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | (Supabase URL) | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (Anon Key) | Production, Preview |
| `SUPABASE_SERVICE_KEY` | (Service Key) | Production, Preview |

4. `Save` 클릭

### 4-2. 배포 확인

```bash
git add .
git commit -m "feat: M0 2차 - 환경 설정 완료"
git push origin main
```

Vercel이 자동으로 배포를 시작합니다.
배포 URL에서 `/debug/db` 페이지가 정상 작동하는지 확인하세요.

---

## ✅ M0 완료 기준

아래 항목이 모두 충족되면 M0 완료:

### 필수 (Must Have)
- [x] `.env.local` 파일 존재 및 Supabase 키 설정
- [x] `.env.example` 파일 존재 (Git에 커밋됨)
- [x] Supabase Timezone = `Asia/Seoul`
- [x] Supabase pg_cron 확장 활성화
- [x] `/debug/db` 페이지에서 모든 항목 ✅ 표시

### 선택 (Nice to Have)
- [ ] Vercel 배포 완료
- [ ] Solapi 계정 생성 (M1 준비)
- [ ] Gmail 앱 비밀번호 생성 (M5 준비)

---

## 🐛 문제 해결 (Troubleshooting)

### 문제 1: "연결 실패" 에러

**원인**: Supabase URL/Key가 잘못되었거나 `.env.local`이 로드되지 않음

**해결**:
1. `.env.local` 파일이 프로젝트 **루트**에 있는지 확인
2. 파일 내용에 오타가 없는지 확인
3. 서버 재시작 필수

### 문제 2: Timezone이 "UTC"로 표시됨

**원인**: SQL 스크립트가 실행되지 않았거나 데이터베이스 재시작 필요

**해결**:
1. Supabase SQL Editor에서 아래 명령 다시 실행:
   ```sql
   ALTER DATABASE postgres SET timezone TO 'Asia/Seoul';
   ```
2. Supabase Dashboard → Settings → Database → `Restart database`
3. 약 1-2분 후 다시 확인

### 문제 3: pg_cron이 "비활성화됨"으로 표시

**원인**: Extensions에서 수동 활성화를 하지 않음

**해결**:
1. Supabase Dashboard → Database → Extensions
2. "pg_cron" 검색 후 Enable
3. 페이지 새로고침

### 문제 4: RPC 함수 호출 에러

**원인**: SQL 스크립트의 함수 생성 부분이 실행되지 않음

**해결**:
1. `supabase/migrations/0002_phase2_m0_setup.sql` 파일 전체를 다시 실행
2. SQL Editor에서 에러 메시지 확인
3. 각 함수를 개별적으로 실행해보기

---

## 📚 다음 단계

M0 완료 후:
- **M1**: 휴대폰 문자 인증 시스템 구현
- Solapi 계정 준비 필요

---

## 💡 참고 자료

- [Supabase Timezone 설정](https://supabase.com/docs/guides/database/timezone)
- [pg_cron 확장](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [Next.js 환경 변수](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

**작성일**: 2024-12  
**대상**: 2차 개발 M0 단계

