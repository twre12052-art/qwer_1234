import { getCases } from "@/modules/case/actions";
import { logout } from "@/modules/auth/actions";
import { createClient } from "@/modules/shared/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CasesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
      redirect("/login");
  }

  const cases = await getCases();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">내 케이스 목록</h1>
        <div className="flex gap-2">
           <form action={async () => {
             "use server";
             // Note: We need to import logout from auth/actions. 
             // Since this is async server component body, we can't easily use client events or import action directly in form without wrapper 
             // IF the action is not bound. But Next.js allows passing server action to action prop.
             // We need to import it.
           }}>
             {/* Wait, I can import `logout` and pass it. */}
           </form>
           <form action={logout}>
             <button type="submit" className="text-gray-600 hover:text-gray-900 px-3 py-2">
               로그아웃
             </button>
           </form>
           <Link
            href="/cases/new"
            data-testid="create-case-button"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            새 간병 등록
          </Link>
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg mb-4">내 케이스가 없습니다.</p>
          <p className="text-gray-400 text-sm">새로운 간병을 시작해보세요.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <Link href={`/cases/${c.id}`} key={c.id} className="block">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{c.patient_name} 님</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      c.status === 'GUARDIAN_PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      c.status === 'CAREGIVER_PENDING' ? 'bg-blue-100 text-blue-800' :
                      c.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {c.status === 'GUARDIAN_PENDING' ? '계약 대기' :
                       c.status === 'CAREGIVER_PENDING' ? '간병인 대기' :
                       c.status === 'IN_PROGRESS' ? '진행 중' : c.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{c.hospital_name || '병원 미지정'}</p>
                  <p className="text-gray-500 text-xs">
                    {c.start_date} ~ {c.end_date_final || c.end_date_expected}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

