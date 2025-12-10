import { getCaseByToken } from "@/modules/caregiver/actions";
import { getCareLogsByToken } from "@/modules/careLog/actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CareLogAttachments } from "./care-log-attachments";
import { AutoRefresh } from "./auto-refresh";
import { isAdmin } from "@/modules/shared/lib/admin-check";

// Helper to generate date range
function getDatesInRange(startDate: Date, endDate: Date) {
    const date = new Date(startDate);
    const dates = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    while (date <= endDate) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return dates.reverse();
}

export default async function CareLogsListPage({ params }: { params: { token: string } }) {
  const { token } = params;
  const res = await getCaseByToken(token);

  if (res.error || !res.caseData) {
      return <div className="p-8 text-center">{res.error || "오류가 발생했습니다."}</div>;
  }
  const { caseData } = res;

  if (!caseData.caregiver_agreed_at) {
      redirect(`/caregiver/${token}`);
  }

  const logs = await getCareLogsByToken(token);
  const logMap = new Map(logs.map((l: any) => [l.date, l]));
  const adminUser = await isAdmin(); // 어드민 여부 확인

  const startDate = new Date(caseData.start_date);
  const endDate = new Date(caseData.end_date_final || caseData.end_date_expected);
  const allDates = getDatesInRange(startDate, endDate);
  const todayStr = new Date().toISOString().split('T')[0];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const visibleDates = allDates.filter((date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d <= today;
  });

  const pdfTemplateUrl = `/api/pdf/care-log-template?patient=${encodeURIComponent(caseData.patient_name)}&caregiver=${encodeURIComponent(caseData.caregiver_name || "간병인")}&date=${todayStr}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <AutoRefresh token={token} />
      {/* 헤더 - Supabase 스타일 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">간병현황</h1>
                <p className="text-sm text-gray-500">{caseData.patient_name}님</p>
                <p className="text-sm text-gray-400 mt-0.5">
                  간병 기간: {caseData.start_date} ~ {caseData.end_date_final || caseData.end_date_expected}
                </p>
                {(() => {
                  const endDate = new Date(caseData.end_date_final || caseData.end_date_expected);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  endDate.setHours(0, 0, 0, 0);
                  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  if (daysRemaining > 0) {
                    return <p className="text-sm text-blue-600 font-medium mt-1">📅 간병 남은 일수: {daysRemaining}일</p>;
                  } else if (daysRemaining === 0) {
                    return <p className="text-sm text-orange-600 font-medium mt-1">📅 오늘이 간병 마지막 날입니다</p>;
                  } else {
                    return <p className="text-sm text-gray-500 font-medium mt-1">📅 간병 기간이 종료되었습니다</p>;
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-2xl">
        {/* 탭 네비게이션 - Supabase 스타일 */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg border border-gray-200 p-1">
          <div className="flex-1 text-center py-2 px-4 bg-blue-600 text-white rounded-md font-medium text-sm">
            진행중
          </div>
          <div className="flex-1 text-center py-2 px-4 text-gray-600 font-medium text-sm hover:bg-gray-50 rounded-md transition-colors">
            입금 필요
          </div>
          <div className="flex-1 text-center py-2 px-4 text-gray-600 font-medium text-sm hover:bg-gray-50 rounded-md transition-colors">
            서류 발급 가능
          </div>
        </div>

        {/* 신청 정보 카드 - Supabase 스타일 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">신청 정보</h2>
          </div>
          <div className="px-6 py-5">
          {/* 신청인 정보 */}
          <div className="mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h3 className="text-base font-bold text-gray-900">신청인 정보</h3>
            </div>
            <div className="pl-4 space-y-2">
              <div className="flex">
                <span className="text-base text-gray-600 w-20">이름:</span>
                <span className="text-base font-medium text-gray-900">{caseData.patient_name}</span>
              </div>
              <div className="flex">
                <span className="text-base text-gray-600 w-20">연락처:</span>
                <span className="text-base font-medium text-gray-900">010-****-****</span>
              </div>
              <div className="flex">
                <span className="text-base text-gray-600 w-20">보험가입사:</span>
                <span className="text-base font-medium text-gray-900">-</span>
              </div>
            </div>
          </div>

          {/* 환자 정보 */}
          <div className="mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h3 className="text-base font-bold text-gray-900">환자 정보</h3>
            </div>
            <div className="pl-4 space-y-2">
              <div className="flex">
                <span className="text-base text-gray-600 w-20">이름:</span>
                <span className="text-base font-medium text-gray-900">{caseData.patient_name}</span>
              </div>
              <div className="flex">
                <span className="text-base text-gray-600 w-20">연락처:</span>
                <span className="text-base font-medium text-gray-900">010-****-****</span>
              </div>
              <div className="flex">
                <span className="text-base text-gray-600 w-20">생년월일:</span>
                <span className="text-base font-medium text-gray-900">{caseData.patient_birth_date || "-"}</span>
              </div>
              <div className="flex">
                <span className="text-base text-gray-600 w-20">입원지역:</span>
                <span className="text-base font-medium text-gray-900">-</span>
              </div>
              <div className="flex">
                <span className="text-base text-gray-600 w-20">병원명:</span>
                <span className="text-base font-medium text-gray-900">{caseData.hospital_name || "-"}</span>
              </div>
              <div className="flex">
                <span className="text-base text-gray-600 w-20">입원날짜:</span>
                <span className="text-base font-medium text-gray-900">{caseData.start_date}</span>
              </div>
            </div>
          </div>

          {/* 간병인 정보 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h3 className="text-base font-bold text-gray-900">간병인 정보</h3>
            </div>
            <div className="pl-4 space-y-2">
              <div className="flex">
                <span className="text-base text-gray-600 w-20">이름:</span>
                <span className="text-base font-medium text-gray-900">{caseData.caregiver_name || "-"}</span>
              </div>
              <div className="flex">
                <span className="text-base text-gray-600 w-20">연락처:</span>
                <span className="text-base font-medium text-gray-900">{caseData.caregiver_phone || "-"}</span>
              </div>
              <div className="flex">
                <span className="text-base text-gray-600 w-20">생년월일:</span>
                <span className="text-base font-medium text-gray-900">{caseData.caregiver_birth_date || "-"}</span>
              </div>
              <div className="flex">
                <span className="text-base text-gray-600 w-20">계좌번호:</span>
                <span className="text-base font-medium text-gray-900">
                  {caseData.caregiver_account_bank || ""} {caseData.caregiver_account_number || "-"}
                </span>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* 간병일지 섹션 - Supabase 스타일 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">📝 간병현황</h2>
          </div>
          <div className="px-6 py-5">

            {/* 일지 완료 상태 표시 */}
            {(() => {
              const completedLogs = logs.filter((l: any) => l.is_active).length;
              const totalDays = visibleDates.length;
              const isCompleted = completedLogs === totalDays && totalDays > 0;
              const endDate = new Date(caseData.end_date_final || caseData.end_date_expected);
              endDate.setHours(0, 0, 0, 0);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPeriodEnded = today >= endDate;
              
              if (isPeriodEnded && isCompleted) {
                return (
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      <div>
                        <p className="text-base font-bold text-green-800">일지 작성 완료!</p>
                        <p className="text-sm text-green-700 mt-0.5">모든 간병일지 작성이 완료되었습니다. ({totalDays}일 중 {completedLogs}일 작성 완료)</p>
                      </div>
                    </div>
                  </div>
                );
              } else if (isPeriodEnded) {
                return (
                  <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <p className="text-base font-bold text-yellow-800">일지 작성 필요</p>
                        <p className="text-sm text-yellow-700 mt-0.5">간병 기간이 종료되었습니다. 남은 일지 작성이 필요합니다. ({totalDays}일 중 {completedLogs}일 작성 완료)</p>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800">
                      💡 작성 현황: {totalDays}일 중 {completedLogs}일 작성 완료
                    </p>
                  </div>
                );
              }
            })()}

            {/* 액션 버튼들 */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Link 
                href={`/caregiver/${token}/logs/${todayStr}`} 
                data-testid="today-log-button"
                className="bg-blue-600 text-white text-center py-2.5 rounded-lg font-medium text-base hover:bg-blue-700 transition-colors"
              >
                ✏️ 오늘 간병일지 작성
              </Link>
              <a
                href={pdfTemplateUrl}
                target="_blank"
                className="bg-white border border-gray-300 text-gray-700 text-center py-2.5 rounded-lg font-medium text-base hover:bg-gray-50 transition-colors"
              >
                📄 간병일지 PDF 파일 다운
              </a>
            </div>

            {/* 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                💡 프린터 후 작성 첨부
              </p>
            </div>

            {/* 간병일지 PDF 첨부 섹션 */}
            <div className="border-t border-gray-200 pt-5 mt-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3">📎 간병일지 PDF 첨부</h3>
              <CareLogAttachments token={token} />
            </div>

          {/* 날짜별 일지 목록 */}
          <div className="space-y-2">
            {visibleDates.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const log = logMap.get(dateStr);
                const isToday = dateStr === todayStr;

                return (
                    <Link 
                      key={dateStr}
                      href={`/caregiver/${token}/logs/${dateStr}`}
                      className={`block border rounded-lg p-4 flex justify-between items-center transition-all hover:shadow ${
                        isToday 
                          ? "border-blue-300 bg-blue-50" 
                          : log 
                            ? "border-blue-200 bg-white hover:bg-blue-50" 
                            : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex-1">
                          <div className="text-base font-medium text-gray-900 mb-1">
                              {date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                              {isToday && <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">오늘</span>}
                          </div>
                          {log && (
                            <div className="text-sm text-gray-500 truncate max-w-[200px]">
                              {log.content?.split('\n')[0] || ''}...
                            </div>
                          )}
                      </div>
                      <div className="flex items-center gap-2">
                          {log ? (
                              <span className="text-blue-600 text-sm font-medium bg-blue-50 px-2 py-1 rounded">✓ 완료</span>
                          ) : (
                              <span className="text-gray-400 text-sm">미작성</span>
                          )}
                          {/* 어드민만 수정/삭제 가능 */}
                          {adminUser && log && (
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                  <Link
                                      href={`/admin/care-log-edit/${caseData.id}/${dateStr}`}
                                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100 transition-colors"
                                  >
                                      수정
                                  </Link>
                                  <button
                                      onClick={async (e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (confirm("정말 이 일지를 삭제하시겠습니까?")) {
                                              // TODO: 삭제 기능 구현
                                              alert("삭제 기능은 곧 추가될 예정입니다.");
                                          }
                                      }}
                                      className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100 transition-colors"
                                  >
                                      삭제
                                  </button>
                              </div>
                          )}
                      </div>
                    </Link>
                );
            })}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
