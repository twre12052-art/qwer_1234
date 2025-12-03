import { getCase, endCaseEarly, extendCase } from "@/modules/case/actions";
import { createClient } from "@/modules/shared/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditPeriodPage({ 
    params, 
    searchParams 
}: { 
    params: { id: string }, 
    searchParams: { type: string } 
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const caseData = await getCase(params.id);
  if (!caseData) notFound();
  if (caseData.guardian_id !== user.id) return <div>권한이 없습니다.</div>;

  const type = searchParams.type;
  const isEarly = type === 'early';
  const currentEndDate = caseData.end_date_final || caseData.end_date_expected;

  async function updatePeriod(formData: FormData) {
      "use server";
      const newDate = formData.get("newDate") as string;
      
      if (isEarly) {
          await endCaseEarly(params.id, newDate);
      } else {
          await extendCase(params.id, newDate);
      }
  }

  return (
    <div className="container mx-auto p-6 max-w-xl">
       <Link href={`/cases/${params.id}`} className="text-gray-600 mb-4 inline-block">
         &larr; 취소
      </Link>
      <h1 className="text-2xl font-bold mb-6">
          {isEarly ? "간병 조기 종료" : "간병 기간 연장"}
      </h1>

      <div className="bg-yellow-50 p-4 rounded-md mb-6 border border-yellow-200 text-yellow-800 text-sm">
          현재 종료일: <strong>{currentEndDate}</strong>
      </div>

      <form action={updatePeriod} className="space-y-6 bg-white p-6 border rounded-lg">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                  변경할 종료일
              </label>
              <input 
                type="date" 
                name="newDate" 
                required 
                data-testid="period-date-input"
                className="w-full border rounded-md px-3 py-2"
                // Minimal validation hints
                max={isEarly ? new Date().toISOString().split('T')[0] : undefined}
                min={!isEarly ? currentEndDate : undefined}
              />
              {isEarly && (
                  <p className="text-xs text-gray-500 mt-1">
                      * 조기 종료 시 오늘 또는 과거 날짜로 설정합니다.
                  </p>
              )}
              {!isEarly && (
                  <p className="text-xs text-gray-500 mt-1">
                      * 연장 시 기존 종료일보다 늦은 날짜를 선택해주세요.
                  </p>
              )}
          </div>

          <div className="pt-4">
              <button type="submit" data-testid="save-period-button" className={`w-full py-3 rounded-md text-white font-bold ${isEarly ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {isEarly ? "종료하기" : "연장하기"}
              </button>
          </div>
      </form>
    </div>
  );
}

