export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">개인정보처리방침</h1>
        <div className="prose max-w-none bg-white p-8 rounded-lg shadow">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제1조 (개인정보의 처리목적)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              간병노트(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지 목적</li>
              <li>간병 계약서, 일지, 지급확인서 등 서비스 제공</li>
              <li>민원사무 처리, 고충처리</li>
              <li>서비스 이용에 대한 통계 작성</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제2조 (개인정보의 처리 및 보유기간)</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
              <li>회원 가입 및 관리: 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행중인 경우에는 해당 수사·조사 종료 시까지)</li>
              <li>간병 서비스 제공: 서비스 이용 종료 시까지</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제3조 (처리하는 개인정보의 항목)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              회사는 다음의 개인정보 항목을 처리하고 있습니다:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">필수항목</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>이메일(아이디), 비밀번호, 이름, 전화번호</li>
              </ul>
              <h3 className="font-semibold mb-2 mt-4">선택항목</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>생년월일, 이메일(연락용)</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제4조 (개인정보의 제3자 제공)</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 정보주체의 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제5조 (개인정보처리의 위탁)</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
              <li>클라우드 서비스 제공: Supabase (데이터 저장 및 관리)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제6조 (정보주체의 권리·의무 및 행사방법)</h2>
            <p className="text-gray-700 leading-relaxed">
              정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
              <li>개인정보 처리정지 요구</li>
              <li>개인정보 열람요구</li>
              <li>개인정보 정정·삭제요구</li>
              <li>개인정보 처리정지 요구</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제7조 (개인정보의 파기)</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다. 개인정보 파기의 절차 및 방법은 다음과 같습니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
              <li>파기절차: 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져(종이의 경우 별도의 서류) 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.</li>
              <li>파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제8조 (개인정보 보호책임자)</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="text-gray-700">
                <strong>개인정보 보호책임자</strong><br />
                연락처: support@carenote.com
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제9조 (개인정보의 안전성 확보조치)</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
              <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등</li>
              <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
              <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제10조 (개인정보처리방침 변경)</h2>
            <p className="text-gray-700 leading-relaxed">
              이 개인정보처리방침은 2024년 12월 1일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              본 방침은 2024년 12월 1일부터 시행됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
