import { NextRequest, NextResponse } from "next/server";
import { Document, Page, Text, View, StyleSheet, Font, pdf } from "@react-pdf/renderer";
import { createClient } from "@/modules/shared/lib/supabase/server";
import path from "path";

// 로컬 한글 폰트 등록 (절대 경로 사용)
Font.register({
  family: "NanumGothic",
  src: path.join(process.cwd(), "public", "fonts", "NanumGothic-Regular.ttf"),
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "NanumGothic",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "NanumGothic",
  },
  section: {
    marginBottom: 16,
    fontFamily: "NanumGothic",
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "bold",
    backgroundColor: "#f5f5f5",
    padding: 6,
    fontFamily: "NanumGothic",
  },
  row: {
    marginBottom: 6,
    fontFamily: "NanumGothic",
  },
  label: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
    fontFamily: "NanumGothic",
  },
  value: {
    fontSize: 10,
    marginBottom: 8,
    fontFamily: "NanumGothic",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
    fontFamily: "NanumGothic",
  },
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const caseId = params.id;

  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all data in parallel
    const [caseResult, logsResult, paymentResult] = await Promise.all([
      supabase.from("cases").select("*").eq("id", caseId).single(),
      supabase
        .from("care_logs")
        .select("*")
        .eq("case_id", caseId)
        .eq("is_active", true)
        .order("date", { ascending: true }),
      supabase.from("payments").select("*").eq("case_id", caseId).maybeSingle(),
    ]);

    const caseData = caseResult.data;
    const careLogs = logsResult.data || [];
    const payment = paymentResult.data || null;

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    if (caseData.guardian_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Safe data extraction
    const patientName = String(caseData?.patient_name || "");
    const hospitalName = String(caseData?.hospital_name || "");
    const startDate = String(caseData?.start_date || "");
    const endDate = String(caseData?.end_date_final || caseData?.end_date_expected || "");
    const dailyWage = String(caseData?.daily_wage || 0);
    const totalAmount = String(payment?.total_amount || 0);
    const paidAt = String(payment?.paid_at || "").split('T')[0];
    const logsCount = String(careLogs.length);

    // Create PDF document
    const pdfDoc = pdf(
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>간병 이용 내역서</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>케이스 정보</Text>
            <View style={styles.row}>
              <Text style={styles.label}>환자 성명</Text>
              <Text style={styles.value}>{patientName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>병원명</Text>
              <Text style={styles.value}>{hospitalName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>간병 기간</Text>
              <Text style={styles.value}>{startDate} ~ {endDate}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>1일 간병비</Text>
              <Text style={styles.value}>{dailyWage}원</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>간병일지 요약</Text>
            <View style={styles.row}>
              <Text style={styles.label}>총 작성 일수</Text>
              <Text style={styles.value}>{logsCount}일</Text>
            </View>
            {careLogs.slice(0, 5).map((log: any, idx: number) => {
              const logDate = String(log?.date || "");
              const logContent = String(log?.content || "").substring(0, 50);
              return (
                <View key={idx} style={styles.row}>
                  <Text style={styles.label}>{logDate}</Text>
                  <Text style={styles.value}>{logContent}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>지급 정보</Text>
            {payment ? (
              <>
                <View style={styles.row}>
                  <Text style={styles.label}>총 지급액</Text>
                  <Text style={styles.value}>{totalAmount}원</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>지급일</Text>
                  <Text style={styles.value}>{paidAt}</Text>
                </View>
              </>
            ) : (
              <Text style={{ fontSize: 10, color: "#999" }}>지급 정보가 없습니다.</Text>
            )}
          </View>

          <Text style={styles.footer}>
            이 서류는 보험 청구용이며, 연말정산 의료비 공제용 영수증이 아닙니다.
          </Text>
        </Page>
      </Document>
    );

    // Generate buffer
    const buffer = await pdfDoc.toBuffer();

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="care_${caseId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("=== PDF Generation Error ===");
    console.error("Error:", error);
    console.error("Message:", error?.message);
    console.error("Stack:", error?.stack);
    console.error("Name:", error?.name);
    
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error?.message || String(error),
        name: error?.name || "Unknown",
      },
      { status: 500 }
    );
  }
}
