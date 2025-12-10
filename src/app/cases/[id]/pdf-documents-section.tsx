"use client";

import { useState, useEffect } from "react";
import { getCareLogs } from "@/modules/careLog/actions";

interface PdfDocument {
  id: string;
  title: string;
  description: string;
  apiUrl: string;
  icon: string;
  disabled?: boolean; // 미리보기/다운로드 비활성화 여부
}

export function PdfDocumentsSection({ caseId, caregiverAgreed = false }: { caseId: string; caregiverAgreed?: boolean }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasCareLogs, setHasCareLogs] = useState(false);

  // 간병일지 작성 여부 확인 (간병일지 또는 첨부 파일)
  useEffect(() => {
    if (caregiverAgreed) {
      const checkCareLogs = async () => {
        try {
          const logs = await getCareLogs(caseId);
          const hasWrittenLogs = logs && logs.length > 0 && logs.some((log: any) => log.is_active);
          
          // 첨부 파일도 확인
          const attachmentsResponse = await fetch(`/api/attachments/${caseId}?type=CARE_LOG_PDF`);
          const attachmentsData = attachmentsResponse.ok ? await attachmentsResponse.json() : [];
          const hasAttachments = attachmentsData && attachmentsData.length > 0;
          
          setHasCareLogs(hasWrittenLogs || hasAttachments);
        } catch (error) {
          console.error("간병일지 확인 오류:", error);
          setHasCareLogs(false);
        }
      };
      checkCareLogs();
    }
  }, [caseId, caregiverAgreed]);

  const documents: PdfDocument[] = [
    {
      id: "affiliation",
      title: "간병인 소속확인서",
      description: "간병노트 파트너 소속 확인",
      apiUrl: `/api/pdf/affiliation/${caseId}`,
      icon: "📋",
    },
    {
      id: "usage",
      title: "간병인 사용확인서",
      description: "간병 서비스 이용 내역",
      apiUrl: `/api/pdf/usage/${caseId}`,
      icon: "📝",
    },
    {
      id: "business",
      title: "사업자 등록증",
      description: "간병노트 사업자 정보",
      apiUrl: `/api/pdf/business`,
      icon: "🏢",
    },
    {
      id: "contract",
      title: "간병인 중개 계약서",
      description: "간병인-보호자 계약 내용",
      apiUrl: `/api/pdf/contract/${caseId}`,
      icon: "📄",
    },
    ...(caregiverAgreed ? [{
      id: "care-log",
      title: "간병일지",
      description: hasCareLogs ? "간병인이 작성한 일지 전체" : "작성된 간병일지가 없습니다",
      apiUrl: `/api/pdf/care-log/${caseId}`,
      icon: "📝",
      disabled: !hasCareLogs,
    }] : []),
  ];

  const handleCombinedDownload = async () => {
    setLoading("combined");
    try {
      const response = await fetch(`/api/pdf/combined/${caseId}`);
      if (!response.ok) {
        throw new Error("다운로드 실패");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `간병노트_전체서류_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert("다운로드에 실패했습니다.");
    } finally {
      setLoading(null);
    }
  };

  const handlePreview = async (doc: PdfDocument) => {
    if (doc.disabled) {
      alert("간병인이 작성한 간병일지가 없습니다.");
      return;
    }
    
    setLoading(doc.id);
    try {
      // 간병일지의 경우 먼저 확인
      if (doc.id === "care-log") {
        const response = await fetch(doc.apiUrl, { method: "HEAD" });
        if (!response.ok) {
          if (response.status === 404) {
            alert("간병인이 작성한 간병일지가 없습니다.");
            setLoading(null);
            return;
          }
          // 302 리다이렉트인 경우 (첨부된 PDF 파일)
          if (response.status === 302 || response.redirected) {
            window.open(doc.apiUrl, "_blank");
            setTimeout(() => setLoading(null), 500);
            return;
          }
        }
      }
      // 모든 PDF는 동일하게 window.open으로 열기
      window.open(doc.apiUrl, "_blank");
      setTimeout(() => setLoading(null), 500);
    } catch (error: any) {
      console.error("미리보기 오류:", error);
      alert("미리보기에 실패했습니다.");
      setLoading(null);
    }
  };

  const handleDownload = async (doc: PdfDocument) => {
    setLoading(doc.id);
    try {
      const response = await fetch(doc.apiUrl);
      if (!response.ok) throw new Error("다운로드 실패");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.title}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert("다운로드에 실패했습니다.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 통합 다운로드 */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📦</div>
            <div>
              <h3 className="text-base font-bold text-gray-900">전체 서류 한번에</h3>
              <p className="text-xs text-gray-600">표지 + 목차 + 5종 (간병일지 포함)</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setLoading("combined-preview");
                window.open(`/api/pdf/combined/${caseId}`, "_blank");
                setLoading(null);
              }}
              disabled={loading === "combined-preview"}
              className="px-4 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50 text-sm font-semibold"
            >
              {loading === "combined-preview" ? "열기 중..." : "미리보기"}
            </button>
            <button
              onClick={handleCombinedDownload}
              disabled={loading === "combined"}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 text-sm font-semibold"
            >
              {loading === "combined" ? "생성 중..." : "전체 다운"}
            </button>
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white text-xs text-gray-500">또는 개별 다운로드</span>
        </div>
      </div>

      {/* 문서 목록 - 2열 그리드 */}
      <div className="grid md:grid-cols-2 gap-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="border border-gray-200 rounded-lg p-3 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="text-xl">{doc.icon}</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">{doc.title}</h3>
                <p className="text-xs text-gray-500">{doc.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePreview(doc)}
                disabled={loading === doc.id || doc.disabled}
                className={`flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md transition-colors ${
                  doc.disabled 
                    ? "text-gray-400 cursor-not-allowed" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                미리보기
              </button>
              <button
                onClick={() => handleDownload(doc)}
                disabled={loading === doc.id || doc.disabled}
                className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
                  doc.disabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                다운로드
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 피드백 */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-blue-800">
              <strong>서류가 다르거나 수정이 필요하신가요?</strong> 고객센터로 문의해주세요
            </p>
          </div>
          <button
            onClick={() => setShowFeedback(true)}
            className="px-3 py-1.5 text-xs bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors font-medium"
          >
            📞 문의
          </button>
        </div>
      </div>

      {/* 모달 */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowFeedback(false)}>
          <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">📞 고객센터</h3>
            <div className="space-y-3 mb-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">전화</p>
                <p className="text-base font-bold text-blue-600">1577-0000</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">이메일</p>
                <p className="text-base font-semibold text-blue-600">support@carenote.kr</p>
              </div>
            </div>
            <button
              onClick={() => setShowFeedback(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
