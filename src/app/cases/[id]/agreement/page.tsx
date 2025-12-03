"use client";

import { agreeGuardian } from "@/modules/case/actions";
import Link from "next/link";
import { useState } from "react";

export default function AgreementPage({ params }: { params: { id: string } }) {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAgree() {
    if (!checked) {
        setError("동의 전 체크박스를 선택해 주세요.");
        return;
    }
    setLoading(true);
    const res = await agreeGuardian(params.id);
    if (res?.error) {
        setError(res.error);
        setLoading(false);
    }
    // Redirect handled in server action
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Link href={`/cases/${params.id}`} className="text-gray-600 mb-4 inline-block">
         &larr; 뒤로 가기
      </Link>
      <h1 className="text-2xl font-bold mb-6">간병 계약서 확인</h1>

      <div className="bg-white border rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
        <h2 className="font-bold mb-4">제 1 조 (목적)</h2>
        <p className="mb-4 text-sm text-gray-700 leading-relaxed">
          본 계약은 보호자(이하 "갑")와 간병인(이하 "을") 사이의 간병 용역 제공에 관한 제반 사항을 규정함을 목적으로 한다.
        </p>
        <h2 className="font-bold mb-4">제 2 조 (성실 의무)</h2>
        <p className="mb-4 text-sm text-gray-700 leading-relaxed">
          "을"은 "갑"이 지정한 환자에 대하여 성실히 간병 업무를 수행하여야 한다.
        </p>
        <p className="text-sm text-gray-500">
          (이하 생략... 실제 계약서 내용이 들어갑니다.)
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <input
          type="checkbox"
          id="agree"
          checked={checked}
          data-testid="agreement-checkbox"
          onChange={(e) => {
              setChecked(e.target.checked);
              setError(null);
          }}
          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
        />
        <label htmlFor="agree" className="text-gray-900 font-medium select-none">
          위 계약 내용을 모두 확인하였으며 이에 동의합니다.
        </label>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <button
        onClick={handleAgree}
        disabled={loading}
        data-testid="submit-agreement-button"
        className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-bold"
      >
        {loading ? "처리 중..." : "동의합니다"}
      </button>
    </div>
  );
}

