import { getCases } from "@/modules/case/actions";
import { createClient } from "@/modules/shared/lib/supabase/server";
import { Badge } from "@/modules/shared/components/Badge";
import { Card, CardBody } from "@/modules/shared/components/Card";
import { LogoutButton } from "./logout-button";
import Link from "next/link";
import { redirect } from "next/navigation";

// 캐시 비활성화: 항상 최신 데이터 표시
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CasesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
      redirect("/login");
  }

  const cases = await getCases();

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'GUARDIAN_PENDING': '계약 대기',
      'CAREGIVER_PENDING': '간병인 대기',
      'IN_PROGRESS': '진행 중',
      'COMPLETED': '완료',
      'CANCELED': '취소됨'
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-sky-50 to-blue-50">
      {/* Header - 깔끔한 파란색 스타일 */}
      <div className="bg-white/80 backdrop-blur-md border-b border-blue-200 shadow-sm">
        <div className="container mx-auto px-6 py-5 max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">💙</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent">
                  간병 관리
                </h1>
                <p className="text-sm text-blue-600 flex items-center gap-1">
                  <span>✨</span>
                  등록한 간병을 관리하고 진행 상황을 확인하세요
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <LogoutButton />
              <Link
                href="/cases/new"
                data-testid="create-case-button"
                className="bg-gradient-to-r from-blue-400 to-sky-400 text-white px-6 py-2.5 rounded-full hover:from-blue-500 hover:to-sky-500 transition-all font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  + 새 간병 등록
                  <span>✨</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Filter Tabs - 깔끔한 파란색 스타일 */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
          {['전체', '진행 중', '예정', '완료', '취소'].map((tab, idx) => (
            <button
              key={idx}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                idx === 0 
                  ? 'bg-gradient-to-r from-blue-400 to-sky-400 text-white shadow-lg' 
                  : 'bg-white/80 backdrop-blur-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-2 border-blue-200 hover:border-blue-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Cases List */}
        {cases.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-3xl p-10 border-2 border-blue-200 shadow-xl">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-200 to-sky-200 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <span className="text-5xl">💙</span>
              </div>
              <p className="text-gray-800 text-xl mb-3 font-bold">등록된 간병이 없습니다</p>
              <p className="text-blue-600 text-base mb-8 flex items-center gap-2">
                <span>✨</span>
                첫 간병을 등록하고 관리해보세요
              </p>
              <Link
                href="/cases/new"
                className="px-8 py-4 bg-gradient-to-r from-blue-400 to-sky-400 text-white rounded-2xl font-bold hover:from-blue-500 hover:to-sky-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-base"
              >
                <span className="flex items-center gap-2">
                  새 간병 등록하기
                  <span>✨</span>
                </span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((c) => (
              <Link href={`/cases/${c.id}`} key={c.id} className="block group">
                <Card className="h-full hover:shadow-2xl transition-all border-2 border-blue-100 bg-white/80 backdrop-blur-sm rounded-2xl transform hover:-translate-y-2">
                  <CardBody className="flex flex-col justify-between h-full p-6">
                    <div>
                      {/* Header with Badge */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-800 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-sky-500 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                            {c.patient_name} 님
                            <span className="ml-2 text-lg">💙</span>
                          </h3>
                        </div>
                        <Badge status={c.status}>
                          {getStatusLabel(c.status)}
                        </Badge>
                      </div>

                      {/* Hospital Info */}
                      <div className="flex items-center gap-2 mb-2 text-gray-600">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-sm">{c.hospital_name || '병원 미지정'}</span>
                      </div>

                      {/* Period Info */}
                      <div className="flex items-center gap-2 text-gray-500 mb-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs">
                          {c.start_date} ~ {c.end_date_final || c.end_date_expected}
                        </span>
                      </div>
                    </div>

                    {/* Footer with Daily Wage */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">일당</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {c.daily_wage.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

