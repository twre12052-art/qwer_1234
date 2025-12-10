// ================================================
// 간병노트 표지 페이지
// ================================================

import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: "NanumGothic",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  logo: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 30,
    letterSpacing: 8,
    color: "#2563eb",
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 80,
    letterSpacing: 4,
    color: "#475569",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 3,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 60,
    lineHeight: 1.8,
    color: "#64748b",
  },
  infoBox: {
    marginTop: 60,
    padding: 30,
    backgroundColor: "white",
    borderRadius: 8,
    width: "80%",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  infoLabel: {
    width: "40%",
    fontSize: 14,
    color: "#64748b",
  },
  infoValue: {
    width: "60%",
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 50,
    left: 60,
    right: 60,
    textAlign: "center",
    fontSize: 12,
    color: "#94a3b8",
  },
});

interface CoverPageProps {
  patientName: string;
  caregiverName: string;
  startDate: string;
  endDate: string;
  issueDate: string;
}

export function CoverPage({
  patientName,
  caregiverName,
  startDate,
  endDate,
  issueDate,
}: CoverPageProps) {
  return (
    <Page size="A4" style={styles.page}>
      {/* 로고 */}
      <Text style={styles.logo}>간병노트</Text>
      <Text style={styles.subtitle}>CareNote</Text>

      {/* 제목 */}
      <Text style={styles.title}>보험 청구 서류</Text>
      <Text style={styles.description}>
        Insurance Claim Documents
        {"\n"}
        간병 서비스 이용 내역 및 증빙 서류
      </Text>

      {/* 정보 박스 */}
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>환자명</Text>
          <Text style={styles.infoValue}>{patientName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>간병인</Text>
          <Text style={styles.infoValue}>{caregiverName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>서비스 기간</Text>
          <Text style={styles.infoValue}>
            {startDate} ~ {endDate}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>발급일</Text>
          <Text style={styles.infoValue}>{issueDate}</Text>
        </View>
      </View>

      {/* 푸터 */}
      <Text style={styles.footer}>
        간병노트 | www.carenote.kr | 1577-0000
      </Text>
    </Page>
  );
}

