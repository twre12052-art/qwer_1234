import { getAllCases } from "@/modules/admin/actions";
import { Badge } from "@/modules/shared/components/Badge";
import { LogoutButton } from "./logout-button";
import Link from "next/link";

// 캐시 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminCasesPage() {
  const cases = await getAllCases();

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'GUARDIAN_PENDING': '보호자 동의 대기',
      'CAREGIVER_PENDING': '간병인 연결 대기',
      'IN_PROGRESS': '진행 중',
      'COMPLETED': '완료',
      'CANCELED': '취소됨'
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Supabase 스타일 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-sky-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
                  <p className="text-xs text-gray-500">간병노트 운영 관리</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6 max-w-7xl">
        {/* Stats Cards - Supabase 스타일 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">전체 케이스</p>
                <p className="text-2xl font-bold text-gray-900">{cases.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">진행 중</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cases.filter(c => c.status === 'IN_PROGRESS').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">완료</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cases.filter(c => c.status === 'COMPLETED').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">취소</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cases.filter(c => c.status === 'CANCELED').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Cases Table - Supabase 스타일 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">전체 케이스 관리</h2>
            <p className="text-xs text-gray-500 mt-1">모든 보호자의 케이스를 관리할 수 있습니다</p>
          </div>
          <div className="overflow-x-auto">
            {cases.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                등록된 케이스가 없습니다
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">보호자</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">환자</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">병원</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">기간</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">생성일</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cases.map((caseItem: any) => (
                    <tr key={caseItem.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {caseItem.users?.full_name || caseItem.users?.name || '-'}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {caseItem.users?.phone || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{caseItem.patient_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600">{caseItem.hospital_name || '-'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="text-gray-900">{caseItem.start_date}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            ~ {caseItem.end_date_final || caseItem.end_date_expected}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={caseItem.status}>
                          {getStatusLabel(caseItem.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-500">
                          {new Date(caseItem.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/admin/cases/${caseItem.id}`}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          관리
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
