// ================================================
// 간병일지 빈 양식 PDF (프린트용)
// ================================================

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "NanumGothic",
  },
  header: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#10b981",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#10b981",
    marginBottom: 5,
    letterSpacing: 3,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
  },
  infoSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f0fdf4",
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: "30%",
    fontSize: 11,
    fontWeight: "bold",
  },
  infoValue: {
    width: "70%",
    fontSize: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#059669",
  },
  checkboxGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  checkboxItem: {
    width: "45%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: "#333",
    marginRight: 6,
  },
  checkboxLabel: {
    fontSize: 10,
  },
  memoSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  memoBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    minHeight: 150,
    padding: 10,
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
  },
});

interface CareLogTemplateProps {
  patientName: string;
  caregiverName: string;
  date: string;
}

export function CareLogTemplate({
  patientName,
  caregiverName,
  date,
}: CareLogTemplateProps) {
  const tasks = [
    "식사 보조",
    "개인위생 (세면/구강)",
    "침대시트 교체",
    "배설 보조",
    "이동 보조",
    "목욕 보조",
    "체위 변경",
    "약물 투여 보조",
    "산책/보행 훈련",
    "활력징후 측정",
    "상태 관찰 및 보고",
    "기타",
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.logo}>간병노트</Text>
        </View>

        {/* 제목 */}
        <Text style={styles.title}>간병일지 작성 양식</Text>

        {/* 정보 섹션 */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>환자명:</Text>
            <Text style={styles.infoValue}>{patientName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>간병인:</Text>
            <Text style={styles.infoValue}>{caregiverName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>작성일:</Text>
            <Text style={styles.infoValue}>{date}</Text>
          </View>
        </View>

        {/* 수행 항목 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✓ 수행 항목 (해당하는 것에 체크)</Text>
          <View style={styles.checkboxGrid}>
            {tasks.map((task, idx) => (
              <View key={idx} style={styles.checkboxItem}>
                <View style={styles.checkbox} />
                <Text style={styles.checkboxLabel}>{task}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 메모 */}
        <View style={styles.memoSection}>
          <Text style={styles.sectionTitle}>📝 상세 메모 (환자 상태, 특이사항 등)</Text>
          <View style={styles.memoBox}>
            <Text style={{ fontSize: 9, color: "#999" }}>
              {"\n"}
              ________________________________________________________________________________________________
              {"\n\n"}
              ________________________________________________________________________________________________
              {"\n\n"}
              ________________________________________________________________________________________________
              {"\n\n"}
              ________________________________________________________________________________________________
              {"\n\n"}
              ________________________________________________________________________________________________
              {"\n\n"}
            </Text>
          </View>
        </View>

        {/* 서명 */}
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 20 }}>
          <View>
            <Text style={{ fontSize: 11, marginBottom: 30 }}>간병인 서명: _______________</Text>
          </View>
          <View>
            <Text style={{ fontSize: 11, marginBottom: 30 }}>보호자 확인: _______________</Text>
          </View>
        </View>

        {/* 푸터 */}
        <Text style={styles.footer}>
          간병노트 | www.carenote.kr | 1577-0000
          {"\n"}
          ※ 작성 후 사진 촬영하여 앱에 업로드하거나, 간병 종료 시 제출하세요.
        </Text>
      </Page>
    </Document>
  );
}

