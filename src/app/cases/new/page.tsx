"use client";

import { createCase } from "@/modules/case/actions";
import { useState } from "react";
import Link from "next/link";

export default function NewCasePage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 오늘 날짜 (YYYY-MM-DD 형식)
  const today = new Date().toISOString().split('T')[0];

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    const res = await createCase(formData);
    if (res?.error) {
        setError(res.error);
        setLoading(false);
    }
    // Redirect is handled in server action
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">새 간병 등록</h1>
      
      <form action={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">환자 성함 *</label>
            <input name="patient_name" required data-testid="patient-name-input" className="w-full border rounded-md px-3 py-2" placeholder="예: 홍길동" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">병원명</label>
            <input name="hospital_name" data-testid="hospital-name-input" className="w-full border rounded-md px-3 py-2" placeholder="예: 서울병원" />
          </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">진단명</label>
            <input name="diagnosis" className="w-full border rounded-md px-3 py-2" placeholder="예: 뇌졸중" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시작일 *</label>
            <input 
              type="date" 
              name="start_date" 
              required 
              min={today}
              data-testid="start-date-input" 
              className="w-full border rounded-md px-3 py-2" 
            />
            <p className="text-xs text-gray-500 mt-1">* 오늘 또는 미래 날짜만 선택 가능합니다.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">종료 예정일 *</label>
            <input 
              type="date" 
              name="end_date_expected" 
              required 
              min={today}
              data-testid="end-date-input" 
              className="w-full border rounded-md px-3 py-2" 
            />
            <p className="text-xs text-gray-500 mt-1">* 시작일 이후 날짜를 선택해주세요.</p>
          </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">1일 간병비 (원) *</label>
            <input type="number" name="daily_wage" required min="0" step="1000" data-testid="daily-wage-input" className="w-full border rounded-md px-3 py-2" placeholder="150000" />
        </div>

        <div className="border-t pt-4 mt-4">
            <h3 className="font-medium mb-4">간병인 정보 (선택)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">간병인 성함</label>
                    <input name="caregiver_name" className="w-full border rounded-md px-3 py-2" placeholder="예: 김간병" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                    <input name="caregiver_contact" className="w-full border rounded-md px-3 py-2" placeholder="010-0000-0000" />
                </div>
            </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end gap-2 pt-4">
            <Link href="/cases" className="px-4 py-2 border rounded-md hover:bg-gray-50">취소</Link>
            <button type="submit" disabled={loading} data-testid="save-case-button" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                {loading ? "저장 중..." : "저장"}
            </button>
        </div>
      </form>
    </div>
  );
}

