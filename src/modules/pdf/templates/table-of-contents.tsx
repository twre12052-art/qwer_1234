// ================================================
// 목차 페이지
// ================================================

import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: "NanumGothic",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 50,
    textAlign: "center",
    letterSpacing: 2,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2563eb",
  },
  itemContainer: {
    marginBottom: 15,
    paddingLeft: 20,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563eb",
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 14,
    flex: 1,
  },
  itemPage: {
    fontSize: 14,
    color: "#64748b",
  },
  divider: {
    marginVertical: 20,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  note: {
    marginTop: 40,
    padding: 20,
    backgroundColor: "#fef3c7",
    borderRadius: 4,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#92400e",
  },
  noteText: {
    fontSize: 12,
    lineHeight: 1.6,
    color: "#78350f",
  },
});

interface TableOfContentsProps {
  hasAttachments?: boolean;
  attachmentPageNumber?: number;
  hasCareLogs?: boolean;
  careLogsPageNumber?: number;
}

export function TableOfContents({ 
  hasAttachments = false, 
  attachmentPageNumber = 7,
  hasCareLogs = false,
  careLogsPageNumber = 7
}: TableOfContentsProps) {
  return (
    <Page size="A4" style={styles.page}>
      {/* 제목 */}
      <Text style={styles.title}>목 차</Text>

      {/* 서류 목록 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📄 보험 청구 서류</Text>

        <View style={styles.itemContainer}>
          <View style={styles.item}>
            <Text style={styles.itemNumber}>1.</Text>
            <Text style={styles.itemTitle}>간병인 소속확인서</Text>
            <Text style={styles.itemPage}>3페이지</Text>
          </View>
        </View>

        <View style={styles.itemContainer}>
          <View style={styles.item}>
            <Text style={styles.itemNumber}>2.</Text>
            <Text style={styles.itemTitle}>간병인 사용확인서</Text>
            <Text style={styles.itemPage}>4페이지</Text>
          </View>
        </View>

        <View style={styles.itemContainer}>
          <View style={styles.item}>
            <Text style={styles.itemNumber}>3.</Text>
            <Text style={styles.itemTitle}>사업자 등록증</Text>
            <Text style={styles.itemPage}>5페이지</Text>
          </View>
        </View>

        <View style={styles.itemContainer}>
          <View style={styles.item}>
            <Text style={styles.itemNumber}>4.</Text>
            <Text style={styles.itemTitle}>간병인 중개 계약서</Text>
            <Text style={styles.itemPage}>6페이지</Text>
          </View>
        </View>
      </View>

             {/* 간병일지 섹션 (있는 경우만 표시) */}
             {hasCareLogs && (
               <View style={styles.section}>
                 <Text style={styles.sectionTitle}>📝 간병일지</Text>
                 <View style={styles.itemContainer}>
                   <View style={styles.item}>
                     <Text style={styles.itemNumber}>5.</Text>
                     <Text style={styles.itemTitle}>간병일지</Text>
                     <Text style={styles.itemPage}>{careLogsPageNumber}페이지</Text>
                   </View>
                 </View>
               </View>
             )}

             {/* 첨부파일 섹션 (있는 경우만 표시) */}
             {hasAttachments && (
               <View style={styles.section}>
                 <Text style={styles.sectionTitle}>📎 첨부 서류</Text>
                 <View style={styles.itemContainer}>
                   <View style={styles.item}>
                     <Text style={styles.itemNumber}>{hasCareLogs ? "6." : "5."}</Text>
                     <Text style={styles.itemTitle}>병원 영수증 및 기타 서류</Text>
                     <Text style={styles.itemPage}>{attachmentPageNumber}페이지</Text>
                   </View>
                 </View>
               </View>
             )}

      <View style={styles.divider} />

      {/* 안내사항 */}
      <View style={styles.note}>
        <Text style={styles.noteTitle}>📌 서류 사용 안내</Text>
        <Text style={styles.noteText}>
          • 본 서류는 보험 청구용으로 발급되었습니다.
          {"\n"}
          • 연말정산 의료비 공제용 영수증이 아닙니다.
          {"\n"}
          • 각 서류는 보험사 제출 시 함께 첨부하시면 됩니다.
          {"\n"}
          • 추가 서류가 필요하신 경우 고객센터(1577-0000)로 문의하세요.
        </Text>
      </View>
    </Page>
  );
}

