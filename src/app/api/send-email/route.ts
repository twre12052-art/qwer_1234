import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/modules/shared/lib/supabase/server";
import { createAdminClient } from "@/modules/shared/lib/supabase/admin";
import { sendPdfEmail } from "@/modules/shared/lib/email";
import { pdf } from "@react-pdf/renderer";
import { Font, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import path from "path";

// 폰트 등록
Font.register({
  family: "NanumGothic",
  src: path.join(process.cwd(), "public", "fonts", "NanumGothic-Regular.ttf"),
});

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "NanumGothic" },
  title: { fontSize: 20, marginBottom: 20, textAlign: "center", fontWeight: "bold" },
  section: { marginBottom: 15, padding: 10, border: "1px solid #ddd" },
  sectionTitle: { fontSize: 14, marginBottom: 8, fontWeight: "bold" },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: "40%", color: "#666" },
  value: { width: "60%", fontWeight: "bold" },
  footer: { marginTop: 30, fontSize: 9, color: "#999", textAlign: "center" },
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const adminSupabase = createAdminClient();

    // 1. 인증 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 2. 요청 데이터
    const body = await req.json();
    const { caseId, email } = body;

    if (!caseId || !email) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
    }

    // 3. 케이스 및 데이터 조회
    const [caseResult, logsResult, paymentResult] = await Promise.all([
      adminSupabase.from("cases").select("*").eq("id", caseId).single(),
      adminSupabase
        .from("care_logs")
        .select("*")
        .eq("case_id", caseId)
        .eq("is_active", true)
        .order("date", { ascending: true }),
      adminSupabase.from("payments").select("*").eq("case_id", caseId).maybeSingle(),
    ]);

    const caseData = caseResult.data;
    const careLogs = logsResult.data || [];
    const payment = paymentResult.data || null;

    if (!caseData) {
      return NextResponse.json({ error: "케이스를 찾을 수 없습니다." }, { status: 404 });
    }

    // 권한 확인
    if (caseData.guardian_id !== user.id) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // 4. PDF 생성
    const pdfDoc = pdf(
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>간병 서류</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>케이스 정보</Text>
            <View style={styles.row}>
              <Text style={styles.label}>환자명</Text>
              <Text style={styles.value}>{caseData.patient_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>병원</Text>
              <Text style={styles.value}>{caseData.hospital_name || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>기간</Text>
              <Text style={styles.value}>
                {caseData.start_date} ~ {caseData.end_date_final || caseData.end_date_expected}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>간병일지 ({careLogs.length}건)</Text>
            {careLogs.map((log: any, idx: number) => (
              <View key={idx} style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: "bold" }}>{log.date}</Text>
                <Text style={{ fontSize: 9, color: "#555" }}>{log.content?.substring(0, 100)}</Text>
              </View>
            ))}
          </View>

          {payment && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>지급 정보</Text>
              <View style={styles.row}>
                <Text style={styles.label}>총 지급액</Text>
                <Text style={styles.value}>{payment.total_amount}원</Text>
              </View>
            </View>
          )}

          <Text style={styles.footer}>
            이 서류는 보험 청구용이며, 연말정산 의료비 공제용 영수증이 아닙니다.
          </Text>
        </Page>
      </Document>
    );

    const pdfBuffer = await pdfDoc.toBuffer();

    // 5. 이메일 발송
    const emailResult = await sendPdfEmail(email, pdfBuffer, {
      patientName: caseData.patient_name,
      startDate: caseData.start_date,
      endDate: caseData.end_date_final || caseData.end_date_expected,
    });

    // 6. notification_logs에 기록
    await adminSupabase.from("notification_logs").insert({
      case_id: caseId,
      recipient: email,
      channel: "email_submit",
      content: `PDF 서류 발송 (${caseData.patient_name})`,
      status: emailResult.success ? "success" : "failed",
      error_message: emailResult.error || null,
      meta: {
        patient_name: caseData.patient_name,
        sent_at: new Date().toISOString(),
      },
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "이메일이 발송되었습니다.",
    });
  } catch (error: any) {
    console.error("이메일 발송 API 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

