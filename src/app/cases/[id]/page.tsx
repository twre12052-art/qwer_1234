import { getCase, getCaseToken } from "@/modules/case/actions";
import { getPayment } from "@/modules/payment/actions";
import { createClient } from "@/modules/shared/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CopyLinkButton } from "./copy-link-button"; 
import { PdfGenerateButton } from "./pdf-generate-button";

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const caseData = await getCase(params.id);
  if (!caseData) notFound();

  if (caseData.guardian_id !== user.id) {
      return <div>권한이 없습니다.</div>;
  }

  const token = caseData.guardian_agreed_at ? await getCaseToken(params.id) : null;
  const payment = await getPayment(params.id);

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/cases" className="text-gray-600 hover:text-gray-900">
          &larr; 목록으로 돌아가기
        </Link>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          caseData.status === 'GUARDIAN_PENDING' ? 'bg-yellow-100 text-yellow-800' :
          caseData.status === 'CAREGIVER_PENDING' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {caseData.status === 'GUARDIAN_PENDING' ? '보호자 동의 대기' :
           caseData.status === 'CAREGIVER_PENDING' ? '간병인 연결 대기' :
           caseData.status}
        </span>
      </div>

      {/* M3-WP1: Payment Summary at Top? or Separate section? 
          Scenario M3-WP1-1 says "케이스 상세 상단에 지급 정보 요약".
          Let's put it below Case Info for now or inside it.
       */}

      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">케이스 상세 정보</h2>
          {/* Payment Summary Badge or Text */}
          {payment ? (
              <span className="text-sm text-green-600 font-bold">지급 정보 입력됨</span>
          ) : (
              <span className="text-sm text-gray-400">지급 정보 미입력</span>
          )}
        </div>
        <div className="p-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-gray-500">환자 정보</h3>
            <p className="mt-1 text-lg">{caseData.patient_name}</p>
            <p className="text-gray-600">{caseData.hospital_name} / {caseData.diagnosis}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">간병 기간</h3>
            <p className="mt-1 text-lg">
              {caseData.start_date} ~ {caseData.end_date_final || caseData.end_date_expected}
            </p>
            <p className="text-gray-600">1일 {caseData.daily_wage.toLocaleString()}원</p>
          </div>
          {caseData.caregiver_name && (
            <div>
               <h3 className="text-sm font-medium text-gray-500">지정 간병인</h3>
               <p className="mt-1">{caseData.caregiver_name} ({caseData.caregiver_contact})</p>
            </div>
          )}
          {/* Payment Info Section */}
          <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">지급 정보</h3>
              {payment ? (
                  <div>
                      <p className="text-lg font-bold">{payment.total_amount.toLocaleString()}원</p>
                      <p className="text-gray-600">{payment.paid_at?.split('T')[0]} 지급 예정</p>
                      <Link 
                        href={`/cases/${params.id}/payment`} 
                        data-testid="payment-link"
                        className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                      >
                          수정하기
                      </Link>
                  </div>
              ) : (
                  <div>
                      <p className="text-gray-400 mb-2">등록된 정보가 없습니다.</p>
                      <Link 
                        href={`/cases/${params.id}/payment`} 
                        data-testid="payment-link"
                        className="text-sm bg-gray-100 px-3 py-1 rounded border hover:bg-gray-200 inline-block"
                      >
                          입력하기
                      </Link>
                  </div>
              )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
           <h2 className="text-xl font-bold">간병인 연결</h2>
        </div>
        <div className="p-6">
          {!caseData.guardian_agreed_at ? (
            <div className="text-center py-6">
              <p className="mb-4 text-gray-600">
                간병인에게 초대 링크를 보내려면 먼저 계약서에 동의해야 합니다.
              </p>
              <Link
                href={`/cases/${params.id}/agreement`}
                data-testid="agreement-button"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium"
              >
                계약서 확인/동의하기
              </Link>
            </div>
          ) : (
            <div>
                <p className="mb-4 text-gray-600">
                    아래 링크를 간병인에게 전달하여 간병을 시작하세요.
                </p>
                {token ? (
                    <CopyLinkButton token={token} />
                ) : (
                    <p className="text-red-500">링크 생성 중 오류가 발생했습니다.</p>
                )}
            </div>
          )}
        </div>
      </div>

      {caseData.guardian_agreed_at && (
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
           <div className="px-6 py-4 border-b">
             <h2 className="text-xl font-bold">기간 관리</h2>
           </div>
           <div className="p-6 flex gap-4">
             <Link href={`/cases/${params.id}/edit-period?type=early`} data-testid="early-end-button" className="text-red-600 hover:underline">간병 조기 종료</Link>
             <Link href={`/cases/${params.id}/edit-period?type=extend`} data-testid="extend-period-button" className="text-blue-600 hover:underline">간병 연장</Link>
           </div>
        </div>
      )}

      {/* M3-WP4: PDF Generation Button */}
      {caseData.status === 'IN_PROGRESS' || caseData.status === 'COMPLETED' ? (
          <PdfGenerateButton caseId={params.id} />
      ) : null}
      
    </div>
  );
}
