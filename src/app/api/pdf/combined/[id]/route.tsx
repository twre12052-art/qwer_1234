import { NextRequest, NextResponse } from "next/server";
import { Document, pdf, Font } from "@react-pdf/renderer";
import { createClient } from "@/modules/shared/lib/supabase/server";
import { createAdminClient } from "@/modules/shared/lib/supabase/admin";
import { CoverPage } from "@/modules/pdf/templates/cover-page";
import { TableOfContents } from "@/modules/pdf/templates/table-of-contents";
import { AffiliationCertificate } from "@/modules/pdf/templates/affiliation-certificate";
import { UsageCertificate } from "@/modules/pdf/templates/usage-certificate";
import { BusinessRegistration } from "@/modules/pdf/templates/business-registration";
import { AgencyContract } from "@/modules/pdf/templates/agency-contract";
import { AttachmentsSection } from "@/modules/pdf/templates/attachments-section";
import { CareLogsPdf } from "@/modules/pdf/templates/care-logs-pdf";
import { getAttachments } from "@/modules/attachment/actions";
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

    // 보호자 정보 조회
    const { data: guardianData } = await adminSupabase
      .from("users")
      .select("*")
      .eq("id", caseData.guardian_id)
      .single();

    // 필수 데이터 확인
    if (!caseData.caregiver_agreed_at) {
      return NextResponse.json(
        { error: "간병인 동의가 필요합니다." },
        { status: 400 }
      );
    }

    // 데이터 준비
    const today = new Date().toISOString().split("T")[0];
    const start = new Date(caseData.start_date);
    const end = new Date(caseData.end_date_final || caseData.end_date_expected);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalAmount = (caseData.daily_wage || 0) * totalDays;
    const contractDate = caseData.guardian_agreed_at?.split("T")[0] || "";

    // 첨부파일 조회
    let attachments: any[] = [];
    try {
      attachments = await getAttachments(caseId);
    } catch (error) {
      console.error("첨부파일 조회 오류:", error);
      // 첨부파일 조회 실패해도 PDF 생성은 계속 진행
    }

    // 간병일지 조회
    const { data: logs, error: logsError } = await adminSupabase
      .from("care_logs")
      .select("*")
      .eq("case_id", caseId)
      .eq("is_active", true)
      .order("date", { ascending: true });

    const hasCareLogs = logs && logs.length > 0;
    const hasAttachments = attachments.length > 0;
    
    // 페이지 번호 계산
    let currentPage = 7; // 기본 문서들 (표지 1, 목차 2, 4개 문서 3-6)
    const careLogsPageNumber = hasCareLogs ? currentPage : 0;
    if (hasCareLogs) {
      currentPage += Math.ceil(logs.length / 2); // 일지당 약 0.5페이지 가정
    }
    const attachmentPageNumber = hasAttachments ? currentPage : 0;

    // 통합 PDF 생성 (6페이지 또는 7페이지)
    const pdfDoc = pdf(
      <Document>
        {/* 1. 표지 */}
        <CoverPage
          patientName={caseData.patient_name || ""}
          caregiverName={caseData.caregiver_name || ""}
          startDate={caseData.start_date || ""}
          endDate={caseData.end_date_final || caseData.end_date_expected || ""}
          issueDate={today}
        />

        {/* 2. 목차 */}
        <TableOfContents 
          hasAttachments={hasAttachments}
          attachmentPageNumber={attachmentPageNumber}
          hasCareLogs={hasCareLogs}
          careLogsPageNumber={careLogsPageNumber}
        />

        {/* 3. 간병인 소속확인서 */}
        <AffiliationCertificate
          caregiverName={caseData.caregiver_name || ""}
          caregiverBirthDate={caseData.caregiver_birth_date || ""}
          caregiverPhone={caseData.caregiver_phone || ""}
          registrationNumber={caseData.caregiver_agreed_at?.split("T")[0] || ""}
          issueDate={today}
        />

        {/* 4. 간병인 사용확인서 */}
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

        {/* 5. 사업자 등록증 */}
        <BusinessRegistration />

        {/* 6. 간병인 중개 계약서 */}
        <AgencyContract
          caregiverName={caseData.caregiver_name || ""}
          caregiverPhone={caseData.caregiver_phone || ""}
          caregiverBirthDate={caseData.caregiver_birth_date || ""}
          guardianName={guardianData?.full_name || guardianData?.name || ""}
          guardianPhone={guardianData?.phone || ""}
          guardianRelation={caseData.patient_relationship || "보호자"}
          patientName={caseData.patient_name || ""}
          hospitalName={caseData.hospital_name || ""}
          diagnosis={caseData.diagnosis || ""}
          startDate={caseData.start_date || ""}
          endDate={caseData.end_date_final || caseData.end_date_expected || ""}
          dailyWage={caseData.daily_wage || 0}
          totalDays={totalDays}
          totalAmount={totalAmount}
          contractDate={contractDate}
        />

        {/* 7. 간병일지 (있는 경우만) */}
        {hasCareLogs && (
          <CareLogsPdf
            patientName={caseData.patient_name || ""}
            caregiverName={caseData.caregiver_name || ""}
            logs={logs}
          />
        )}

        {/* 8. 첨부 서류 (있는 경우만) */}
        {hasAttachments && (
          <AttachmentsSection attachments={attachments} />
        )}
      </Document>
    );

    const buffer = await pdfDoc.toBuffer();

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="carenote_all_documents_${caseId}_${today}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("통합 PDF 생성 에러:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error?.message },
      { status: 500 }
    );
  }
}

