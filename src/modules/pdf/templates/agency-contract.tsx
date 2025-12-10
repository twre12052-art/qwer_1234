// ================================================
// 간병노트 간병인 중개 계약서 PDF 템플릿
// (케어네이션 스타일 참고)
// ================================================

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "NanumGothic",
    backgroundColor: "white",
  },
  header: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2563eb",
    marginBottom: 5,
    letterSpacing: 3,
  },
  logoSubtitle: {
    fontSize: 10,
    textAlign: "center",
    color: "#6b7280",
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 25,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  // 당사자 정보 테이블
  infoTable: {
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
  },
  infoRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    minHeight: 32,
  },
  infoLastRow: {
    flexDirection: "row",
    minHeight: 32,
  },
  infoHeader: {
    width: "20%",
    padding: 8,
    backgroundColor: "#f3f4f6",
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
    fontSize: 11,
    fontWeight: "bold",
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: {
    width: "25%",
    padding: 8,
    backgroundColor: "#fafafa",
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
    fontSize: 10,
    justifyContent: "center",
  },
  infoValue: {
    width: "55%",
    padding: 8,
    fontSize: 10,
    justifyContent: "center",
  },
  // 조문 스타일
  articleSection: {
    marginBottom: 15,
  },
  articleTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1f2937",
  },
  articleContent: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: "#374151",
    textAlign: "justify",
  },
  // 계약사항 박스
  contractBox: {
    marginVertical: 15,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  contractTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#1f2937",
  },
  contractTable: {
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  contractRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    minHeight: 30,
  },
  contractLastRow: {
    flexDirection: "row",
    minHeight: 30,
  },
  contractLabel: {
    width: "30%",
    padding: 8,
    backgroundColor: "#f3f4f6",
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
    fontSize: 10,
    fontWeight: "bold",
    justifyContent: "center",
  },
  contractValue: {
    width: "70%",
    padding: 8,
    fontSize: 10,
    justifyContent: "center",
  },
  // 서명 섹션
  signatureSection: {
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: "#e5e7eb",
  },
  signatureText: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 20,
  },
  signatureDate: {
    fontSize: 11,
    textAlign: "center",
    marginBottom: 18,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  signatureBlock: {
    textAlign: "center",
  },
  signatureLabel: {
    fontSize: 9,
    marginBottom: 6,
    color: "#6b7280",
  },
  signatureName: {
    fontSize: 11,
    fontWeight: "bold",
  },
});

interface AgencyContractProps {
  caregiverName: string;
  caregiverPhone: string;
  caregiverBirthDate: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  patientName: string;
  hospitalName: string;
  diagnosis: string;
  startDate: string;
  endDate: string;
  dailyWage: number;
  totalDays: number;
  totalAmount: number;
  contractDate: string;
}

