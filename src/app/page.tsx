import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-sky-50 to-white">
      {/* Navigation - 깔끔한 파란색 스타일 */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">💙</span>
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent">
                  간병노트
                </div>
                <div className="text-xs text-sky-400">CareNote</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="px-6 py-2.5 text-sky-600 hover:text-blue-500 font-medium transition-colors text-sm rounded-full hover:bg-blue-50"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-400 to-sky-400 text-white rounded-full font-medium hover:from-blue-500 hover:to-sky-500 transition-all text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - 깔끔한 파란색 스타일 */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* 배경 장식 */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-sky-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-blue-300 rounded-full opacity-15 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 py-20 max-w-7xl relative z-10">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-block">
              <span className="text-6xl animate-bounce inline-block">💙</span>
            </div>
            <h1 className="text-6xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-blue-500 via-sky-500 to-blue-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                가족 간병 서류 관리
              </span>
            </h1>
            <p className="text-2xl text-gray-700 leading-relaxed font-medium">
              복잡한 보험 청구 서류를<br />
              <span className="text-blue-600">간편하고 깔끔하게</span> 생성하고 관리하세요 ✨
            </p>
            <div className="flex gap-4 justify-center pt-8">
              <Link
                href="/signup"
                className="group px-10 py-5 bg-gradient-to-r from-blue-400 to-sky-400 text-white rounded-2xl font-bold text-lg hover:from-blue-500 hover:to-sky-500 transition-all shadow-2xl hover:shadow-blue-300/50 transform hover:scale-105 hover:-translate-y-1"
              >
                <span className="flex items-center gap-2">
                  무료로 시작하기
                  <span className="group-hover:translate-x-1 transition-transform">✨</span>
                </span>
              </Link>
              <Link
                href="#features"
                className="px-10 py-5 bg-white/80 backdrop-blur-sm border-2 border-blue-300 text-blue-600 rounded-2xl font-bold text-lg hover:bg-white hover:border-blue-400 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                서비스 안내 💫
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - 깔끔한 카드 디자인 */}
      <section id="features" className="bg-white/50 py-24 relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="text-4xl">🌟</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent">
                주요 서비스
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              간병 서류 관리를 위한 핵심 기능을 만나보세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 rounded-3xl p-8 hover:border-blue-400 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-300 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-sky-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all">
                <span className="text-4xl">📄</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">서류 자동 생성</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                보험 청구에 필요한 계약서, 일지, 확인서를<br />
                자동으로 생성합니다 ✨
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 rounded-3xl p-8 hover:border-sky-400 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-sky-300 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all">
                <span className="text-4xl">✍️</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">간편한 일지 작성</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                매일 간병 내용을 쉽게 기록하고<br />
                관리할 수 있습니다 ✨
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 border-2 border-blue-200 rounded-3xl p-8 hover:border-blue-400 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-300 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-sky-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all">
                <span className="text-4xl">🔒</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">안전한 보관</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                모든 서류와 기록을 안전하게 보관하고<br />
                필요시 다운로드할 수 있습니다 ✨
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 단계별 안내 */}
      <section className="bg-gradient-to-b from-blue-50 to-sky-50 py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="text-4xl">🎯</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent">
                이용 방법
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              간단한 3단계로 서류를 준비하세요 ✨
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* 연결선 */}
            <div className="hidden md:block absolute top-20 left-1/3 right-1/3 h-1 bg-gradient-to-r from-blue-300 via-sky-300 to-blue-300 transform -translate-y-1/2"></div>
            
            {/* Step 1 */}
            <div className="relative bg-white border-2 border-blue-200 rounded-3xl p-10 text-center shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-full flex items-center justify-center font-bold text-3xl mb-6 mx-auto shadow-lg relative z-10">
                1
              </div>
              <div className="absolute top-4 right-4 text-2xl opacity-20">💙</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">정보 입력</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                환자와 간병인 정보를 입력하고<br />
                간병인에게 링크를 전달합니다
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white border-2 border-sky-200 rounded-3xl p-10 text-center shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-24 h-24 bg-gradient-to-br from-sky-400 to-sky-500 text-white rounded-full flex items-center justify-center font-bold text-3xl mb-6 mx-auto shadow-lg relative z-10">
                2
              </div>
              <div className="absolute top-4 right-4 text-2xl opacity-20">💎</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">일지 작성</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                간병인이 매일 간병 내용을<br />
                기록합니다
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white border-2 border-blue-200 rounded-3xl p-10 text-center shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-sky-400 text-white rounded-full flex items-center justify-center font-bold text-3xl mb-6 mx-auto shadow-lg relative z-10">
                3
              </div>
              <div className="absolute top-4 right-4 text-2xl opacity-20">✨</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">서류 발급</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                간병 종료 후 보험 청구 서류를<br />
                다운로드합니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-400 via-sky-400 to-blue-400 py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <div className="mb-6">
            <span className="text-6xl animate-pulse">✨</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-6">
            간병 서류 관리를 시작하세요
          </h2>
          <p className="text-xl text-blue-50 mb-10 font-medium">
            무료로 회원가입하고 서비스를 이용하실 수 있습니다 ✨
          </p>
          <Link
            href="/signup"
            className="inline-block px-12 py-5 bg-white text-blue-600 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all shadow-2xl hover:shadow-white/50 transform hover:scale-110 hover:-translate-y-2"
          >
            <span className="flex items-center gap-2">
              무료로 시작하기
              <span className="animate-bounce">🎉</span>
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-800 to-gray-900 text-gray-400 py-16">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">💙</span>
                <div className="text-3xl font-bold text-white">간병노트</div>
              </div>
              <p className="text-sm leading-relaxed mb-4 text-gray-300">
                가족 간병 서류를 쉽고 빠르게 만드는<br />
                스마트한 간병 관리 서비스
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>💙</span> 서비스
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-blue-400 transition-colors">로그인</Link></li>
                <li><Link href="/signup" className="hover:text-blue-400 transition-colors">회원가입</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>💎</span> 고객지원
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>전화: 1577-0000</li>
                <li>이메일: support@carenote.kr</li>
                <li>평일 09:00 - 18:00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p className="flex items-center justify-center gap-2">
              <span>💙</span>
              &copy; 2025 간병노트. All rights reserved.
              <span>💙</span>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
