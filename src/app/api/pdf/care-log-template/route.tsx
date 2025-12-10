import { NextRequest, NextResponse } from "next/server";
import { pdf, Font } from "@react-pdf/renderer";
import { CareLogTemplate } from "@/modules/pdf/templates/care-log-template";
import path from "path";

// 한글 폰트 등록
Font.register({
  family: "NanumGothic",
  src: path.join(process.cwd(), "public", "fonts", "NanumGothic-Regular.ttf"),
});

export async function GET(req: NextRequest) {
  try {
    // 쿼리 파라미터에서 정보 가져오기
    const { searchParams } = new URL(req.url);
    const patientName = searchParams.get("patient") || "환자명";
    const caregiverName = searchParams.get("caregiver") || "간병인명";
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    // PDF 생성
    const pdfDoc = pdf(
      <CareLogTemplate
        patientName={patientName}
        caregiverName={caregiverName}
        date={date}
      />
    );

    const buffer = await pdfDoc.toBuffer();

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="care_log_template_${date}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("간병일지 양식 PDF 생성 에러:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error?.message },
      { status: 500 }
    );
  }
}

