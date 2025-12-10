"use client";

import { useState } from "react";

export function EmailSendButton({ caseId }: { caseId: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!email) {
      setError("이메일 주소를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, email }),
      });

      const result = await response.json();

      console.log("이메일 발송 응답:", result);

      if (result.success) {
        setSuccess(true);
        setEmail("");
      } else {
        console.error("이메일 발송 실패:", result.error);
        setError(result.error || "이메일 발송에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("이메일 발송 클라이언트 에러:", err);
      setError(`오류가 발생했습니다: ${err.message || "다시 시도해주세요"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-base font-medium text-gray-700 mb-2">
          이메일 주소
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
        />
      </div>

      <button
        onClick={handleSend}
        disabled={loading || !email}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          "발송 중..."
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            이메일로 받기
          </>
        )}
      </button>

      {/* 성공 메시지 */}
      {success && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          <p className="font-medium">✅ 이메일이 발송되었습니다!</p>
          <p className="text-sm mt-1">메일함을 확인해주세요.</p>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {/* 안내 */}
      <p className="text-sm text-gray-500">
        💡 Gmail 설정이 필요합니다. 환경 변수를 확인해주세요.
      </p>
    </div>
  );
}

