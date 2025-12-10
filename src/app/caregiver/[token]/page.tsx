import { agreeCaregiver, getCaseByToken } from "@/modules/caregiver/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BackButton } from "./back-button";
import { PrivacyViewButton } from "./privacy-view-button";

export default async function CaregiverEntryPage({ params }: { params: { token: string } }) {
  const { token } = params;
  const res = await getCaseByToken(token);
  
  if (res.error || !res.caseData) {
      return (
          <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
              <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                  <div className="text-red-500 text-4xl mb-4">⚠️</div>
                  <h1 className="text-xl font-bold mb-2">링크 오류</h1>
                  <p className="text-gray-600">{res.error || "케이스를 찾을 수 없습니다."}</p>
              </div>
          </div>
      );
  }

  const { caseData } = res;

  // 이미 동의 완료된 경우 바로 일지 작성 페이지로 리다이렉트
  if (caseData.caregiver_agreed_at) {
      redirect(`/caregiver/${token}/logs`);
  }

  async function handleAgree(formData: FormData) {
      "use server";
      await agreeCaregiver(token, caseData.id, formData);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-lg">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">가족간병 신청서 작성</h1>
          <p className="text-sm text-gray-600">보호자가 요청한 간병 내용을 확인하고 동의해주세요.</p>
        </div>

        {/* 진행 단계 표시 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm mb-1">
                1
              </div>
              <span className="text-xs text-blue-500 font-medium">신청자 정보</span>
            </div>
            <div className="w-12 h-0.5 bg-blue-300 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm mb-1">
                2
              </div>
              <span className="text-xs text-blue-500 font-medium">환자 정보</span>
            </div>
            <div className="w-12 h-0.5 bg-blue-300 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm mb-1">
                3
              </div>
              <span className="text-xs text-blue-500 font-medium">간병인 정보</span>
            </div>
          </div>
        </div>

        {/* 간병 내용 요약 카드 - Supabase 스타일 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
          <div className="px-4 py-3 border-b border-gray-100 mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              간병 내용 요약
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex">
              <span className="text-sm text-gray-600 w-24 flex-shrink-0">환자명:</span>
              <span className="text-sm font-medium text-gray-900">{caseData.patient_name}</span>
            </div>
            <div className="flex">
              <span className="text-sm text-gray-600 w-24 flex-shrink-0">병원:</span>
              <span className="text-sm font-medium text-gray-900">{caseData.hospital_name || "미지정"}</span>
            </div>
            <div className="flex">
              <span className="text-sm text-gray-600 w-24 flex-shrink-0">기간:</span>
              <span className="text-sm font-medium text-gray-900">
                {caseData.start_date} ~ {caseData.end_date_final || caseData.end_date_expected}
              </span>
            </div>
            <div className="flex">
              <span className="text-sm text-gray-600 w-24 flex-shrink-0">일당:</span>
              <span className="text-sm font-medium text-gray-900">{caseData.daily_wage?.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        {/* 간병인 정보 입력 폼 - Supabase 스타일 */}
        <form action={handleAgree} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 space-y-5">
          <div className="px-4 py-3 border-b border-gray-100 mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              간병인 정보
            </h2>
          </div>
          
          {/* 성함 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              간병인의 이름을 입력해 주세요.
            </label>
            <input 
              name="caregiver_name" 
              defaultValue={caseData.caregiver_name || ""} 
              required 
              data-testid="caregiver-name-input" 
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="이름 입력"
            />
          </div>
          
          {/* 연락처 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              간병인의 휴대폰 번호를 입력해 주세요.
            </label>
            <input 
              name="caregiver_phone" 
              defaultValue={caseData.caregiver_contact || ""} 
              required 
              data-testid="caregiver-phone-input" 
              placeholder="'-'없이 숫자만 입력" 
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              간병인의 생년월일 여섯자리와 주민번호 뒷자리 첫번째 숫자를 입력해주세요.
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input 
                name="caregiver_birth_date" 
                required 
                data-testid="caregiver-birth-input" 
                placeholder="예: 800101" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
              <input 
                name="caregiver_birth_last" 
                type="text" 
                maxLength={1}
                placeholder="2******" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
          </div>

          {/* 주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소
            </label>
            <input 
              name="address" 
              required 
              data-testid="caregiver-address-input" 
              placeholder="서울시 ..." 
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>

          {/* 계좌 정보 */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              간병인의 계좌번호를 알려주세요.
            </label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-blue-800">
                  정확한 은행명과 계좌번호를 입력해 주세요. 추후 서류 발급 과정에서 실제로 간병한 간병인의 계좌번호가 아닐 시 발급이 어려울 수 있습니다.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <input 
                  name="caregiver_account_bank" 
                  required 
                  data-testid="caregiver-bank-input" 
                  placeholder="NH농협은행" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <input 
                  name="caregiver_account_number" 
                  required 
                  data-testid="caregiver-account-input" 
                  placeholder="계좌번호 (하이픈 없이)" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            </div>
          </div>

          {/* 기타 문의 사항 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              기타 문의 사항
            </label>
            <textarea 
              name="other_inquiries"
              placeholder="기타 문의사항을 입력해 주세요." 
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" 
            />
          </div>

          {/* 동의 체크박스 */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">개인정보 수집 및 이용 동의</span>
              <PrivacyViewButton />
            </div>
            <div className="flex items-start gap-2 mb-3">
              <input 
                type="checkbox" 
                required 
                id="agree" 
                data-testid="caregiver-agree-checkbox" 
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
              />
              <label htmlFor="agree" className="text-sm text-gray-700">
                위 내용을 확인하였으며, 간병 업무를 성실히 수행할 것을 동의합니다.
              </label>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3 pt-4">
            <BackButton />
            <button 
              type="submit" 
              data-testid="caregiver-submit-button" 
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
