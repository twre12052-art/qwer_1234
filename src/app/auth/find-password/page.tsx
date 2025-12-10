"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/modules/shared/components/Card";

export default function FindPasswordPage() {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleFindPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!username.trim()) {
      setError("아이디를 입력해주세요.");
      return;
    }

    const phoneNumbers = phone.replace(/[^0-9]/g, '');
    if (phoneNumbers.length !== 11 || !phoneNumbers.startsWith('010')) {
      setError('올바른 휴대폰 번호를 입력해주세요. (010-XXXX-XXXX)');
      return;
    }

    setLoading(true);

    try {
      // TODO: 실제 API 연동
      // const response = await fetch('/api/auth/find-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username: username.trim(), phone: phoneNumbers }),
      // });
      // const data = await response.json();
      
      // 임시로 에러 메시지 표시
      setError("비밀번호 찾기 기능은 준비 중입니다. 고객센터로 문의해주세요.");
    } catch (err: any) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-3xl font-bold text-gray-900">비밀번호 찾기</h1>
          <p className="text-base text-gray-500 mt-1">
            가입 시 등록한 아이디와 전화번호를 입력해주세요
          </p>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleFindPassword} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-base">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg text-base">
                비밀번호 재설정 링크가 이메일로 발송되었습니다.
              </div>
            )}

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                아이디
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디를 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="010-0000-0000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={13}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "찾는 중..." : "비밀번호 찾기"}
            </button>

            <div className="flex gap-4 justify-center text-base">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                로그인
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/auth/find-id" className="text-gray-600 hover:text-gray-900">
                아이디 찾기
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

