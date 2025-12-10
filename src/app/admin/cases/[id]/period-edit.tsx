"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminChangePeriod } from "@/modules/admin/actions";

export function AdminPeriodEdit({ caseId, caseData }: { caseId: string; caseData: any }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [startDate, setStartDate] = useState(caseData.start_date);
  const [endDate, setEndDate] = useState(caseData.end_date_final || caseData.end_date_expected);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await adminChangePeriod(caseId, startDate, endDate, reason);
      
      if (result.error) {
        setError(result.error);
      } else {
        alert("기간이 수정되었습니다.");
        setIsEditing(false);
        router.refresh();
      }
    } catch (err) {
      setError("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
      >
        기간 수정하기
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 현재 기간 표시 */}
      <div className="p-3 bg-gray-50 rounded border text-sm">
        <p className="text-gray-700">
          <strong>현재 기간:</strong> {caseData.start_date} ~ {caseData.end_date_final || caseData.end_date_expected}
        </p>
        {caseData.created_at && (
          <p className="text-gray-500 text-xs mt-1">
            생성일: {new Date(caseData.created_at).toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}
          </p>
        )}
      </div>

      {/* 시작일 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          시작일 (과거 포함 가능)
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      {/* 종료일 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          종료일
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      {/* 사유 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          수정 사유 (선택)
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="예: 보호자 요청으로 기간 조정"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
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
            setIsEditing(false);
            setError("");
          }}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}

