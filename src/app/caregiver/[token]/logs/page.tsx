import { getCaseByToken } from "@/modules/caregiver/actions";
import { getCareLogs } from "@/modules/careLog/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

// Helper to generate date range
function getDatesInRange(startDate: Date, endDate: Date) {
    const date = new Date(startDate);
    const dates = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // We list dates from startDate to endDate.
    // M2-WP4: "조기 종료된 이후 날짜는 비활성/표시 안 함" -> handled by endDate being end_date_final
    
    while (date <= endDate) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return dates.reverse(); // Newest first
}

export default async function CareLogsListPage({ params }: { params: { token: string } }) {
  const { token } = params;
  const res = await getCaseByToken(token);

  if (res.error || !res.caseData) {
      return <div className="p-8 text-center">{res.error || "오류가 발생했습니다."}</div>;
  }
  const { caseData } = res;

  // M2-WP4: Redirect if not agreed
  if (!caseData.caregiver_agreed_at) {
      redirect(`/caregiver/${token}`);
  }

  const logs = await getCareLogs(caseData.id);
  const logMap = new Map(logs.map((l: any) => [l.date, l]));

  const startDate = new Date(caseData.start_date);
  const endDate = new Date(caseData.end_date_final || caseData.end_date_expected);
  const allDates = getDatesInRange(startDate, endDate);
  const todayStr = new Date().toISOString().split('T')[0];
  
  // 오늘까지의 날짜만 필터링 (미래 날짜 제거)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const visibleDates = allDates.filter((date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d <= today; // 오늘 포함, 미래는 제외
  });

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">간병일지 목록</h1>
        <span className="text-sm text-gray-500">{caseData.patient_name}님 케이스</span>
      </div>

      <div className="mb-6">
          <Link 
            href={`/caregiver/${token}/logs/${todayStr}`} 
            data-testid="today-log-button"
            className="block w-full bg-indigo-600 text-white text-center py-3 rounded-lg font-bold shadow hover:bg-indigo-700"
          >
              오늘 일지 작성하기 ✏️
          </Link>
      </div>

      <div className="space-y-3">
          {visibleDates.map((date) => {
              const dateStr = date.toISOString().split('T')[0];
              const log = logMap.get(dateStr);
              const isToday = dateStr === todayStr;

              return (
                  <Link 
                    key={dateStr}
                    href={`/caregiver/${token}/logs/${dateStr}`}
                    className="block border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 bg-white"
                  >
                      <div>
                          <div className="font-medium text-gray-900">
                              {date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                              {isToday && <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">오늘</span>}
                          </div>
                          {log && <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">{log.content.split('\n')[0]}...</div>}
                      </div>
                      <div>
                          {log ? (
                              <span className="text-green-600 text-sm font-bold">작성완료</span>
                          ) : (
                              <span className="text-gray-400 text-sm">미작성</span>
                          )}
                      </div>
                  </Link>
              )
          })}
      </div>
    </div>
  );
}

