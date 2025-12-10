"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup, sendOtp, verifyOtpOnly, checkUsernameAvailable } from "@/modules/auth/actions";
import { Card, CardHeader, CardBody } from "@/modules/shared/components/Card";

export default function SignupPage() {
  const router = useRouter();
  
  // 약관 동의
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  
  // 입력 값
  const [username, setUsername] = useState(""); // 아이디
  const [usernameChecked, setUsernameChecked] = useState(false); // 중복확인 완료 여부
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [fullName, setFullName] = useState(""); // 실명
  const [birthInput, setBirthInput] = useState(""); // YYMMDD-X 형식
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  
  // 전화번호 인증 상태
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [expiresIn, setExpiresIn] = useState(0);
  const [otpId, setOtpId] = useState<string>("");
  
  // UI 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 전화번호 포맷팅
  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 생년월일 포맷팅 (YYMMDD-X)
  const formatBirthDate = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (cleaned.length <= 6) return cleaned;
    return `${cleaned.slice(0, 6)}-${cleaned.slice(6, 7)}`;
  };

  // 아이디 중복확인
  const handleCheckUsername = async () => {
    setError("");
    setSuccess("");
    
    if (!username.trim()) {
      setError("아이디를 입력해주세요.");
      return;
    }

    if (username.trim().length < 4) {
      setError("아이디는 4자 이상이어야 합니다.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setError("아이디는 영문, 숫자, 밑줄(_)만 사용 가능합니다.");
      return;
    }

    setLoading(true);

    try {
      const result = await checkUsernameAvailable(username.trim());
      
      if (result.available) {
        setSuccess(result.message);
        setUsernameChecked(true);
      } else {
        setError(result.message);
        setUsernameChecked(false);
      }
    } catch (err: any) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
      setUsernameChecked(false);
    } finally {
      setLoading(false);
    }
  };

  // 아이디 변경 시 중복확인 초기화
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameChecked(false);
    if (success.includes("사용 가능한 아이디")) {
      setSuccess("");
    }
  };

  // 전화번호 인증번호 발송
  const handleSendPhoneCode = async () => {
    setError("");
    setSuccess("");
    
    const phoneNumbers = phone.replace(/[^0-9]/g, '');
    if (phoneNumbers.length !== 11 || !phoneNumbers.startsWith('010')) {
      setError('올바른 휴대폰 번호를 입력해주세요. (010-XXXX-XXXX)');
      return;
    }

    setLoading(true);

    try {
      const result = await sendOtp(phoneNumbers);
      
      if (result.success) {
        setSuccess(result.message || "인증번호가 발송되었습니다.");
        setPhoneCodeSent(true);
        setExpiresIn(result.expiresIn || 300);
        
        // 타이머 시작
        const timer = setInterval(() => {
          setExpiresIn(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(result.message || "인증번호 발송에 실패했습니다.");
      }
    } catch (err: any) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 전화번호 인증번호 확인
  const handleVerifyPhoneCode = async () => {
    setError("");
    setSuccess("");
    
    if (phoneCode.length !== 6) {
      setError('6자리 인증번호를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const phoneNumbers = phone.replace(/[^0-9]/g, '');
      const result = await verifyOtpOnly(phoneNumbers, phoneCode);
      
      if (result.success) {
        setPhoneVerified(true);
        setSuccess("인증이 완료되었습니다.");
        if (result.otpId) {
          setOtpId(result.otpId);
        }
      } else {
        setError(result.message || "인증번호가 올바르지 않습니다.");
      }
    } catch (err: any) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 회원가입
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 유효성 검사
    if (!agreeTerms || !agreePrivacy) {
      setError("서비스 이용약관과 개인정보처리방침에 동의해주세요.");
      return;
    }

    if (!username.trim()) {
      setError("아이디를 입력해주세요.");
      return;
    }

    if (!usernameChecked) {
      setError("아이디 중복확인을 해주세요.");
      return;
    }

    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!fullName.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }

    if (!birthInput || birthInput.length !== 8) {
      setError("생년월일을 올바르게 입력해주세요. (예: 850722-1)");
      return;
    }

    if (!phoneVerified) {
      setError("전화번호 인증을 완료해주세요.");
      return;
    }

    setLoading(true);

    try {
      const phoneNumbers = phone.replace(/[^0-9]/g, '');
      
      const result = await signup({
        username: username.trim(),
        password,
        fullName: fullName.trim(),
        birthDate: birthInput, // YYMMDD-X 형식
        contactEmail: contactEmail.trim() || undefined,
        phone: phoneNumbers,
        otpId,
      });

      if (result.success) {
        // 회원가입 성공 - 즉시 로그인 페이지로 이동
        alert("회원가입이 완료되었습니다!\n로그인 페이지로 이동합니다.");
        router.push("/login");
        router.refresh();
      } else {
        setError(result.message || "회원가입에 실패했습니다.");
      }
    } catch (err: any) {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 타이머 포맷 (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <h1 className="text-3xl font-bold text-gray-900">회원가입</h1>
          <p className="text-base text-gray-500 mt-1">
            간병노트에 가입하고 서비스를 이용하세요
          </p>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSignup} className="space-y-4">
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-base">
                {error}
              </div>
            )}

            {/* 성공 메시지 */}
            {success && (
              <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg text-base">
                {success}
              </div>
            )}

            {/* 약관 동의 */}
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-base">
                  <Link href="/terms" target="_blank" className="text-primary hover:underline">
                    서비스 이용약관
                  </Link>
                  에 동의합니다 <span className="text-red-500">*</span>
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-base">
                  <Link href="/privacy" target="_blank" className="text-primary hover:underline">
                    개인정보처리방침
                  </Link>
                  에 동의합니다 <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            {/* 아이디 + 중복확인 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                아이디 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="영문, 숫자, 밑줄(_) 4자 이상"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleCheckUsername}
                  disabled={loading || !username.trim() || usernameChecked}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {usernameChecked ? "확인완료" : "중복확인"}
                </button>
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="홍길동"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
            </div>

            {/* 생년월일 (YYMMDD-X) */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                생년월일 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={birthInput}
                onChange={(e) => setBirthInput(formatBirthDate(e.target.value))}
                placeholder="850722-1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={8}
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-1">
                예: 850722-1 (YYMMDD-성별숫자)
              </p>
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
            </div>

            {/* 연락처(전화번호) + 인증 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                연락처 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="010-0000-0000"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={13}
                  disabled={loading || phoneVerified}
                />
                <button
                  type="button"
                  onClick={handleSendPhoneCode}
                  disabled={loading || phone.replace(/[^0-9]/g, '').length !== 11 || phoneVerified}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {phoneVerified ? "인증완료" : "인증"}
                </button>
              </div>

              {/* 인증번호 입력칸 (인증 버튼 누르면 나타남) */}
              {phoneCodeSent && !phoneVerified && (
                <div className="mt-2 flex gap-2 items-center">
                  <input
                    type="text"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="인증번호 6자리"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-lg tracking-widest"
                    maxLength={6}
                    disabled={loading}
                  />
                  {expiresIn > 0 && (
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {formatTime(expiresIn)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleVerifyPhoneCode}
                    disabled={loading || phoneCode.length !== 6 || expiresIn === 0}
                    className="px-6 py-3 bg-gradient-to-r from-blue-400 to-sky-400 text-white rounded-lg font-medium hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                  >
                    확인
                  </button>
                </div>
              )}
            </div>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-400 to-sky-400 text-white py-3 rounded-lg font-medium hover:from-blue-500 hover:to-sky-500 hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all mt-6"
            >
              {loading ? "가입 중..." : "회원가입"}
            </button>

            {/* 로그인 링크 */}
            <div className="text-center text-base text-gray-600">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="text-primary hover:underline">
                로그인
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
