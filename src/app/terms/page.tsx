export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">서비스 이용약관</h1>
        <div className="prose max-w-none bg-white p-8 rounded-lg shadow">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제1조 (목적)</h2>
            <p className="text-gray-700 leading-relaxed">
              본 약관은 간병노트(이하 "회사")가 제공하는 간병 서비스 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제2조 (정의)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>"서비스"란 회사가 제공하는 간병 관련 서비스 및 관련 제반 서비스를 의미합니다.</li>
              <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
              <li>"회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제3조 (약관의 게시와 개정)</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제4조 (회원가입)</h2>
            <p className="text-gray-700 leading-relaxed">
              이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다. 회사는 제1항과 같이 회원가입을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제5조 (서비스의 제공 및 변경)</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 다음과 같은 서비스를 제공합니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>간병 계약서 생성 및 관리 서비스</li>
              <li>간병 일지 작성 및 관리 서비스</li>
              <li>간병비 지급 확인서 생성 서비스</li>
              <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 회원에게 제공하는 일체의 서비스</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제6조 (서비스의 중단)</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제7조 (회원의 의무)</h2>
            <p className="text-gray-700 leading-relaxed">
              회원은 다음 행위를 하여서는 안 됩니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>신청 또는 변경 시 허위내용의 등록</li>
              <li>타인의 정보 도용</li>
              <li>회사가 게시한 정보의 변경</li>
              <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
              <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제8조 (개인정보보호)</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 이용자의 개인정보 수집시 서비스제공을 위하여 필요한 범위에서 최소한의 개인정보를 수집합니다. 회사는 회원가입시 구매계약이행에 필요한 정보를 미리 수집하지 않습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제9조 (면책조항)</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제10조 (준거법 및 관할법원)</h2>
            <p className="text-gray-700 leading-relaxed">
              본 약관은 대한민국 법률에 따라 규율되고 해석됩니다. 회사와 이용자 간에 발생한 분쟁에 관한 소송은 제소 당시의 이용자의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다.
            </p>
          </section>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              본 약관은 2024년 12월 1일부터 시행됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

