// ================================================
// 간병인 사용확인서 PDF 템플릿
// ================================================

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: "NanumGothic",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 50,
    marginTop: 20,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  table: {
    marginVertical: 40,
    borderWidth: 2,
    borderColor: "#333",
    width: "100%",
    maxWidth: 500,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableRowLast: {
    flexDirection: "row",
  },
  sectionHeader: {
    width: "20%",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRightWidth: 1,
    borderRightColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  tableHeader: {
    width: "30%",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRightWidth: 1,
    borderRightColor: "#000",
    justifyContent: "center",
  },
  tableCell: {
    width: "50%",
    padding: 10,
    justifyContent: "center",
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  cellText: {
    fontSize: 14,
  },
  footer: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 13,
  },
  signature: {
    marginTop: 60,
    textAlign: "center",
    width: "100%",
  },
  signatureDate: {
    fontSize: 14,
    marginBottom: 30,
  },
  signatureOrg: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    letterSpacing: 4,
  },
  signatureRep: {
    fontSize: 16,
    letterSpacing: 2,
  },
  note: {
    marginTop: 40,
    fontSize: 10,
    color: "#666",
  },
});

interface UsageCertificateProps {
  // 환자 정보
  patientName: string;
  patientBirthDate: string;
  hospitalName: string;

  // 간병인 정보
  caregiverName: string;
  caregiverBirthDate: string;
  caregiverPhone: string;

  // 서비스 정보
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyWage: number;
  totalAmount: number;

  // 발급일
  issueDate: string;
}

export function UsageCertificate({
  patientName,
  patientBirthDate,
  hospitalName,
  caregiverName,
  caregiverBirthDate,
  caregiverPhone,
  startDate,
  endDate,
  totalDays,
  dailyWage,
  totalAmount,
  issueDate,
}: UsageCertificateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 제목 */}
        <Text style={styles.title}>간병인 사용확인서</Text>

        {/* 테이블 */}
        <View style={styles.table}>
          {/* 환자 정보 */}
          <View style={styles.tableRow}>
            <View style={[styles.sectionHeader, { width: "20%" }]}>
              <Text style={styles.headerText}>환자</Text>
            </View>
            <View style={[styles.tableHeader, { width: "30%" }]}>
              <Text style={styles.cellText}>환자성명</Text>
            </View>
            <View style={[styles.tableCell, { width: "50%" }]}>
              <Text style={styles.cellText}>{patientName}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.sectionHeader, { width: "20%", backgroundColor: "white", borderRightWidth: 0 }]}>
              <Text></Text>
            </View>
            <View style={[styles.tableHeader, { width: "30%" }]}>
              <Text style={styles.cellText}>생년월일</Text>
            </View>
            <View style={[styles.tableCell, { width: "50%" }]}>
              <Text style={styles.cellText}>{patientBirthDate}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.sectionHeader, { width: "20%", backgroundColor: "white", borderRightWidth: 0 }]}>
              <Text></Text>
            </View>
            <View style={[styles.tableHeader, { width: "30%" }]}>
              <Text style={styles.cellText}>간병장소</Text>
            </View>
            <View style={[styles.tableCell, { width: "50%" }]}>
              <Text style={styles.cellText}>{hospitalName}</Text>
            </View>
          </View>

          {/* 간병인 정보 */}
          <View style={styles.tableRow}>
            <View style={[styles.sectionHeader, { width: "20%" }]}>
              <Text style={styles.headerText}>간병인</Text>
            </View>
            <View style={[styles.tableHeader, { width: "30%" }]}>
              <Text style={styles.cellText}>성명</Text>
            </View>
            <View style={[styles.tableCell, { width: "50%" }]}>
              <Text style={styles.cellText}>{caregiverName}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.sectionHeader, { width: "20%", backgroundColor: "white", borderRightWidth: 0 }]}>
              <Text></Text>
            </View>
            <View style={[styles.tableHeader, { width: "30%" }]}>
              <Text style={styles.cellText}>생년월일</Text>
            </View>
            <View style={[styles.tableCell, { width: "50%" }]}>
              <Text style={styles.cellText}>{caregiverBirthDate}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.sectionHeader, { width: "20%", backgroundColor: "white", borderRightWidth: 0 }]}>
              <Text></Text>
            </View>
            <View style={[styles.tableHeader, { width: "30%" }]}>
              <Text style={styles.cellText}>등록일자</Text>
            </View>
            <View style={[styles.tableCell, { width: "50%" }]}>
              <Text style={styles.cellText}>{caregiverPhone}</Text>
            </View>
          </View>

          {/* 서비스 기간 */}
          <View style={styles.tableRow}>
            <View style={[styles.sectionHeader, { width: "20%", backgroundColor: "white", borderRightWidth: 0 }]}>
              <Text></Text>
            </View>
            <View style={[styles.tableHeader, { width: "30%" }]}>
              <Text style={styles.cellText}>서비스 이용기간</Text>
            </View>
            <View style={[styles.tableCell, { width: "50%" }]}>
              <Text style={styles.cellText}>
                {startDate} ~ {endDate} (총 {totalDays}일)
              </Text>
            </View>
          </View>

          {/* 결제금액 */}
          <View style={styles.tableRowLast}>
            <View style={[styles.sectionHeader, { width: "20%", backgroundColor: "white", borderRightWidth: 0 }]}>
              <Text></Text>
            </View>
            <View style={[styles.tableHeader, { width: "30%" }]}>
              <Text style={styles.cellText}>결제금액</Text>
            </View>
            <View style={[styles.tableCell, { width: "50%" }]}>
              <Text style={styles.cellText}>
                1일 {dailyWage.toLocaleString()}원 × {totalDays}일 = {totalAmount.toLocaleString()}원
              </Text>
            </View>
          </View>
        </View>

        {/* 푸터 */}
        <Text style={styles.footer}>위 용도 외 다른 목적으로 사용할 수 없음.</Text>

        {/* 서명 */}
        <View style={styles.signature}>
          <Text style={styles.signatureDate}>{issueDate}</Text>
          <Text style={styles.signatureOrg}>간 병 노 트</Text>
          <Text style={styles.signatureRep}>대표 이 사 장</Text>
        </View>

        {/* 주의사항 */}
        <Text style={styles.note}>(용도 : 보험회사 제출용)</Text>
      </Page>
    </Document>
  );
}

