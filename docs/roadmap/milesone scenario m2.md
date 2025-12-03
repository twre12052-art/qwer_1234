# M2 – 간병인 플로우 Scenario 모음

---

## M2-WP1 (토큰 진입 & 유효성 검사)

Scenario M2-WP1-1: 정상 토큰으로 간병인 페이지 진입  
Given: 보호자가 계약 동의를 마친 케이스에 대해 유효한 `case_tokens`가 생성되어 있다  
When: 간병인이 카카오톡 등으로 받은 링크(`/caregiver/[token]`)를 클릭한다  
Then: 케이스의 주요 정보(환자, 병원, 기간, 일당)와 함께 간병인 동의 안내 화면이 표시된다  
선행 Scenario: M1-WP3-2  

---

Scenario M2-WP1-2: 잘못된 토큰으로 접근 실패  
Given: DB에 존재하지 않는 임의의 토큰 값을 URL에 넣었다  
When: `/caregiver/[token]`에 접속한다  
Then: 케이스 정보가 보이지 않고 “유효하지 않은 링크입니다”라는 에러 페이지가 표시된다  
선행 Scenario: 없음  

---

Scenario M2-WP1-3: 만료된 토큰으로 접근 실패  
Given: 특정 토큰이 이미 만료 처리되었거나 유효 기간이 지났다  
When: 간병인이 해당 토큰으로 `/caregiver/[token]`에 접속한다  
Then: “유효기간이 지난 링크입니다”와 같은 에러 안내 화면이 표시된다  
선행 Scenario: M1-WP3-2  

---

## M2-WP2 (간병인 정보 입력 & 동의)

Scenario M2-WP2-1: 간병인 정보 입력 및 동의 성공  
Given: 간병인이 유효한 토큰으로 동의 화면을 보고 있으며, 모든 필수 정보(이름, 연락처, 주민번호, 주소, 계좌)를 입력했다  
When: “동의하고 시작하기” 버튼을 클릭한다  
Then: 케이스에 간병인 정보와 `caregiver_agreed_at`이 저장되고 상태가 `IN_PROGRESS`로 변경되며, 일지 목록 화면으로 이동한다  
선행 Scenario: M2-WP1-1  

---

Scenario M2-WP2-2: 필수 정보 누락으로 간병인 동의 실패  
Given: 간병인이 동의 폼에서 일부 필수 필드를 비워둔 상태이다  
When: “동의하고 시작하기” 버튼을 클릭한다  
Then: 동의가 저장되지 않고 누락된 항목에 대한 에러 메시지가 표시된다  
선행 Scenario: M2-WP1-1  

---

Scenario M2-WP2-3: 이미 동의한 간병인의 재접속 처리  
Given: 특정 토큰으로 이미 간병인 동의가 완료된 케이스가 있다  
When: 간병인이 동일 링크(`/caregiver/[token]`)를 다시 클릭한다  
Then: 동의 폼 대신 “이미 동의 완료된 간병입니다. 일지 작성 화면으로 이동합니다.”와 같은 안내와 함께 일지 목록으로 이동하는 버튼이 보인다  
선행 Scenario: M2-WP2-1  

---

## M2-WP3 (간병일지 목록 & 작성)

Scenario M2-WP3-1: 간병일지 목록에서 오늘 일지 진입  
Given: 케이스가 진행 중이며 현재 날짜가 간병 기간 안에 있다  
When: 간병인이 `/caregiver/[token]/logs`에 접속하고 “오늘 일지 작성하기” 버튼을 클릭한다  
Then: `/caregiver/[token]/logs/[today]` 화면으로 이동하고 오늘 날짜의 일지 입력 폼이 표시된다  
선행 Scenario: M2-WP2-1  

---

Scenario M2-WP3-2: 오늘 일지 작성 및 저장 성공  
Given: 간병인이 오늘 일지 화면에서 체크 항목과 메모를 작성했다  
When: “저장” 버튼을 클릭한다  
Then: 해당 날짜의 `care_logs`가 생성 또는 업데이트되고 “저장되었습니다” 안내 후 일지 목록으로 돌아가면 오늘 날짜가 “작성 완료”로 표시된다  
선행 Scenario: M2-WP3-1  

---

Scenario M2-WP3-3: 같은 날짜 일지 재수정 성공  
Given: 특정 날짜에 이미 일지가 작성된 상태이다  
When: 간병인이 해당 날짜를 다시 선택해 내용을 수정하고 “저장”을 누른다  
Then: 기존 `care_logs` 레코드가 업데이트되고 수정된 내용이 저장된다  
선행 Scenario: M2-WP3-2  

---

Scenario M2-WP3-4: 진행 중인 전체 기간 일지 목록 표시  
Given: 케이스의 `start_date`부터 현재까지 여러 날짜에 대한 일지가 일부 작성되어 있다  
When: 간병인이 `/caregiver/[token]/logs`를 연다  
Then: 간병 기간 내 각 날짜별로 “작성/미작성” 상태가 리스트로 표시된다  
선행 Scenario: M2-WP3-2  

---

## M2-WP4 (기간 변경 반영 & 오류 처리)

Scenario M2-WP4-1: 조기 종료 이후 날짜 일지 비표시  
Given: 보호자가 `end_date_final`을 오늘 날짜로 조기 종료 처리했다  
When: 간병인이 `/caregiver/[token]/logs`를 다시 연다  
Then: 조기 종료일 이후의 날짜는 목록에 나타나지 않거나 클릭할 수 없고, 종료일까지의 날짜만 보인다  
선행 Scenario: M1-WP4-1  

---

Scenario M2-WP4-2: 기간 밖 날짜 직접 접근 실패  
Given: 케이스의 `start_date`와 `end_date_final`이 설정되어 있다  
When: 간병인이 URL로 기간 밖 날짜(`/caregiver/[token]/logs/[out-of-range-date]`)에 직접 접속한다  
Then: 일지 폼이 표시되지 않고 “유효하지 않은 날짜입니다” 등의 에러 안내가 표시된다  
선행 Scenario: M2-WP1-1  

---

Scenario M2-WP4-3: 동의 전 일지 접근 시 동의 화면으로 리다이렉트  
Given: 케이스가 `CAREGIVER_PENDING` 상태이고 간병인 동의를 완료하지 않았다  
When: 간병인이 `/caregiver/[token]/logs`에 접속한다  
Then: 일지 목록 대신 동의 화면 또는 “먼저 동의 절차를 완료해 주세요” 안내와 함께 동의 페이지로 이동한다  
선행 Scenario: M2-WP1-1  
