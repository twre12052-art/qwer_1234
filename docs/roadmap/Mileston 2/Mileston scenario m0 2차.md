# M0 – 프로젝트 기준선 & 환경 준비 시나리오

## WP0.1 – Vercel에 “Hello 간병노트” 띄우기

### Scenario WP0.1-1: 첫 배포 성공
- Given:  
  - GitHub 저장소가 준비되어 있고, Vercel 프로젝트에 연결되어 있다.
- When:  
  - main 브랜치에 코드를 push 한다.  
  - 루트 페이지(`/`)에 “간병노트 베이스 프로젝트” 문구를 렌더링하도록 구현한다.
- Then:  
  - Vercel이 빌드/배포를 성공하고, 배포 URL 접속 시 해당 문구가 화면에 표시된다.
- 선행 Scenario: 없음  
- 테스트/검증:  
  - Vercel Dashboard에서 배포 상태가 “Ready”인지 확인.  
  - 브라우저에서 배포 URL 접속 → 문구 확인.

---

### Scenario WP0.1-2: 빌드 실패 케이스 확인
- Given:  
  - 프로젝트에 빌드 에러(예: import 경로 오타)가 있는 상태.
- When:  
  - main 브랜치에 문제 있는 코드를 push 한다.
- Then:  
  - Vercel 배포가 “Failed” 상태가 되며, 빌드 로그에서 에러 메시지를 확인할 수 있다.
- 선행 Scenario: WP0.1-1  
- 테스트/검증:  
  - Vercel Dashboard → 빌드 로그에서 에러 내용 확인.  
  - 배포 URL 접속 시 이전 정상 버전 또는 에러 페이지인 것 확인.

---

## WP0.2 – Supabase 연결 + Timezone/pg_cron

### Scenario WP0.2-1: Supabase DB 연결 성공
- Given:  
  - `.env`에 `SUPABASE_URL`, `SUPABASE_ANON_KEY`가 올바르게 설정되어 있다.
- When:  
  - `/debug/db` 페이지에 접속해 DB에 `select now()`를 호출한다.
- Then:  
  - 에러 없이 현재 시간이 화면에 표시된다.
- 선행 Scenario: WP0.1-1  
- 테스트/검증:  
  - 브라우저에서 `/debug/db` 접속 → 콘솔/화면에서 DB 응답 확인.

---

### Scenario WP0.2-2: Timezone이 Asia/Seoul로 설정됨
- Given:  
  - Supabase SQL Editor에서 `ALTER DATABASE postgres SET timezone TO 'Asia/Seoul';`가 실행된 상태.
- When:  
  - DB에서 `select now();`를 실행한다.
- Then:  
  - 반환된 시간이 KST(한국 시간) 기준으로 표시된다.
- 선행 Scenario: WP0.2-1  
- 테스트/검증:  
  - `show timezone;` 실행 → `Asia/Seoul` 확인.  
  - `select now();` 결과가 실제 한국 시각과 일치하는지 확인.

---

### Scenario WP0.2-3: pg_cron 확장 사용 가능
- Given:  
  - Supabase Dashboard → Extensions에서 `pg_cron`을 Enable 한 상태.
- When:  
  - `select * from cron.job;`를 실행한다.
- Then:  
  - `cron.job` 테이블에 접근이 가능하고, 에러가 발생하지 않는다.
- 선행 Scenario: WP0.2-1  
- 테스트/검증:  
  - Supabase SQL Editor에서 `select * from cron.job;` 실행, 결과 조회.

---

## WP0.3 – 환경 변수/비밀키 관리

### Scenario WP0.3-1: .env가 Git에 포함되지 않음
- Given:  
  - `.gitignore`에 `.env`, `.env.local` 이 등록되어 있다.
- When:  
  - `.env` 파일을 생성한 후 `git status`를 확인한다.
- Then:  
  - `.env` 파일이 Untracked/Changed 목록에 나타나지 않는다.
- 선행 Scenario: 없음  
- 테스트/검증:  
  - 터미널에서 `git status` 실행 → `.env` 미노출 확인.

---

### Scenario WP0.3-2: 환경 변수 값이 애플리케이션에서 정상 사용됨
- Given:  
  - `.env.local`에 유효한 `SUPABASE_URL` 값이 설정되어 있다.
- When:  
  - 앱을 로컬에서 실행하고, Supabase 클라이언트를 사용하는 페이지를 호출한다.
- Then:  
  - 런타임 에러 없이, DB 요청이 정상 처리된다.
- 선행 Scenario: WP0.2-1  
- 테스트/검증:  
  - 로컬에서 `npm run dev` 실행 후, `/debug/db` 페이지 접속 → 정상 응답 확인.
