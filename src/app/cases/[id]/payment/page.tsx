import Link from "next/link";
import { getPayment, savePayment } from "@/modules/payment/actions";
import { getCase } from "@/modules/case/actions";
import { createClient } from "@/modules/shared/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

export default async function PaymentPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const caseData = await getCase(params.id);
  if (!caseData) notFound();
  if (caseData.guardian_id !== user.id) return <div>권한이 없습니다.</div>;

  const payment = await getPayment(params.id);

  // Calculate total days
  const start = new Date(caseData.start_date);
  const end = new Date(caseData.end_date_final || caseData.end_date_expected);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Including start date
  
  const suggestedAmount = diffDays * caseData.daily_wage;

  async function handleSave(formData: FormData) {
      "use server";
      await savePayment(params.id, formData);
  }

  return (
    <div className="container mx-auto p-6 max-w-lg">
       <Link href={`/cases/${params.id}`} className="text-gray-600 mb-4 inline-block">
         &larr; 취소
      </Link>
      <h1 className="text-2xl font-bold mb-6">지급 정보 입력</h1>

      <div className="bg-gray-50 p-4 rounded mb-6 text-sm text-gray-700 space-y-1">
          <p><span className="font-bold">총 간병 기간:</span> {diffDays}일</p>
          <p><span className="font-bold">1일 간병비:</span> {caseData.daily_wage.toLocaleString()}원</p>
          <p><span className="font-bold">예상 총액:</span> {suggestedAmount.toLocaleString()}원</p>
      </div>

      <form action={handleSave} className="space-y-6 bg-white p-6 border rounded-lg">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                  총 지급액 (원)
              </label>
              <input 
                type="number" 
                name="total_amount" 
                defaultValue={payment?.total_amount ?? suggestedAmount}
                required 
                data-testid="payment-amount-input"
                className="w-full border rounded-md px-3 py-2"
              />
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                  지급일 (예정일)
              </label>
              <input 
                type="date" 
                name="paid_at" 
                defaultValue={payment?.paid_at?.split('T')[0]}
                required 
                data-testid="payment-date-input"
                className="w-full border rounded-md px-3 py-2"
              />
          </div>

          {/* Payment Method - not saving to DB as per schema limitation, but UI requested */}
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                  지급 방식 (선택)
              </label>
              <select name="method" className="w-full border rounded-md px-3 py-2">
                  <option value="account">계좌 이체</option>
                  <option value="cash">현금</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">* 현재 버전에서는 저장되지 않으며 PDF 출력 시 참조용으로 사용될 수 있습니다.</p>
          </div>

          <button type="submit" data-testid="save-payment-button" className="w-full bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700">
              저장하기
          </button>
      </form>
    </div>
  );
}

