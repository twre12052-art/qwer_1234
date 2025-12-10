import { NextRequest, NextResponse } from "next/server";
import { pdf, Font } from "@react-pdf/renderer";
import { createClient } from "@/modules/shared/lib/supabase/server";
import { BusinessRegistration } from "@/modules/pdf/templates/business-registration";
import path from "path";

// 한글 폰트 등록
Font.register({
  family: "NanumGothic",
  src: path.join(process.cwd(), "public", "fonts", "NanumGothic-Regular.ttf"),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();

    // 인증 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // PDF 생성 (케이스 ID 필요 없음 - 고정 템플릿)
    const pdfDoc = pdf(<BusinessRegistration />);

    const buffer = await pdfDoc.toBuffer();

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="business_registration.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("사업자 등록증 PDF 생성 에러:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error?.message },
      { status: 500 }
    );
  }
}

