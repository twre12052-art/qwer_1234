# M1 2차 - 회원가입 및 로그아웃 버그 수정

## 🐛 발견된 문제

### 1. 이름 입력란이 나타나지 않음
**증상**: 휴대폰 인증 후 바로 에러가 발생하고 이름 입력 화면이 나타나지 않음

**원인**:
- `verifyOtp` 함수가 userData 없이 호출될 때 신규 사용자인 경우 즉시 에러를 반환
- 클라이언트에서 신규 사용자 여부를 판단하지 못함

**해결**:
```typescript
// Before
if (!userData || !userData.name) {
  return {
    success: false,
    message: '신규 가입 시 이름은 필수입니다.',
  };
}

// After
if (!userData || !userData.name) {
  // 신규 사용자임을 알리고 클라이언트에서 추가 정보 입력 받기
  return {
    success: true,
    message: '인증이 완료되었습니다.',
    isNewUser: true,
    redirectTo: '/auth/phone',
  };
}
```

### 2. 로그아웃 시 에러 발생
**증상**: 로그아웃 버튼 클릭 시 에러 화면 표시

**원인**:
- Server Action에서 `redirect()` 사용 시 클라이언트에서 에러 처리 필요
- Form action으로 호출 시 redirect가 제대로 작동하지 않음

**해결**:
1. logout 함수 수정:
```typescript
// Before
export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/auth/phone');
}

// After
export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/');
  return { success: true, redirectTo: '/auth/phone' };
}
```

2. 로그아웃 버튼 클라이언트 컴포넌트로 분리:
```typescript
// src/app/cases/logout-button.tsx
"use client";

export function LogoutButton() {
  const router = useRouter();
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push(result.redirectTo);
      router.refresh();
    }
  };
  // ...
}
```

---

## 📝 수정된 파일

1. `src/modules/auth/actions.ts`
   - verifyOtp: 신규 사용자 처리 로직 수정
   - logout: redirect 제거, 결과 객체 반환

2. `src/app/cases/logout-button.tsx` (신규)
   - 클라이언트 컴포넌트로 로그아웃 버튼 분리

3. `src/app/cases/page.tsx`
   - LogoutButton 컴포넌트 사용

---

## ✅ 테스트 시나리오

### 신규 회원가입
1. `/auth/phone` 접속
2. 전화번호 입력 → 인증번호 받기
3. 터미널에서 코드 확인 → 입력
4. **이름 입력 화면 표시** ✅
5. 이름 입력 → 가입 완료
6. `/cases` 페이지로 이동 ✅

### 재로그인
1. 로그아웃
2. `/auth/phone` 접속
3. 동일 전화번호로 인증
4. 이름 입력 없이 바로 로그인 ✅
5. `/cases` 페이지로 이동

### 로그아웃
1. `/cases` 페이지에서 로그아웃 버튼 클릭
2. `/auth/phone`으로 정상 이동 ✅
3. 에러 없음 ✅

---

## 🎯 다음 단계

M1 테스트 완료 후 M2로 진행:
- M2: 보호자 플로우 MVP
- 카카오 알림톡 템플릿 신청
- 케이스 생성/관리 UX 개선

