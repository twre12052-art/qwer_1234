"use client";

import { useState, useEffect } from "react";
import { getCareLogs } from "@/modules/careLog/actions";

interface CareLog {
  id: string;
  date: string;
  content: string;
  is_active: boolean;
  signature_data?: string | null;
}

interface CareLogsSectionProps {
  caseId: string;
  startDate?: string;
  endDate?: string;
  isAdmin?: boolean; // 어드민 여부
}

export function CareLogsSection({ caseId, startDate, endDate, isAdmin = false }: CareLogsSectionProps) {
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    // 초기 로드만 로딩 표시
    loadLogs(true);
    
    // 5초마다 자동 새로고침 (백그라운드에서 조용히 업데이트)
    const interval = setInterval(() => {
      loadLogs(false); // 로딩 표시 없이 업데이트
    }, 5000);
    
    return () => clearInterval(interval);
  }, [caseId]);

  const loadLogs = async (showLoading: boolean = false) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const data = await getCareLogs(caseId);
      setLogs(data || []);
    } catch (error) {
      console.error("간병일지 조회 오류:", error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // 간병 기간 내 날짜 수 계산
  const getTotalDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let count = 0;
    const date = new Date(start);
    while (date <= end && date <= today) {
      count++;
      date.setDate(date.getDate() + 1);
    }
    return count;
  };

  const totalDays = getTotalDays();
  const completedLogs = logs.filter(log => log.is_active).length;
  const missingLogs = totalDays - completedLogs;
  const isCompleted = missingLogs === 0 && totalDays > 0;

  const handleDownloadPdf = async (date: string) => {
    try {
      const response = await fetch(`/api/pdf/care-log/${caseId}?date=${date}`);
      if (!response.ok) {
        throw new Error("PDF 생성 실패");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `간병일지_${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("PDF 다운로드에 실패했습니다.");
    }
  };

  const handleDownloadAll = async () => {
    try {
      const response = await fetch(`/api/pdf/care-log/${caseId}`);
      if (!response.ok) {
        throw new Error("PDF 생성 실패");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `간병일지_전체_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("PDF 다운로드에 실패했습니다.");
    }
  };

  const parseLogContent = (content: string) => {
    const parts = content.split("[메모]");
    const itemsPart = parts[0].replace("[수행 항목]", "").trim();
    const memoPart = parts[1]?.trim() || "";
    const items = itemsPart ? itemsPart.split(",").map(i => i.trim()) : [];
    return { items, memo: memoPart };
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500 text-base">로딩 중...</div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-base">
        작성된 간병일지가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 일지 작성 현황 */}
      {startDate && endDate && (
        <div className={`border-2 rounded-lg p-4 ${isCompleted ? 'bg-green-50 border-green-500' : missingLogs > 0 ? 'bg-yellow-50 border-yellow-500' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{isCompleted ? '✅' : missingLogs > 0 ? '⚠️' : '📝'}</span>
            <div>
              <p className={`text-base font-bold ${isCompleted ? 'text-green-800' : missingLogs > 0 ? 'text-yellow-800' : 'text-blue-800'}`}>
                {isCompleted ? '간병일지 작성 완료' : missingLogs > 0 ? `일지 작성 필요: ${missingLogs}일 남음` : '일지 작성 진행 중'}
              </p>
              <p className={`text-sm mt-0.5 ${isCompleted ? 'text-green-700' : missingLogs > 0 ? 'text-yellow-700' : 'text-blue-700'}`}>
                작성 현황: {completedLogs}/{totalDays}일 완료
                {missingLogs > 0 && (
                  <span className="ml-2">({missingLogs}일 미작성)</span>
                )}
              </p>
            </div>
          </div>
          {missingLogs > 0 && (
            <p className="text-sm text-yellow-700 mt-2">
              💡 간병인이 모든 일지를 작성해야 서류 발급이 가능합니다.
            </p>
          )}
        </div>
      )}

      {/* 전체 다운로드 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={handleDownloadAll}
          className="px-4 py-2 bg-gradient-to-r from-blue-400 to-sky-400 text-white rounded-lg hover:from-blue-500 hover:to-sky-500 hover:shadow-lg transition-all text-base font-semibold"
        >
          📄 전체 일지 PDF 다운로드
        </button>
      </div>

      {/* 간병일지 목록 */}
      <div className="space-y-3">
        {logs
          .filter(log => log.is_active)
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((log) => {
            const { items, memo } = parseLogContent(log.content);
            const isSelected = selectedDate === log.date;

            return (
              <div
                key={log.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {new Date(log.date).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "short",
                      })}
                    </h3>
                    <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      작성 완료
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownloadPdf(log.date)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-base font-medium"
                  >
                    PDF 다운로드
                  </button>
                </div>

                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {items.length > 0 && (
                      <div className="mb-3">
                        <p className="text-base font-medium text-gray-700 mb-2">
                          수행 항목:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {items.map((item, idx) => (
                            <span
                              key={idx}
                              className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded"
                            >
                              ✓ {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {memo && (
                      <div>
                        <p className="text-base font-medium text-gray-700 mb-2">
                          상세 메모:
                        </p>
                        <p className="text-base text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded">
                          {memo}
                        </p>
                      </div>
                    )}
                    {log.signature_data && (
                      <div className="mt-3">
                        <p className="text-base font-medium text-gray-700 mb-2">간병인 서명</p>
                        <img 
                          src={log.signature_data} 
                          alt="서명" 
                          className="border border-gray-300 rounded-lg max-w-xs"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={() => setSelectedDate(isSelected ? null : log.date)}
                    className="text-base text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {isSelected ? "접기" : "자세히 보기"}
                  </button>
                  
                  {/* 어드민만 수정/삭제 가능 */}
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          if (confirm("정말 이 일지를 삭제하시겠습니까?")) {
                            // TODO: 삭제 기능 구현
                            alert("삭제 기능은 곧 추가될 예정입니다.");
                          }
                        }}
                        className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                      >
                        삭제
                      </button>
                      <a
                        href={`/admin/care-log-edit/${caseId}/${log.date}`}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        수정
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

