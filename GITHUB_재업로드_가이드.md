# 🔒 GitHub 저장소 안전하게 재업로드 가이드

## ⚠️ 중요: 이 작업 전에 해야 할 일

### 1단계: 모든 API 키 재생성 (필수!)

GitHub에 이미 올라간 키들은 **영구적으로 노출**되었을 수 있습니다.
**반드시 모든 키를 재생성**하세요:

#### Supabase 키 재생성
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. Settings → API
4. **Service Role Key** → [Reveal] → [Reset] 클릭
5. 새 키 복사하여 `.env.local`에 저장

#### Gmail 앱 비밀번호 재생성 (사용 중인 경우)
1. Google 계정 → 보안
2. 2단계 인증 → 앱 비밀번호
3. 기존 앱 비밀번호 삭제
4. 새 앱 비밀번호 생성
5. `.env.local`에 저장

#### SOLAPI 키 재생성 (사용 중인 경우)
1. https://solapi.com 접속
2. API 키 관리
3. 기존 키 삭제
4. 새 키 생성
5. `.env.local`에 저장

---

## 🗑️ 2단계: GitHub 저장소 삭제

### 방법 1: GitHub 웹사이트에서 삭제 (권장)

1. **GitHub 저장소 접속**
   ```
   https://github.com/twre12052-art/qwer_1234
   ```

2. **Settings 메뉴 클릭**
   - 저장소 페이지 우측 상단의 "Settings" 탭

3. **Danger Zone 섹션으로 스크롤**
   - 페이지 맨 아래로 내리기

4. **Delete this repository 클릭**
   - 빨간색 버튼

5. **확인 입력**
   - 저장소 이름 입력: `twre12052-art/qwer_1234`
   - "I understand the consequences, delete this repository" 체크

6. **완료!**

---

## 🆕 3단계: 새 저장소 생성 및 업로드

### 3-1. GitHub에서 새 저장소 생성

1. **GitHub 메인 페이지** → **New repository** 클릭
2. **저장소 이름 입력** (예: `care-service` 또는 원하는 이름)
3. **Public 또는 Private 선택**
   - Private 권장 (민감한 정보 포함 가능)
4. **"Initialize this repository with a README" 체크 해제**
5. **Create repository 클릭**

### 3-2. 로컬에서 새 저장소에 연결

현재 폴더에서 실행:

```powershell
# 기존 원격 저장소 제거
git remote remove origin

# 새 원격 저장소 추가 (새 저장소 URL로 변경)
git remote add origin https://github.com/twre12052-art/새저장소이름.git

# 현재 변경사항 커밋
git add .
git commit -m "feat: 보안 강화 - 민감한 정보 제거 및 .gitignore 강화"

# 새 저장소에 푸시
git push -u origin main
```

---

## ✅ 4단계: 최종 확인

### 확인 사항

1. **GitHub 저장소에서 확인**
   - `.env.local` 파일이 없는지 확인
   - `.env.example` 파일이 있는지 확인
   - 실제 API 키가 포함된 문서가 없는지 확인

2. **로컬에서 확인**
   ```powershell
   # Git에 추적 중인 .env 파일 확인
   git ls-files | Select-String "\.env"
   # 결과가 없어야 함!
   ```

3. **.gitignore 확인**
   - `.env.local`이 무시되는지 확인
   ```powershell
   git check-ignore .env.local
   # 결과가 나와야 함!
   ```

---

## 🎯 완료 체크리스트

- [ ] 모든 API 키 재생성 완료
- [ ] `.env.local`에 새 키 저장 완료
- [ ] 기존 GitHub 저장소 삭제 완료
- [ ] 새 GitHub 저장소 생성 완료
- [ ] 로컬 코드 새 저장소에 푸시 완료
- [ ] GitHub에서 `.env.local` 파일 없는지 확인
- [ ] GitHub에서 `.env.example` 파일 있는지 확인

---

## 💡 추가 보안 권장사항

### 1. GitHub Secrets 사용 (배포 시)

Vercel이나 다른 배포 플랫폼 사용 시:
- GitHub → Settings → Secrets and variables → Actions
- 환경 변수를 Secrets로 등록
- 배포 시 자동으로 사용됨

### 2. Private 저장소 권장

- Public 저장소는 누구나 볼 수 있음
- Private 저장소는 초대받은 사람만 볼 수 있음
- 민감한 정보가 있다면 Private 권장

### 3. 정기적인 보안 점검

- 주기적으로 Git 히스토리 확인
- 새로운 키 추가 시 `.gitignore` 확인
- 문서 파일에 실제 키 포함되지 않았는지 확인

---

## 🆘 문제 해결

### 문제: "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/사용자명/저장소명.git
```

### 문제: "failed to push some refs"
```powershell
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### 문제: 키 재생성 후 앱이 작동하지 않음
- `.env.local` 파일 확인
- 서버 재시작 (`npm run dev`)
- Supabase Dashboard에서 새 키 확인

---

**작성일**: 2025-01-XX  
**목적**: GitHub 저장소 안전하게 재업로드

