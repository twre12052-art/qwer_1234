"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminForceEnd } from "@/modules/admin/actions";

export function AdminForceEnd({ caseId, currentStatus }: { caseId: string; currentStatus: string }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 이미 종료된 케이스는 버튼 비활성화
  if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELED') {
    return (
      <div className="text-center py-4 text-gray-500">
        이미 종료된 케이스입니다
      </div>
    );
  }

  const handleForceEnd = async () => {
    if (!reason || reason.trim().length < 5) {
      setError("종료 사유를 5자 이상 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await adminForceEnd(caseId, reason);
      
      if (result.error) {
        setError(result.error);
      } else {
        alert("케이스가 강제 종료되었습니다.");
        setShowConfirm(false);
        router.refresh();
      }
    } catch (err) {
      setError("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
      >
        강제 종료
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* 경고 메시지 */}
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">
          ⚠️ 케이스를 즉시 종료 처리합니다. 진행 중인 간병이 중단됩니다.
        </p>
      </div>

      {/* 사유 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          종료 사유 (필수, 5자 이상)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="예: 환자 퇴원으로 인한 조기 종료"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[80px]"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {reason.length}/5자 이상
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setShowConfirm(false);
            setError("");
            setReason("");
          }}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleForceEnd}
          disabled={loading || reason.trim().length < 5}
          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "처리 중..." : "종료 확정"}
        </button>
      </div>
    </div>
  );
}

