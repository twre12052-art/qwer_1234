// ================================================
// 간병인 소속확인서 PDF 템플릿
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
    maxWidth: 450,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableRowLast: {
    flexDirection: "row",
  },
  tableHeader: {
    width: "30%",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRightWidth: 1,
    borderRightColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  tableCell: {
    width: "70%",
    padding: 10,
    justifyContent: "center",
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  tableCellText: {
    fontSize: 14,
  },
  footer: {
    marginTop: 60,
    textAlign: "center",
    fontSize: 13,
  },
  signature: {
    marginTop: 70,
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

interface AffiliationCertificateProps {
  caregiverName: string;
  caregiverBirthDate: string;
  caregiverPhone: string;
  registrationNumber: string; // 등록일자
  issueDate: string; // 발급일
}

export function AffiliationCertificate({
  caregiverName,
  caregiverBirthDate,
  caregiverPhone,
  registrationNumber,
  issueDate,
}: AffiliationCertificateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 제목 */}
        <Text style={styles.title}>간병인 소속확인서</Text>

        {/* 테이블 */}
        <View style={styles.table}>
          {/* 소속 */}
          <View style={styles.tableRow}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>소속</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>간병노트 파트너</Text>
            </View>
          </View>

          {/* 성명 */}
          <View style={styles.tableRow}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>성명</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>{caregiverName}</Text>
            </View>
          </View>

          {/* 생년월일 */}
          <View style={styles.tableRow}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>생년월일</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>{caregiverBirthDate}</Text>
            </View>
          </View>

          {/* 연락처 */}
          <View style={styles.tableRow}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>연락처</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>{caregiverPhone}</Text>
            </View>
          </View>

          {/* 등록일자 */}
          <View style={styles.tableRowLast}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>등록일자</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>{registrationNumber}</Text>
            </View>
          </View>
        </View>

        {/* 푸터 */}
        <Text style={styles.footer}>
          현재 상기와 같이 간병노트 파트너임을 확인함.
        </Text>

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

