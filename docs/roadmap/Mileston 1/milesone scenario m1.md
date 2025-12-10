# M1 – 보호자 플로우 Scenario 모음

---

## M1-WP1 (Auth + 케이스 목록)

Scenario M1-WP1-1: 신규 보호자 회원가입 성공  
Given: 가입되지 않은 이메일과 비밀번호가 있다  
When: 사용자가 `/login` 화면에서 회원가입 폼을 올바르게 작성하고 “회원가입” 버튼을 클릭한다  
Then: 새 계정이 생성되고 자동 로그인되며 `/cases` 페이지로 이동해 “내 케이스가 없습니다” 문구가 보인다  
선행 Scenario: 없음  

---

Scenario M1-WP1-2: 이미 존재하는 이메일로 회원가입 실패  
Given: 특정 이메일로 가입된 보호자 계정이 이미 존재한다  
When: 동일한 이메일로 회원가입 폼을 제출한다  
Then: 계정 생성이 되지 않고 “이미 가입된 이메일입니다”와 같은 에러 메시지가 로그인 화면에 표시된다  
선행 Scenario: M1-WP1-1  

---

Scenario M1-WP1-3: 로그인 성공 후 케이스 목록 진입  
Given: 보호자 계정이 존재하며 올바른 이메일/비밀번호를 알고 있다  
When: `/login`에서 이메일/비밀번호로 로그인 버튼을 클릭한다  
Then: 로그인에 성공하고 `/cases`로 리다이렉트되며 보호자의 케이스 목록(또는 빈 목록)이 보인다  
선행 Scenario: M1-WP1-1  

---

Scenario M1-WP1-4: 잘못된 비밀번호로 로그인 실패  
Given: 보호자 계정이 존재하지만 잘못된 비밀번호를 입력한다  
When: `/login`에서 잘못된 비밀번호로 로그인 버튼을 클릭한다  
Then: 로그인되지 않고 “아이디 또는 비밀번호가 올바르지 않습니다” 메시지가 표시된다  
선행 Scenario: M1-WP1-1  

---

Scenario M1-WP1-5: 비로그인 사용자의 케이스 목록 접근 차단  
Given: 어떤 계정에도 로그인하지 않은 상태이다  
When: 사용자가 URL로 `/cases`에 직접 접속한다  
Then: `/cases`를 볼 수 없고 `/login`으로 리다이렉트된다  
선행 Scenario: 없음  

---

Scenario M1-WP1-6: 로그아웃 성공  
Given: 보호자가 이미 로그인한 상태로 `/cases` 페이지를 보고 있다  
When: 상단 메뉴에서 “로그아웃”을 클릭한다  
Then: 세션이 종료되고 로그인 상태가 해제되며 `/login` 화면이 표시된다  
선행 Scenario: M1-WP1-3  

---

## M1-WP2 (새 케이스 생성 & 상세)

Scenario M1-WP2-1: 새 케이스 생성 페이지 진입  
Given: 보호자가 로그인한 상태로 `/cases`에 있다  
When: “새 간병 등록” 버튼을 클릭한다  
Then: `/cases/new` 페이지로 이동하고 케이스 입력 폼이 표시된다  
선행 Scenario: M1-WP1-3  

---

Scenario M1-WP2-2: 유효한 정보로 케이스 생성 성공  
Given: 보호자가 `/cases/new`에서 모든 필수 항목을 올바르게 입력하였다  
When: “저장” 버튼을 클릭한다  
Then: 새로운 `cases` 레코드가 생성되고 `/cases/[id]` 상세 화면으로 이동하여 방금 입력한 정보가 보인다  
선행 Scenario: M1-WP2-1  

---

Scenario M1-WP2-3: 새 케이스 생성 후 목록 표시  
Given: 보호자가 최소 1개의 케이스를 생성해 둔 상태이다  
When: `/cases` 페이지를 다시 연다  
Then: 방금 생성한 케이스가 목록 카드로 표시된다  
선행 Scenario: M1-WP2-2  

---

## M1-WP3 (계약 동의 & 링크 활성화)

Scenario M1-WP3-1: 계약서 확인 화면 진입  
Given: 보호자가 생성한 케이스 상세 `/cases/[id]`에 있으며 아직 보호자 동의를 하지 않았다  
When: “계약서 확인/동의하기” 버튼을 클릭한다  
Then: `/cases/[id]/agreement` 페이지로 이동하고 케이스 요약과 계약서 내용이 표시된다  
선행 Scenario: M1-WP2-2  

---

