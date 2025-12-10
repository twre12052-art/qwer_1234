// ================================================
// 작성된 간병일지 PDF
// ================================================

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

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
  logSection: {
    marginBottom: 30,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  logDate: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#059669",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#059669",
  },
  itemsList: {
    marginBottom: 10,
  },
  item: {
    fontSize: 10,
    marginBottom: 4,
    paddingLeft: 10,
  },
  memo: {
    fontSize: 10,
    lineHeight: 1.6,
    color: "#374151",
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
  },
  signatureSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  signatureLabel: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#059669",
  },
  signatureImage: {
    width: 200,
    height: 80,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
  },
});

interface CareLog {
  date: string;
  content: string;
  signature_data?: string | null;
}

interface CareLogsPdfProps {
  patientName: string;
  caregiverName: string;
  logs: CareLog[];
}

export function CareLogsPdf({
  patientName,
  caregiverName,
  logs,
}: CareLogsPdfProps) {
  if (!logs || logs.length === 0) {
    return null;
  }

  const parseLogContent = (content: string) => {
    if (!content) {
      return { items: [], memo: "" };
    }
    const parts = content.split("[메모]");
    const itemsPart = parts[0]?.replace("[수행 항목]", "").trim() || "";
    const memoPart = parts[1]?.trim() || "";
    const items = itemsPart ? itemsPart.split(",").map(i => i.trim()).filter(i => i) : [];
    return { items, memo: memoPart };
  };

  // 유효한 로그만 필터링
  const validLogs = logs.filter(log => log && log.content && log.date);
  
  if (validLogs.length === 0) {
    return null;
  }

  // 전체 파일 다운로드 API와 호환되도록 Fragment로 반환 (Document는 외부에서 제공)
  return (
    <>
      {validLogs.map((log, index) => {
        const { items, memo } = parseLogContent(log.content);
        // 한글 인코딩 문제 방지를 위해 날짜 포맷 간소화 (toLocaleDateString 대신 수동 포맷)
        const dateObj = new Date(log.date);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const weekday = weekdays[dateObj.getDay()];
        const dateStr = `${year}년 ${month}월 ${day}일 ${weekday}요일`;

        return (
          <Page key={index} size="A4" style={styles.page}>
            {/* 헤더 */}
            <View style={styles.header}>
              <Text style={styles.logo}>간병노트</Text>
            </View>

            {/* 제목 */}
            <Text style={styles.title}>간병일지</Text>

            {/* 정보 */}
            <View style={{ marginBottom: 20, padding: 15, backgroundColor: "#f0fdf4", borderRadius: 4 }}>
              <Text style={{ fontSize: 11, marginBottom: 5 }}>
                환자명: {patientName}
              </Text>
              <Text style={{ fontSize: 11, marginBottom: 5 }}>
                간병인: {caregiverName}
              </Text>
              <Text style={{ fontSize: 11 }}>
                작성일: {dateStr}
              </Text>
            </View>

            {/* 간병일지 내용 */}
            <View style={styles.logSection}>
              {items.length > 0 && (
                <View style={{ marginBottom: 15 }}>
                  <Text style={styles.sectionTitle}>✓ 수행 항목</Text>
                  <View style={styles.itemsList}>
                    {items.map((item, idx) => (
                      <Text key={idx} style={styles.item}>
                        • {item}
                      </Text>
                    ))}
                  </View>
                </View>
              )}

              {memo && (
                <View>
                  <Text style={styles.sectionTitle}>상세 메모</Text>
                  <Text style={styles.memo}>{memo}</Text>
                </View>
              )}
            </View>

            {/* 서명 섹션 */}
            {log.signature_data && (
              <View style={styles.signatureSection}>
                <Text style={styles.signatureLabel}>간병인 서명</Text>
                <Image
                  src={log.signature_data}
                  style={styles.signatureImage}
                  cache={false}
                />
              </View>
            )}

            {/* 푸터 */}
            <Text style={styles.footer}>
              간병노트 | www.carenote.kr | 1577-0000
            </Text>
          </Page>
        );
      })}
    </>
  );
}

