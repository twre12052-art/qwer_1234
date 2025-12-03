export default function PrivacyPage() {
  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">개인정보 처리방침</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3">1. 개인정보의 처리 목적</h2>
          <p className="text-gray-700 leading-relaxed">
            케어 서비스 플랫폼(이하 '회사')은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
          </p>
          <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
            <li>간병인 매칭 및 계약 체결</li>
            <li>간병일지 작성 및 관리</li>
            <li>보험 청구용 서류(계약서, 확인서 등) 생성</li>
            <li>서비스 이용에 따른 본인 확인 및 식별</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">2. 개인정보의 처리 및 보유 기간</h2>
          <p className="text-gray-700 leading-relaxed">
            회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
          </p>
          <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
            <li>회원 가입 및 관리: 회원 탈퇴 시까지</li>
            <li>계약 및 간병 기록: <strong>5년</strong> (전자상거래 등에서의 소비자 보호에 관한 법률)</li>
            <li>대금 결제 및 재화 등의 공급에 관한 기록: <strong>5년</strong></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. 처리하는 개인정보의 항목</h2>
          <p className="text-gray-700 leading-relaxed mb-2">회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-bold mb-2">[보호자]</h3>
            <ul className="list-disc pl-6 mb-4 text-sm">
               <li>이름, 이메일, 휴대전화번호</li>
               <li>환자 정보(이름, 병원, 진단명)</li>
            </ul>
            <h3 className="font-bold mb-2">[간병인]</h3>
            <ul className="list-disc pl-6 text-sm">
               <li>이름, 휴대전화번호, 주소</li>
               <li>생년월일 (또는 주민등록번호 앞자리)</li>
               <li>계좌번호, 은행명</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">4. 개인정보의 파기</h2>
          <p className="text-gray-700 leading-relaxed">
            회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
            전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">5. 개인정보 보호책임자</h2>
          <p className="text-gray-700 leading-relaxed">
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <div className="mt-3 text-gray-700">
            <p><strong>성명:</strong> 홍길동</p>
            <p><strong>직책:</strong> 개인정보 보호책임자</p>
            <p><strong>연락처:</strong> privacy@careservice.com</p>
          </div>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 text-center">
        <a href="/" className="text-indigo-600 hover:underline font-medium">
          홈으로 돌아가기
        </a>
      </div>
    </div>
  );
}