Scenario M1-WP3-2: 계약서 동의 성공 & 링크 활성화  
Given: 보호자가 `/cases/[id]/agreement`에서 계약 내용을 모두 읽고 체크박스를 선택한 상태이다  
When: “동의합니다” 버튼을 클릭한다  
Then: `guardian_agreed_at`이 저장되고 케이스 상태가 `GUARDIAN_PENDING`에서 `CAREGIVER_PENDING`으로 변경되며, 케이스 상세 페이지에서 간병인 링크가 표시된다  
선행 Scenario: M1-WP3-1  

---

Scenario M1-WP3-3: 계약 동의 전 링크 비활성 상태 확인  
Given: 보호자가 케이스를 생성했지만 아직 계약 동의를 하지 않았다  
When: `/cases/[id]` 상세 페이지를 연다  
Then: 간병인 링크는 표시되지 않고 “계약 동의 후 링크가 생성됩니다”와 같은 안내 문구만 보인다  
선행 Scenario: M1-WP2-2  

---

Scenario M1-WP3-4: 체크박스 미체크로 인한 동의 실패  
Given: 보호자가 계약 내용은 보았지만 “내용을 확인했습니다” 체크박스를 체크하지 않은 상태이다  
When: “동의합니다” 버튼을 클릭한다  
Then: 동의가 저장되지 않고 “동의 전 체크박스를 선택해 주세요”와 같은 에러 메시지가 표시된다  
선행 Scenario: M1-WP3-1  

---

## M1-WP4 (조기 종료 & 연장)

Scenario M1-WP4-1: 간병 조기 종료 설정 성공  
Given: 케이스가 이미 진행 중이며 `end_date_final`이 미래 날짜로 설정되어 있다  
When: 보호자가 `/cases/[id]`에서 [간병 조기 종료] 버튼을 클릭하고, 종료일을 오늘 날짜로 선택한 뒤 확인 모달에서 동의한다  
Then: `end_date_final`이 오늘 날짜로 변경되고 케이스 상세에 변경된 기간이 표시된다  
선행 Scenario: M1-WP3-2  

---

Scenario M1-WP4-2: 간병 연장 설정 성공  
Given: 케이스가 진행 중이며 `end_date_final`이 설정되어 있다  
When: 보호자가 [간병 연장] 버튼을 클릭하고 기존 종료일 이후의 날짜를 선택한 뒤 저장한다  
Then: `end_date_final`이 선택된 날짜로 변경되고 케이스 상세에 연장된 기간이 표시된다  
선행 Scenario: M1-WP3-2  

---

Scenario M1-WP4-3: 연장 시 기존 종료일 이전 날짜 선택 실패  
Given: 케이스에 이미 특정 `end_date_final`이 설정되어 있다  
When: 보호자가 [간병 연장] 화면에서 기존 종료일 이전 날짜를 선택하고 저장을 시도한다  
Then: 저장이 거부되고 “현재 종료일 이후 날짜만 선택 가능합니다” 등의 에러 메시지가 표시된다  
선행 Scenario: M1-WP4-2  

---

## M1-WP5 (기본 에러/검증)

Scenario M1-WP5-1: 필수 필드 누락으로 케이스 생성 실패  
Given: 보호자가 `/cases/new`에서 일부 필수 입력값을 비워둔 상태이다  
When: “저장” 버튼을 클릭한다  
Then: 케이스가 생성되지 않고 누락된 필드 옆에 에러 메시지가 표시된다  
선행 Scenario: M1-WP2-1  

---

Scenario M1-WP5-2: 잘못된 날짜 입력으로 케이스 생성 실패  
Given: 보호자가 시작일보다 이전인 종료 예정일을 입력했다  
When: “저장” 버튼을 클릭한다  
Then: 케이스가 생성되지 않고 “종료일은 시작일 이후여야 합니다”와 같은 에러 메시지가 표시된다  
선행 Scenario: M1-WP2-1  

---

Scenario M1-WP5-3: 잘못된 로그인 정보로 로그인 실패  
Given: 보호자 계정이 존재하지만 잘못된 비밀번호를 입력한다  
When: `/login`에서 로그인 버튼을 클릭한다  
Then: 로그인에 실패하고 “아이디 또는 비밀번호가 올바르지 않습니다” 메시지가 표시된다  
선행 Scenario: M1-WP1-1  

---

Scenario M1-WP5-4: 계약 동의 없이 링크 조회 시 비활성 메시지  
Given: 케이스는 존재하지만 보호자가 아직 계약 동의를 하지 않았다  
When: 보호자가 `/cases/[id]` 상세를 새로고침한다  
Then: 링크가 보이지 않고 “계약 동의 후 링크가 노출됩니다”와 같은 안내만 보인다  
선행 Scenario: M1-WP2-2  
