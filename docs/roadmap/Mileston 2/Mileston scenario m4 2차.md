# M4 – 운영자(Admin) 대시보드 & 운영 도구 시나리오

## WP4.1 – /admin/cases 전체 케이스 목록

### Scenario WP4.1-1: Admin의 전체 케이스 목록 조회 성공
- Given:  
  - 여러 보호자의 케이스가 존재하고, `role='admin'` 계정으로 로그인한 상태.
- When:  
  - `/admin/cases`에 접속한다.
- Then:  
  - 모든 케이스가 테이블 형태로 표시되고, 보호자/환자/병원/상태 정보가 보여진다.
- 선행 Scenario: WP1.3-2, WP2.2-1  
- 테스트/검증:  
  - UI 목록과 DB `cases` row 수 비교.

---

### Scenario WP4.1-2: guardian 계정의 /admin/cases 접근 실패
- Given:  
  - `role='guardian'` 계정으로 로그인한 상태.
- When:  
  - `/admin/cases`에 접속한다.
- Then:  
  - 권한 에러 또는 로그인 페이지/에러 페이지로 이동한다.
- 선행 Scenario: WP1.3-1  
- 테스트/검증:  
  - 브라우저에서 확인.

---

## WP4.2 – /admin/cases/[id] 상세 + 로그

### Scenario WP4.2-1: Admin의 케이스 상세 + 활동 로그 조회 성공
- Given:  
  - 특정 케이스에 대해 활동 로그(`activity_logs`)가 존재한다.
- When:  
  - `/admin/cases/[id]` 페이지에 접속한다.
- Then:  
  - 케이스 상세 정보와 함께 로그 탭에 시간순 활동 이력이 표시된다.
- 선행 Scenario: WP4.1-1, WP4.3-1/2  
- 테스트/검증:  
  - UI 로그 리스트와 DB `activity_logs` 내용 일치 확인.

---

## WP4.3 – 기간 수정·강제 종료

### Scenario WP4.3-1: Admin이 케이스 기간 수정 성공
- Given:  
  - 진행 중인 케이스가 있고, Admin이 `/admin/cases/[id]`에 접속해 있다.
- When:  
  - [기간 수정]을 눌러 시작일/종료일을 새 값으로 변경 후 저장한다.
- Then:  
  - `cases`의 날짜 필드가 변경되고, `activity_logs`에 `CHANGE_PERIOD` 액션이 기록된다.
- 선행 Scenario: WP4.2-1  
- 테스트/검증:  
  - UI/DB에서 변경된 날짜 확인.  
  - `activity_logs` 조회.

---

### Scenario WP4.3-2: Admin이 강제 종료 성공
- Given:  
  - 진행 중(`active`) 상태인 케이스가 있다.
- When:  
  - `/admin/cases/[id]`에서 [강제 종료] 버튼 클릭 → 사유 입력 → 저장을 누른다.
- Then:  
  - 케이스 상태가 `ended_early` 또는 지정한 종료 상태로 변경되고, `activity_logs`에 `FORCE_END` 액션이 기록된다.
- 선행 Scenario: WP4.2-1  
- 테스트/검증:  
  - 상태 값 변경 확인.  
  - 로그에 액션/사유 기록 확인.

---

## WP4.4 – Admin 케이스 삭제

### Scenario WP4.4-1: Admin 삭제 Confirm에서 취소
- Given:  
  - Admin이 `/admin/cases/[id]`에 접속한 상태.
- When:  
  - [케이스 완전 삭제] 클릭 후, Confirm 모달에서 [취소]를 선택한다.
- Then:  
  - 케이스 및 연관 데이터는 삭제되지 않는다.
- 선행 Scenario: WP4.2-1  
- 테스트/검증:  
  - 삭제 전/후 `cases` 및 연관 테이블 row 수 비교.

---

### Scenario WP4.4-2: Admin이 케이스 완전 삭제 성공
- Given:  
  - 여러 연관 데이터가 있는 케이스가 존재한다.
- When:  
  - [케이스 완전 삭제] → Confirm에서 [정말 삭제하기]를 선택한다.
- Then:  
  - `cases` row와 연관된 `care_logs`, `case_tokens`, `notification_logs`, `activity_logs`가 모두 삭제된다.
- 선행 Scenario: WP4.4-1  
- 테스트/검증:  
  - 삭제 후 각 테이블에서 해당 case_id 검색 → 결과 없음 확인.
