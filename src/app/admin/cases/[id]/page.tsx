import { getAdminCase, getActivityLogs } from "@/modules/admin/actions";
import { Badge } from "@/modules/shared/components/Badge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPeriodEdit } from "./period-edit";
import { AdminForceEnd } from "./force-end";
import { AdminDeleteCase } from "./delete-case";

// 캐시 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminCaseDetailPage({ params }: { params: { id: string } }) {
  const caseData = await getAdminCase(params.id);
  
  if (!caseData) {
    notFound();
  }

  const activityLogs = await getActivityLogs(params.id);

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

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'CHANGE_PERIOD': '기간 수정',
      'FORCE_END': '강제 종료',
      'DELETE_CASE': '케이스 삭제',
      'EXTEND_CASE': '기간 연장',
      'EARLY_END': '조기 종료',
      'RESEND_LINK': '링크 재발송',
    };
    return labels[action] || action;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header - Supabase 스타일 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/cases" 
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>목록</span>
              </Link>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-sky-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
                  <p className="text-xs text-gray-500">케이스 상세</p>
                </div>
              </div>
            </div>
            <Badge status={caseData.status}>
              {getStatusLabel(caseData.status)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 max-w-7xl">
        {/* 케이스 기본 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">케이스 정보</h2>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 보호자 정보 */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  보호자 정보
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex">
                    <dt className="w-24 text-gray-500">이름:</dt>
                    <dd className="text-gray-900 font-medium">
                      {caseData.users?.full_name || caseData.users?.name || '-'}
                    </dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-gray-500">연락처:</dt>
                    <dd className="text-gray-900">{caseData.users?.phone || '-'}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-gray-500">이메일:</dt>
                    <dd className="text-gray-900">{caseData.users?.contact_email || '-'}</dd>
                  </div>
                </dl>
              </div>

              {/* 환자 정보 */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  환자 정보
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex">
                    <dt className="w-24 text-gray-500">환자명:</dt>
                    <dd className="text-gray-900 font-medium">{caseData.patient_name}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-gray-500">병원:</dt>
                    <dd className="text-gray-900">{caseData.hospital_name || '-'}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-gray-500">진단명:</dt>
                    <dd className="text-gray-900">{caseData.diagnosis || '-'}</dd>
                  </div>
                </dl>
              </div>

              {/* 간병 기간 */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  간병 기간
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex">
                    <dt className="w-24 text-gray-500">시작일:</dt>
                    <dd className="text-gray-900">{caseData.start_date}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-gray-500">종료 예정:</dt>
                    <dd className="text-gray-900">{caseData.end_date_expected}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-gray-500">실제 종료:</dt>
                    <dd className="text-gray-900">{caseData.end_date_final || '-'}</dd>
                  </div>
                </dl>
              </div>

              {/* 간병인 정보 */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  간병인 정보
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex">
                    <dt className="w-24 text-gray-500">이름:</dt>
                    <dd className="text-gray-900">{caseData.caregiver_name || '-'}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-gray-500">연락처:</dt>
                    <dd className="text-gray-900">{caseData.caregiver_phone || caseData.caregiver_contact || '-'}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-gray-500">동의일:</dt>
                    <dd className="text-gray-900">
                      {caseData.caregiver_agreed_at 
                        ? new Date(caseData.caregiver_agreed_at).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })
                        : '-'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 운영 도구 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 기간 수정 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">기간 수정</h3>
              <p className="text-xs text-gray-500 mt-1">과거 날짜 포함 자유롭게 수정 가능</p>
            </div>
            <div className="px-6 py-6">
              <AdminPeriodEdit caseId={params.id} caseData={caseData} />
            </div>
          </div>

          {/* 강제 종료 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">강제 종료</h3>
              <p className="text-xs text-gray-500 mt-1">케이스를 즉시 종료 처리</p>
            </div>
            <div className="px-6 py-6">
              <AdminForceEnd caseId={params.id} currentStatus={caseData.status} />
            </div>
          </div>
        </div>

        {/* 활동 로그 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">활동 로그</h3>
            <p className="text-xs text-gray-500 mt-1">케이스 관련 모든 변경 이력</p>
          </div>
          <div className="px-6 py-6">
            {activityLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">활동 이력이 없습니다</p>
            ) : (
              <div className="space-y-3">
                {activityLogs.map((log: any) => (
                  <div 
                    key={log.id}
                    className="border-l-4 border-primary pl-4 py-3 bg-gray-50 rounded-r"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {getActionLabel(log.action)}
                        </span>
                        {log.users && (
                          <span className="text-sm text-gray-500 ml-2">
                            by {log.users.full_name || log.users.name}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}
                      </span>
                    </div>
                    {log.meta && Object.keys(log.meta).length > 0 && (
                      <pre className="text-xs text-gray-600 bg-white p-2 rounded border mt-2 overflow-auto">
                        {JSON.stringify(log.meta, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 위험 구역 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-base font-semibold text-red-600">위험 구역</h3>
            <p className="text-xs text-gray-500 mt-1">삭제된 데이터는 복구할 수 없습니다</p>
          </div>
          <div className="px-6 py-6">
            <AdminDeleteCase caseId={params.id} patientName={caseData.patient_name} />
          </div>
        </div>
      </div>
    </div>
  );
}

