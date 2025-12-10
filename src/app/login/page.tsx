"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/modules/auth/actions";
import { Card, CardHeader, CardBody } from "@/modules/shared/components/Card";

export default function LoginPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim()) {
      setError("아이디를 입력해주세요.");
      return;
    }
    
    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(username.trim(), password);
      
      if (result.success) {
        const redirectPath = result.redirectTo || "/cases";
        router.push(redirectPath);
        router.refresh();
      } else {
        setError(result.message || "로그인에 실패했습니다.");
      }
    } catch (err: any) {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-sky-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 border-2 border-blue-200 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">💙</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent">
                로그인
              </h1>
            </div>
          </div>
          <p className="text-sm text-blue-600 flex items-center gap-2">
            <span>✨</span>
            간병노트에 오신 것을 환영합니다
          </p>
        </CardHeader>

        <CardBody className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl text-base flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </div>
            )}

            {/* 아이디 */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span>👤</span>
                아이디
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디를 입력하세요"
                className="w-full px-5 py-4 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-base"
                disabled={loading}
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span>🔒</span>
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-5 py-4 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-base"
                disabled={loading}
              />
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-400 to-sky-400 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-500 hover:to-sky-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  로그인 중...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  로그인
                  <span>✨</span>
                </span>
              )}
            </button>
          </form>

          {/* 하단 링크 */}
          <div className="mt-8 space-y-4">
            {/* 회원가입 버튼 */}
            <Link
              href="/signup"
              className="block w-full text-center border-2 border-sky-200 text-blue-600 py-4 rounded-xl font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                회원가입
                <span>✨</span>
              </span>
            </Link>

            {/* 아이디/비밀번호 찾기 */}
            <div className="flex gap-4 justify-center text-base pt-4 border-t border-blue-100">
              <Link
                href="/auth/find-id"
                className="text-blue-600 hover:text-sky-500 transition-colors flex items-center gap-1"
              >
                <span>🔍</span>
                아이디 찾기
              </Link>
              <span className="text-blue-200">|</span>
              <Link
                href="/auth/find-password"
                className="text-blue-600 hover:text-sky-500 transition-colors flex items-center gap-1"
              >
                <span>🔑</span>
                비밀번호 찾기
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
