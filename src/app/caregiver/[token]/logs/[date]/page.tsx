import { getCaseByToken } from "@/modules/caregiver/actions";
import { getCareLog, upsertCareLog } from "@/modules/careLog/actions";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DailyLogPage({ params }: { params: { token: string; date: string } }) {
  const { token, date } = params;
  const res = await getCaseByToken(token);

  if (res.error || !res.caseData) {
      return <div className="p-8 text-center">{res.error || "오류가 발생했습니다."}</div>;
  }
  const { caseData } = res;

  // M2-WP4: Redirect if not agreed
  if (!caseData.caregiver_agreed_at) {
      redirect(`/caregiver/${token}`);
  }

  // M2-WP4: Date validation
  const targetDate = new Date(date);
  const startDate = new Date(caseData.start_date);
  const endDate = new Date(caseData.end_date_final || caseData.end_date_expected);
  
  if (targetDate < startDate || targetDate > endDate) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
              <div className="bg-white p-6 rounded shadow text-center max-w-sm">
                  <h2 className="text-xl font-bold text-red-600 mb-2">유효하지 않은 날짜입니다</h2>
                  <p className="text-gray-600 mb-4">
                      간병 기간({caseData.start_date} ~ {caseData.end_date_final || caseData.end_date_expected}) 내의 날짜만 작성 가능합니다.
                  </p>
                  <Link href={`/caregiver/${token}/logs`} className="text-indigo-600 underline">
                      목록으로 돌아가기
                  </Link>
              </div>
          </div>
      );
  }

  const existingLog = await getCareLog(caseData.id, date);

  async function handleSave(formData: FormData) {
      "use server";
      await upsertCareLog(token, date, formData);
  }

  // Parse existing content if it follows our format "[수행 항목] ... [메모] ..."
  // Or just show raw content in textarea if simple.
  // Let's try to parse for checkboxes if possible, otherwise defaults.
  // Format: `[수행 항목]\nItems...\n\n[메모]\nContent...`
  
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

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <div className="flex items-center mb-6">
         <Link href={`/caregiver/${token}/logs`} className="text-gray-500 mr-4 text-xl">
             &larr;
         </Link>
         <h1 className="text-xl font-bold">
             {new Date(date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
         </h1>
      </div>

      <form action={handleSave} className="bg-white rounded-lg shadow p-6 space-y-6">
          
          {/* Checkboxes (M2-WP3) */}
          <div>
              <h2 className="font-bold text-gray-800 mb-3">수행 항목</h2>
              <div className="space-y-3">
                  {[
                      { id: "meal", label: "식사 보조", value: "식사 보조" },
                      { id: "position", label: "체위 변경", value: "체위 변경" },
                      { id: "medication", label: "투약", value: "투약" },
                      { id: "mobility", label: "이동 도움", value: "이동 도움" },
                      { id: "toilet", label: "배변/배뇨 도움", value: "배변/배뇨 도움" },
                  ].map((item) => (
                      <div key={item.id} className="flex items-center">
                          <input 
                            type="checkbox" 
                            name={item.id} 
                            id={item.id} 
                            data-testid={`checklist-${item.id}`}
                            defaultChecked={checkedItems.has(item.value)}
                            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                          />
                          <label htmlFor={item.id} className="ml-3 text-gray-700">
                              {item.label}
                          </label>
                      </div>
                  ))}
              </div>
          </div>

          {/* Memo */}
          <div>
              <h2 className="font-bold text-gray-800 mb-2">상세 메모</h2>
              <textarea 
                name="content" 
                defaultValue={initialMemo}
                data-testid="log-memo-input"
                placeholder="오늘 환자분의 상태나 특이사항을 기록해주세요."
                className="w-full border border-gray-300 rounded-md p-3 h-32 focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
          </div>

          <button type="submit" data-testid="save-log-button" className="w-full bg-indigo-600 text-white py-3 rounded-md font-bold hover:bg-indigo-700 shadow">
              저장하기
          </button>
      </form>
    </div>
  );
}

