import { NextRequest, NextResponse } from "next/server";
import { pdf, Font } from "@react-pdf/renderer";
import { createClient } from "@/modules/shared/lib/supabase/server";
import { createAdminClient } from "@/modules/shared/lib/supabase/admin";
import { UsageCertificate } from "@/modules/pdf/templates/usage-certificate";
import path from "path";

// 한글 폰트 등록
Font.register({
  family: "NanumGothic",
  src: path.join(process.cwd(), "public", "fonts", "NanumGothic-Regular.ttf"),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const caseId = params.id;

  try {
    const supabase = createClient();
    const adminSupabase = createAdminClient();

    // 인증 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 케이스 조회
    const { data: caseData, error: caseError } = await adminSupabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // 권한 확인
    if (caseData.guardian_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 필수 데이터 확인
    if (!caseData.caregiver_agreed_at) {
      return NextResponse.json(
        { error: "간병인 동의가 필요합니다." },
        { status: 400 }
      );
    }

    // 기간 계산
    const start = new Date(caseData.start_date);
    const end = new Date(caseData.end_date_final || caseData.end_date_expected);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalAmount = (caseData.daily_wage || 0) * totalDays;

    // PDF 생성
    const today = new Date().toISOString().split("T")[0];
    const pdfDoc = pdf(
      <UsageCertificate
        patientName={caseData.patient_name || ""}
        patientBirthDate={caseData.patient_birth_date || ""}
        hospitalName={caseData.hospital_name || ""}
        caregiverName={caseData.caregiver_name || ""}
        caregiverBirthDate={caseData.caregiver_birth_date || ""}
        caregiverPhone={caseData.caregiver_phone || ""}
        startDate={caseData.start_date || ""}
        endDate={caseData.end_date_final || caseData.end_date_expected || ""}
        totalDays={totalDays}
        dailyWage={caseData.daily_wage || 0}
        totalAmount={totalAmount}
        issueDate={today}
      />
    );

    const buffer = await pdfDoc.toBuffer();

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="usage_certificate_${caseId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("간병인 사용확인서 PDF 생성 에러:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error?.message },
      { status: 500 }
    );
  }
}