export function AgencyContract({
  caregiverName,
  caregiverPhone,
  caregiverBirthDate,
  guardianName,
  guardianPhone,
  guardianRelation,
  patientName,
  hospitalName,
  diagnosis,
  startDate,
  endDate,
  dailyWage,
  totalDays,
  totalAmount,
  contractDate,
}: AgencyContractProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.logo}>간병노트</Text>
          <Text style={styles.logoSubtitle}>CARENOTE</Text>
        </View>

        {/* 제목 */}
        <Text style={styles.title}>간병인 중개 계약서</Text>

        {/* 당사자 정보 테이블 */}
        <View style={styles.infoTable}>
          {/* 간병노트 */}
          <View style={styles.infoRow}>
            <View style={styles.infoHeader}>
              <Text>간병노트</Text>
            </View>
            <View style={styles.infoLabel}>
              <Text>상호</Text>
            </View>
            <View style={styles.infoValue}>
              <Text>간병노트</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={{ ...styles.infoHeader, backgroundColor: "white", borderRightWidth: 0 }} />
            <View style={styles.infoLabel}>
              <Text>사업자등록번호</Text>
            </View>
            <View style={styles.infoValue}>
              <Text>380-94-01767</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={{ ...styles.infoHeader, backgroundColor: "white", borderRightWidth: 0 }} />
            <View style={styles.infoLabel}>
              <Text>연락처</Text>
            </View>
            <View style={styles.infoValue}>
              <Text>1577-0000</Text>
            </View>
          </View>

          {/* 간병인 */}
          <View style={styles.infoRow}>
            <View style={styles.infoHeader}>
              <Text>간병인</Text>
            </View>
            <View style={styles.infoLabel}>
              <Text>이름</Text>
            </View>
            <View style={styles.infoValue}>
              <Text>{caregiverName}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={{ ...styles.infoHeader, backgroundColor: "white", borderRightWidth: 0 }} />
            <View style={styles.infoLabel}>
              <Text>생년월일</Text>
            </View>
            <View style={styles.infoValue}>
              <Text>{caregiverBirthDate}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={{ ...styles.infoHeader, backgroundColor: "white", borderRightWidth: 0 }} />
            <View style={styles.infoLabel}>
              <Text>연락처</Text>
            </View>
            <View style={styles.infoValue}>
              <Text>{caregiverPhone}</Text>
            </View>
          </View>

          {/* 구인자 */}
          <View style={styles.infoRow}>
            <View style={styles.infoHeader}>
              <Text>구인자</Text>
            </View>
            <View style={styles.infoLabel}>
              <Text>이름</Text>
            </View>
            <View style={styles.infoValue}>
              <Text>{guardianName}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={{ ...styles.infoHeader, backgroundColor: "white", borderRightWidth: 0 }} />
            <View style={styles.infoLabel}>
              <Text>연락처</Text>
            </View>
            <View style={styles.infoValue}>
              <Text>{guardianPhone}</Text>
            </View>
          </View>
          <View style={styles.infoLastRow}>
            <View style={{ ...styles.infoHeader, backgroundColor: "white", borderRightWidth: 0 }} />
            <View style={styles.infoLabel}>
              <Text>환자와 관계</Text>
            </View>
            <View style={styles.infoValue}>
              <Text>{guardianRelation}</Text>
            </View>
          </View>
        </View>

        {/* 제1조 */}
        <View style={styles.articleSection}>
          <Text style={styles.articleTitle}>제1조 (목적)</Text>
          <Text style={styles.articleContent}>
            ① 이 계약은 환자의 건강 회복을 위한 간병인을 중개함에 있어 간병노트, 간병인, 구인자의 권리와 의무에 대한 기본적인 사항을 정하는 것을 목적으로 한다.
          </Text>
        </View>

        {/* 제2조 */}
        <View style={styles.articleSection}>
          <Text style={styles.articleTitle}>제2조 (간병의 범위)</Text>
          <Text style={styles.articleContent}>
            ① 간병인은 환자에게 필요한 다음 각호의 간병 업무를 수행한다.{"\n"}
            1. 환자의 식사, 개인위생, 침대시트 교체, 배설, 이동, 목욕, 수면 등 일상생활 보조{"\n"}
            2. 약물투여보조, 체위변경 등 환자에 대한 치료행위의 보조{"\n"}
            3. 의료인의 지시에 따른 환자의 상태 관찰 및 보고{"\n"}
            4. 산책, 보행훈련 등 재활훈련 보조
          </Text>
        </View>

        {/* 제3조 계약사항 */}
        <View style={styles.contractBox}>
          <Text style={styles.contractTitle}>[계약사항]</Text>
          <View style={styles.contractTable}>
            <View style={styles.contractRow}>
              <View style={styles.contractLabel}>
                <Text>간병 기간</Text>
              </View>
              <View style={styles.contractValue}>
                <Text>{startDate} ~ {endDate} (총 {totalDays}일)</Text>
              </View>
            </View>
            <View style={styles.contractRow}>
              <View style={styles.contractLabel}>
                <Text>간병 장소</Text>
              </View>
              <View style={styles.contractValue}>
                <Text>{hospitalName}</Text>
              </View>
            </View>
            <View style={styles.contractRow}>
              <View style={styles.contractLabel}>
                <Text>간병 요금</Text>
              </View>
              <View style={styles.contractValue}>
                <Text>1일 {dailyWage.toLocaleString()}원 × {totalDays}일 = 총 {totalAmount.toLocaleString()}원</Text>
              </View>
            </View>
            <View style={styles.contractLastRow}>
              <View style={styles.contractLabel}>
                <Text>지불 방법</Text>
              </View>
              <View style={styles.contractValue}>
                <Text>간병 종료 시 간병인 계좌로 일괄 지급</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 제4조 */}
        <View style={styles.articleSection}>
          <Text style={styles.articleTitle}>제4조 (간병노트 의무)</Text>
          <Text style={styles.articleContent}>
            ① 간병노트는 간병인과 구인자 간의 원활한 중개 서비스를 제공한다.{"\n"}
            ② 간병노트는 직업안정법 및 기타 관련 법률의 규정을 준수해야 한다.
          </Text>
        </View>

        {/* 제5조 */}
        <View style={styles.articleSection}>
          <Text style={styles.articleTitle}>제5조 (간병인 의무)</Text>
          <Text style={styles.articleContent}>
            ① 간병인은 환자의 안전과 감염예방에 유의하며, 구인자와 합의한 계약사항을 준수하여 간병서비스를 제공한다.{"\n"}
            ② 간병인은 환자 또는 그 가족의 개인정보를 누설하여서는 아니된다.{"\n"}
            ③ 간병인은 환자에게 폭언, 폭행, 상해 또는 성희롱, 성폭력 등 신체적, 정신적 해를 끼치는 행위를 하여서는 아니된다.
          </Text>
        </View>

        {/* 제6조 */}
        <View style={styles.articleSection}>
          <Text style={styles.articleTitle}>제6조 (구인자 의무)</Text>
          <Text style={styles.articleContent}>
            ① 구인자는 간병요금을 기한 내에 납부하여야 한다.{"\n"}
            ② 구인자는 환자의 건강상태, 감염가능성 등 기타 간병에 필요한 정보를 간병인에게 충분히 제공하여야 한다.{"\n"}
            ③ 구인자는 간병인에게 폭언, 폭행, 상해 또는 성희롱, 성폭력 등 신체적, 정신적 해를 끼치는 행위를 하여서는 아니된다.
          </Text>
        </View>

        {/* 제7조 */}
        <View style={styles.articleSection}>
          <Text style={styles.articleTitle}>제7조 (기타)</Text>
          <Text style={styles.articleContent}>
            ① 이 계약서에 규정하지 않은 사항에 다툼이 있는 경우 간병노트 약관에 따른다.{"\n"}
            ② 양 당사자는 충분한 상호 협의하여 다툼을 해결함을 원칙으로 하되, 합의되지 않을 경우 관계 법령 및 사회상규에 따른다.
          </Text>
        </View>

        {/* 서명 섹션 */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureText}>
            위와 같이 계약을 체결하고 본 계약의 체결을 증명하기 위하여 계약서를 작성한다.
          </Text>

          <Text style={styles.signatureDate}>작성 일자 : {contractDate}</Text>

          <View style={styles.signatureRow}>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>간병노트</Text>
              <Text style={styles.signatureName}>대표 이사장</Text>
              <Text style={{ fontSize: 9, marginTop: 3, color: "#9ca3af" }}>
                {contractDate} 동의함
              </Text>
            </View>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>구인자</Text>
              <Text style={styles.signatureName}>{guardianName}</Text>
              <Text style={{ fontSize: 9, marginTop: 3, color: "#9ca3af" }}>
                {contractDate} 동의함
              </Text>
            </View>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>간병인</Text>
              <Text style={styles.signatureName}>{caregiverName}</Text>
              <Text style={{ fontSize: 9, marginTop: 3, color: "#9ca3af" }}>
                {contractDate} 동의함
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
