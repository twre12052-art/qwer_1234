"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminDeleteCase } from "@/modules/admin/actions";

export function AdminDeleteCase({ caseId, patientName }: { caseId: string; patientName: string }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!reason || reason.trim().length < 5) {
      setError("삭제 사유를 5자 이상 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await adminDeleteCase(caseId, reason);
      
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        alert("케이스가 삭제되었습니다.");
        router.push("/admin/cases");
        router.refresh();
      }
    } catch (err) {
      setError("오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 font-medium"
      >
        케이스 완전 삭제
      </button>

      {/* Confirm 모달 */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {/* 제목 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  케이스를 삭제하시겠습니까?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  환자: {patientName}
                </p>
              </div>
            </div>

            {/* 경고 메시지 */}
            <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-base text-red-800 font-medium mb-2">
                ⚠️ 주의: 모든 데이터가 영구 삭제됩니다
              </p>
              <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
                <li>케이스 기본 정보</li>
                <li>간병인 링크 및 토큰</li>
                <li>간병일지 전체</li>
                <li>결제 정보</li>
                <li>활동 로그</li>
              </ul>
            </div>

            {/* 사유 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                삭제 사유 (필수, 5자 이상)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="예: 중복 등록으로 인한 삭제"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[80px]"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {reason.length}/5자 이상
              </p>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-base text-red-600">{error}</p>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setError("");
                  setReason("");
                }}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 text-base"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading || reason.trim().length < 5}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-base"
              >
                {loading ? "삭제 중..." : "정말 삭제하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

