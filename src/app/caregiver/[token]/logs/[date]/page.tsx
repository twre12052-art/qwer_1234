import { getCaseByToken } from "@/modules/caregiver/actions";
import { getCareLogByToken, upsertCareLog } from "@/modules/careLog/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogForm } from "./log-form";
import { isAdmin } from "@/modules/shared/lib/admin-check";

export default async function DailyLogPage({ params }: { params: { token: string; date: string } }) {
  const { token, date } = params;
  const res = await getCaseByToken(token);

  if (res.error || !res.caseData) {
      return <div className="p-8 text-center">{res.error || "오류가 발생했습니다."}</div>;
  }
  const { caseData } = res;

  if (!caseData.caregiver_agreed_at) {
      redirect(`/caregiver/${token}`);
  }

  const targetDate = new Date(date);
  const startDate = new Date(caseData.start_date);
  const endDate = new Date(caseData.end_date_final || caseData.end_date_expected);
  
  if (targetDate < startDate || targetDate > endDate) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm">
                  <h2 className="text-xl font-bold text-red-600 mb-2">유효하지 않은 날짜입니다</h2>
                  <p className="text-gray-600 mb-4 text-sm">
                      간병 기간({caseData.start_date} ~ {caseData.end_date_final || caseData.end_date_expected}) 내의 날짜만 작성 가능합니다.
                  </p>
                  <Link href={`/caregiver/${token}/logs`} className="text-blue-600 underline text-sm">
                      목록으로 돌아가기
                  </Link>
              </div>
          </div>
      );
  }

  const existingLog = await getCareLogByToken(token, date);
  const adminUser = await isAdmin(); // 어드민 여부 확인

  async function handleSave(formData: FormData) {
      "use server";
      await upsertCareLog(token, date, formData, adminUser);
  }

  const rawContent = existingLog?.content || "";
  let initialMemo = rawContent;
  const checkedItems = new Set<string>();

  if (rawContent.includes("[수행 항목]")) {
      const parts = rawContent.split("[메모]");
      const itemsPart = parts[0].replace("[수행 항목]", "").trim();
      const memoPart = parts[1]?.trim() || "";
      
      initialMemo = memoPart;
      itemsPart.split(",").forEach(i => checkedItems.add(i.trim()));
  }

  const dateStr = new Date(date).toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 - Supabase 스타일 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 max-w-lg">
          <div className="flex items-center gap-3">
            <Link 
              href={`/caregiver/${token}/logs`} 
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">{dateStr}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                간병 기간: {caseData.start_date} ~ {caseData.end_date_final || caseData.end_date_expected}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-lg">
        <form action={handleSave} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 space-y-5">
            <LogForm
              initialMemo={initialMemo}
              checkedItems={checkedItems}
              initialSignature={existingLog?.signature_data || null}
              isSigned={adminUser} // 어드민이면 수정 가능
            />
        </form>
      </div>
    </div>
  );
}
