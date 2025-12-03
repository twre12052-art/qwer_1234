"use client";

import { login, signup } from "@/modules/auth/actions";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const res = await login(formData);
        if (res?.error) setError(res.error);
      } else {
        const res = await signup(formData);
        if (res?.error) setError(res.error);
        if (res?.message) setMessage(res.message);
      }
    } catch (e) {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {isLogin ? "보호자 로그인" : "보호자 회원가입"}
          </h2>
        </div>
        <form action={handleSubmit} className="mt-8 space-y-6">
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                이메일 주소
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                data-testid="email-input"
                className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                placeholder="이메일 주소"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                data-testid="password-input"
                className={`relative block w-full ${isLogin ? "rounded-b-md" : ""} border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3`}
                placeholder="비밀번호"
              />
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="sr-only">
                  이름
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                  placeholder="이름"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center">{error}</div>
          )}
          {message && (
            <div className="text-sm text-green-600 text-center">{message}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              data-testid="submit-button"
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {loading
                ? "처리 중..."
                : isLogin
                ? "로그인"
                : "회원가입"}
            </button>
          </div>
        </form>
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setMessage(null);
            }}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {isLogin
              ? "계정이 없으신가요? 회원가입"
              : "이미 계정이 있으신가요? 로그인"}
          </button>
        </div>
        <div className="text-center mt-4">
            <Link href="/privacy" className="text-xs text-gray-500 hover:underline">
                개인정보 처리방침
            </Link>
        </div>
      </div>
    </div>
  );
}
