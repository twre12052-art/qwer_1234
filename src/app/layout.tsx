import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const notoSansKR = Noto_Sans_KR({ 
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "간병노트 - 가족 간병 서류 자동 생성",
  description: "복잡한 보험 청구 서류를 5분 만에! 계약서, 일지, 확인서를 자동으로 생성하는 스마트한 간병 관리 서비스",
  keywords: "간병, 간병노트, 보험청구, 간병서류, 간병일지, 가족간병",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} ${notoSansKR.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

