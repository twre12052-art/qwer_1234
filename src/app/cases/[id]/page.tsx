import { getCase, getCaseToken } from "@/modules/case/actions";
import { getPayment } from "@/modules/payment/actions";
import { createClient } from "@/modules/shared/lib/supabase/server";
import { Badge } from "@/modules/shared/components/Badge";
import { Card, CardHeader, CardBody } from "@/modules/shared/components/Card";
import { Timeline } from "@/modules/shared/components/Timeline";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CopyLinkButton } from "./copy-link-button"; 
import { PdfGenerateButton } from "./pdf-generate-button";
import { DeleteCaseButton } from "./delete-case-button";
import { RefreshButton } from "./refresh-button";
import { PdfDocumentsSection } from "./pdf-documents-section";
import { AttachmentsSection } from "./attachments-section";
import { CareLogsSection } from "./care-logs-section";
import { isAdmin } from "@/modules/shared/lib/admin-check";

// 캐시 비활성화: 항상 최신 상태 표시
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const caseData = await getCase(params.id);
  if (!caseData) notFound();

  // 어드민 여부 확인
  const adminUser = await isAdmin();
  
  // 권한 확인: 보호자이거나 어드민이어야 함
  if (caseData.guardian_id !== user.id && !adminUser) {
      return <div>권한이 없습니다.</div>;
  }

  const token = caseData.guardian_agreed_at ? await getCaseToken(params.id) : null;
  const payment = await getPayment(params.id);

  // Timeline Steps
  const timelineSteps = [
    {
      label: '계약 동의',
      completed: !!caseData.guardian_agreed_at,
      active: !caseData.guardian_agreed_at && caseData.status === 'GUARDIAN_PENDING',
    },
    {
      label: '간병인 매칭',
      completed: !!caseData.caregiver_agreed_at,
      active: caseData.status === 'CAREGIVER_PENDING',
    },
    {
      label: '간병 진행',
      completed: caseData.status === 'COMPLETED',
      active: caseData.status === 'IN_PROGRESS',
    },
    {
      label: '간병완료',
      completed: caseData.status === 'COMPLETED',
      active: false,
    },
    {
      label: '서류 완료',
      completed: caseData.status === 'COMPLETED' && !!payment,
      active: false,
    },
  ];

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
      {/* Header - 네이버 스타일 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-5 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/cases" 
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>목록</span>
              </Link>
              <div className="h-4 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">간병 상세</h1>
            </div>
            <div className="flex items-center gap-3">
              <RefreshButton />
              {/* 파일확인 및 다운 버튼 */}
              {(caseData.status === 'IN_PROGRESS' || caseData.status === 'COMPLETED') && (
                <a
                  href="#documents-section"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-lg hover:from-blue-600 hover:to-sky-600 transition-all text-sm font-medium shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  서류 다운로드
                </a>
              )}
              <Badge status={caseData.status}>
                {getStatusLabel(caseData.status)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* 케이스 삭제 - 최상단 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">간병 삭제</h2>
            <p className="text-sm text-gray-500 mt-1">
              삭제된 데이터는 복구할 수 없습니다
            </p>
          </div>
          <div className="px-6 py-6">
            <DeleteCaseButton caseId={params.id} />
          </div>
        </div>

        {/* Timeline Section - 네이버 스타일 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">진행 단계</h2>
          </div>
          <div className="px-6 py-6">
            <Timeline steps={timelineSteps} />
          </div>
        </div>

        {/* Summary Card - 네이버 스타일 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">간병 정보</h2>
            {payment ? (
              <span className="text-sm text-blue-600 font-medium flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                지급 정보 입력 완료
              </span>
            ) : (
              <span className="text-sm text-gray-400 font-medium">지급 정보 미입력</span>
            )}
          </div>
          <div className="px-6 py-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* 환자 정보 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-500">환자 정보</h3>
                </div>
                <p className="text-xl font-bold text-gray-900">{caseData.patient_name}</p>
              </div>

              {/* 병원 정보 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-500">병원</h3>
                </div>
                <p className="text-lg font-semibold text-gray-900">{caseData.hospital_name || '병원 미지정'}</p>
              </div>

              {/* 증상 */}
              {caseData.diagnosis && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-500">증상</h3>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{caseData.diagnosis}</p>
                </div>
              )}

              {/* 간병 기간 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-500">간병 기간</h3>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {caseData.start_date} ~ {caseData.end_date_final || caseData.end_date_expected}
                </p>
                <p className="text-gray-600 text-sm">일당 {caseData.daily_wage.toLocaleString()}원</p>
              </div>

              {/* 지정 간병인 */}
              {caseData.caregiver_name && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-500">지정 간병인</h3>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{caseData.caregiver_name}</p>
                  <p className="text-gray-600 text-sm">{caseData.caregiver_contact}</p>
                </div>
              )}

              {/* 기간 관리 */}
              {caseData.guardian_agreed_at && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-500">기간 관리</h3>
                  </div>
                  <div className="space-y-2">
                    <Link 
                      href={`/cases/${params.id}/edit-period?type=early`} 
                      data-testid="early-end-button"
                      className="block px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors text-sm font-medium text-red-700"
                    >
                      조기 종료
                    </Link>
                    <Link 
                      href={`/cases/${params.id}/edit-period?type=extend`} 
                      data-testid="extend-period-button"
                      className="block px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-sm font-medium text-blue-700"
                    >
                      기간 연장
                    </Link>
                  </div>
                </div>
              )}

              {/* 간병인 연결 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-500">간병인 연결</h3>
                </div>
                {!caseData.guardian_agreed_at ? (
                  <div>
                    <p className="text-sm text-gray-500 mb-3">계약서 동의 후 링크를 생성할 수 있습니다</p>
                    <Link
                      href={`/cases/${params.id}/agreement`}
                      data-testid="agreement-button"
                      className="inline-flex items-center gap-1.5 text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      계약서 동의하기
                    </Link>
                  </div>
                ) : (
                  <div>
                    {token ? (
                      <CopyLinkButton token={token} />
                    ) : (
                      <p className="text-sm text-red-600">링크 생성 중 오류가 발생했습니다</p>
                    )}
                  </div>
                )}
              </div>

              {/* 지급 정보 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-500">지급 정보</h3>
                </div>
                {payment ? (
                  <div>
                    <p className="text-xl font-bold text-gray-900">{payment.total_amount.toLocaleString()}원</p>
                    <p className="text-gray-600 text-sm mb-3">{payment.paid_at?.split('T')[0]} 지급 예정</p>
                    <Link 
                      href={`/cases/${params.id}/payment`} 
                      data-testid="payment-link"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      수정하기 →
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400 mb-3 text-sm">등록된 정보가 없습니다</p>
                    <Link 
                      href={`/cases/${params.id}/payment`} 
                      data-testid="payment-link"
                      className="inline-flex items-center gap-1.5 text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      입력하기
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 첨부파일 Card */}
        {(caseData.status === 'IN_PROGRESS' || caseData.status === 'COMPLETED') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">📎 추가 서류 첨부</h2>
              <p className="text-sm text-gray-500 mt-1">
                병원 영수증, 세부영수증, 입퇴원 확인서, 간호일지 등을 업로드하세요
              </p>
            </div>
            <div className="px-6 py-6">
              <AttachmentsSection caseId={params.id} />
            </div>
          </div>
        )}

        {/* 서류 생성 Card - 4가지 PDF + 간병일지 */}
        {(caseData.status === 'IN_PROGRESS' || caseData.status === 'COMPLETED') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200" id="documents-section">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">📄 보험 청구 서류 (5종)</h2>
              <p className="text-sm text-gray-500 mt-1">
                보험 청구에 필요한 모든 서류를 다운로드하세요
              </p>
            </div>
            <div className="px-6 py-6 space-y-6">
              <PdfDocumentsSection caseId={params.id} caregiverAgreed={!!caseData.caregiver_agreed_at} />
            </div>
          </div>
        )}

      </div>
      
    </div>
  );
}
