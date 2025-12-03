"use client";

import { checkPdfRequirements } from "@/modules/pdf/actions";
import { useState } from "react";

export function PdfGenerateButton({ caseId }: { caseId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string[] | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    // 1. Check Requirements
    const res = await checkPdfRequirements(caseId);
    
    if (res.missingRequirements) {
        setError(res.missingRequirements);
        setLoading(false);
        return;
    }
    if (res.error) {
        setError([res.error]);
        setLoading(false);
        return;
    }

    // 2. Download PDF
    // Trigger download by navigating to API route
    window.location.href = `/api/pdf/${caseId}`;
    setLoading(false);
  };

  return (
    <div className="mt-6">
        <button 
            onClick={handleGenerate} 
            disabled={loading}
            data-testid="generate-pdf-button"
            className="w-full bg-green-600 text-white py-3 rounded-md font-bold hover:bg-green-700 disabled:opacity-50 shadow-lg flex justify-center items-center gap-2"
        >
            {loading ? "생성 중..." : "PDF 서류 만들기 (보험청구용)"}
        </button>
        
        {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-sm">
                <p className="font-bold mb-2">서류를 생성할 수 없습니다:</p>
                <ul className="list-disc pl-5 space-y-1">
                    {error.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
                <p className="mt-2 text-xs text-gray-500">모든 항목을 완료한 후 다시 시도해주세요.</p>
            </div>
        )}
    </div>
  );
}

