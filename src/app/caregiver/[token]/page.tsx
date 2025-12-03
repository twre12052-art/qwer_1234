import { agreeCaregiver, getCaseByToken } from "@/modules/caregiver/actions";
import { redirect } from "next/navigation";
import Link from "next/link";

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

  // M2-WP2: Already agreed?
  if (caseData.caregiver_agreed_at) {
      return (
          <div className="container mx-auto p-6 max-w-md">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                  <h2 className="text-xl font-bold mb-4">이미 동의 완료된 간병입니다</h2>
                  <p className="text-gray-600 mb-6">간병일지를 작성하러 가시겠습니까?</p>
                  <Link href={`/caregiver/${token}/logs`} className="block w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 font-bold">
                      간병일지 작성하러 가기
                  </Link>
              </div>
          </div>
      );
  }

  async function handleAgree(formData: FormData) {
      "use server";
      await agreeCaregiver(token, caseData.id, formData);
  }

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">간병인 매칭 동의</h1>
        <p className="text-gray-600 text-sm">보호자가 요청한 간병 내용을 확인하고 동의해주세요.</p>
      </header>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
        <h2 className="font-bold text-lg mb-3 text-blue-900">간병 내용 요약</h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li><span className="font-semibold w-20 inline-block">환자명:</span> {caseData.patient_name}</li>
          <li><span className="font-semibold w-20 inline-block">병원:</span> {caseData.hospital_name || "미지정"}</li>
          <li><span className="font-semibold w-20 inline-block">기간:</span> {caseData.start_date} ~ {caseData.end_date_final || caseData.end_date_expected}</li>
          <li><span className="font-semibold w-20 inline-block">일당:</span> {caseData.daily_wage.toLocaleString()}원</li>
        </ul>
      </div>

      <form action={handleAgree} className="space-y-6 bg-white rounded-lg shadow p-6">
         <h2 className="font-bold text-lg border-b pb-2">간병인 정보 입력</h2>
         
         {/* Pre-fill name/contact if available from guardian input, but usually caregiver enters own info accurately */}
         <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">성함</label>
             <input name="caregiver_name" defaultValue={caseData.caregiver_name || ""} required data-testid="caregiver-name-input" className="w-full border rounded px-3 py-2" />
         </div>
         
         <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
             <input name="caregiver_phone" defaultValue={caseData.caregiver_contact || ""} required data-testid="caregiver-phone-input" placeholder="010-0000-0000" className="w-full border rounded px-3 py-2" />
         </div>

         <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">생년월일 (주민번호 앞자리)</label>
             <input name="caregiver_birth_date" required data-testid="caregiver-birth-input" placeholder="예: 800101" className="w-full border rounded px-3 py-2" />
         </div>

         <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
             <input name="address" required data-testid="caregiver-address-input" placeholder="서울시 ..." className="w-full border rounded px-3 py-2" />
             {/* Address is not in DB schema yet. I'll handle it in action (ignore or store in meta/future col) 
                 Wait, I should probably add it to schema? Or I can just ignore for now as I decided in previous step.
                 Wait, actually M2-WP2 says "주소" is required. 
                 I'll just add it to the form. The action will receive it. 
                 If I didn't add column, it will fail or I drop it. 
                 Let's stick to schema: I will add a migration file or just ignore it in action to avoid error, 
                 but to be "safe", I should add it. 
                 However, I am not allowed to run migrations on user's behalf easily if they didn't ask?
                 But I am "implementing plan". Plan implies schema updates if needed. 
                 I'll add a migration step or just 'alter table' in schema.sql and tell user to run it.
              */}
         </div>

         <div className="pt-4 border-t">
             <h2 className="font-bold text-lg mb-3">정산 계좌 정보</h2>
             <div className="grid grid-cols-3 gap-2 mb-3">
                 <div className="col-span-1">
                     <label className="block text-sm font-medium text-gray-700 mb-1">은행</label>
                     <input name="caregiver_account_bank" required data-testid="caregiver-bank-input" placeholder="은행명" className="w-full border rounded px-3 py-2" />
                 </div>
                 <div className="col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-1">계좌번호</label>
                     <input name="caregiver_account_number" required data-testid="caregiver-account-input" placeholder="계좌번호 (하이픈 없이)" className="w-full border rounded px-3 py-2" />
                 </div>
             </div>
         </div>

         <div className="flex items-start gap-2 pt-4 bg-gray-50 p-3 rounded">
             <input type="checkbox" required id="agree" data-testid="caregiver-agree-checkbox" className="mt-1" />
             <label htmlFor="agree" className="text-sm text-gray-700">
                 위 내용을 확인하였으며, 간병 업무를 성실히 수행할 것을 동의합니다.
             </label>
         </div>

         <button type="submit" data-testid="caregiver-submit-button" className="w-full bg-indigo-600 text-white py-3 rounded-md font-bold hover:bg-indigo-700">
             동의하고 시작하기
         </button>
      </form>
    </div>
  );
}

