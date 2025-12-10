// ================================================
// 사업자 등록증 PDF 템플릿 (임시 - 나중에 실제 이미지로 교체)
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  logo: {
    fontSize: 10,
  },
  stamp: {
    fontSize: 10,
    color: "#666",
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 30,
    marginTop: 20,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  table: {
    marginVertical: 30,
    borderWidth: 2,
    borderColor: "#333",
    width: "100%",
    maxWidth: 500,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  lastRow: {
    flexDirection: "row",
  },
  headerCell: {
    width: "30%",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRightWidth: 1,
    borderRightColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  cell: {
    width: "70%",
    padding: 10,
    justifyContent: "center",
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  cellText: {
    fontSize: 14,
  },
  footer: {
    marginTop: 50,
    textAlign: "center",
  },
  issueDate: {
    fontSize: 12,
    marginBottom: 20,
  },
  issueOrg: {
    fontSize: 14,
    fontWeight: "bold",
  },
  note: {
    marginTop: 40,
    fontSize: 10,
    color: "#999",
    textAlign: "center",
  },
});

export function BusinessRegistration() {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.logo}>국세청</Text>
          <Text style={styles.stamp}>ms.go.kr</Text>
        </View>

        {/* 제목 */}
        <Text style={styles.title}>사 업 자 등 록 증</Text>
        <Text style={styles.subtitle}>( 부가가치세 면세사업자 )</Text>
        <Text style={[styles.subtitle, { marginTop: -20 }]}>등록번호 : 380-94-01767</Text>

        {/* 테이블 */}
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={styles.headerCell}>
              <Text style={styles.headerText}>상호</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellText}>간병노트</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.headerCell}>
              <Text style={styles.headerText}>성명</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellText}>이사장</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.headerCell}>
              <Text style={styles.headerText}>개업 연월일</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellText}>2023년 05월 12일</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.headerCell}>
              <Text style={styles.headerText}>사업장 소재지</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellText}>충청남도 아산시 충무로20번길 6, 3층(온천동)</Text>
            </View>
          </View>

          <View style={styles.lastRow}>
            <View style={styles.headerCell}>
              <Text style={styles.headerText}>사업의 종류</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellText}>
                [업태] 상업서비스 관리, 사업지원 및 임대 서비스업{"\n"}
                [종목] 고용 알선업, 개인 간병 및 유사 서비스업, 개인간병인
              </Text>
            </View>
          </View>
        </View>

        {/* 푸터 */}
        <View style={styles.footer}>
          <Text style={styles.issueDate}>2024년 11월 07일</Text>
          <Text style={styles.issueOrg}>아 산 세 무 서 장</Text>
        </View>

        {/* 주의사항 */}
        <Text style={styles.note}>
          ※ 이 문서는 임시 사업자등록증입니다. 나중에 실제 이미지로 교체됩니다.
        </Text>
      </Page>
    </Document>
  );
}

