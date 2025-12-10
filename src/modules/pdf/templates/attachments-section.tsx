// ================================================
// 첨부파일 섹션 (PDF)
// ================================================

import { Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { Attachment, AttachmentType, ATTACHMENT_TYPE_LABELS } from "@/modules/shared/types/attachment";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "NanumGothic",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#059669",
  },
  section: {
    marginBottom: 20,
    pageBreakInside: "avoid",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#059669",
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: "#10b981",
  },
  fileItem: {
    marginBottom: 15,
    pageBreakInside: "avoid",
  },
  fileName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#065f46",
  },
  imageContainer: {
    marginTop: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    padding: 5,
    backgroundColor: "#f9fafb",
  },
  image: {
    width: "100%",
    maxHeight: 400,
    objectFit: "contain",
  },
  fileInfo: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 5,
  },
  pdfNote: {
    fontSize: 10,
    color: "#dc2626",
    fontStyle: "italic",
    marginTop: 5,
    padding: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 4,
  },
  emptyMessage: {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
  note: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#fef3c7",
    borderRadius: 4,
  },
  noteText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#78350f",
  },
});

interface AttachmentsSectionProps {
  attachments: Attachment[];
}

export function AttachmentsSection({ attachments }: AttachmentsSectionProps) {
  // 타입별로 그룹화
  const attachmentsByType = attachments.reduce((acc, att) => {
    if (!acc[att.file_type]) {
      acc[att.file_type] = [];
    }
    acc[att.file_type].push(att);
    return acc;
  }, {} as Record<AttachmentType, Attachment[]>);

  // 타입 순서 정의
  const typeOrder: AttachmentType[] = [
    "HOSPITAL_RECEIPT",
    "HOSPITAL_DETAIL",
    "ADMISSION_DISCHARGE",
    "NURSING_LOG",
  ];

  return (
    <Page size="A4" style={styles.page}>
      {/* 제목 */}
      <Text style={styles.title}>📎 첨부 서류</Text>

      {/* 첨부파일이 없는 경우 */}
      {attachments.length === 0 ? (
        <View style={styles.emptyMessage}>
          <Text>첨부된 서류가 없습니다.</Text>
        </View>
      ) : (
        <>
          {/* 타입별로 표시 */}
          {typeOrder.map((type) => {
            const typeAttachments = attachmentsByType[type] || [];
            if (typeAttachments.length === 0) return null;

            return (
              <View key={type} style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {ATTACHMENT_TYPE_LABELS[type]} ({typeAttachments.length}개)
                </Text>
                {typeAttachments.map((att, index) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(att.file_name);
                  const isPdf = /\.pdf$/i.test(att.file_name);
                  
                  return (
                    <View key={att.id} style={styles.fileItem}>
                      <Text style={styles.fileName}>
                        {index + 1}. {att.file_name}
                      </Text>
                      
                      {/* 이미지 파일인 경우 이미지 표시 */}
                      {isImage && (
                        <View style={styles.imageContainer}>
                          <Image 
                            src={att.file_url} 
                            style={styles.image}
                            cache={false}
                          />
                        </View>
                      )}
                      
                      {/* PDF 파일인 경우 안내 메시지 */}
                      {isPdf && (
                        <View style={styles.pdfNote}>
                          <Text>📄 PDF 파일: {att.file_name}</Text>
                          <Text style={{ fontSize: 9, marginTop: 3 }}>
                            원본 파일은 별도로 확인해주세요.
                          </Text>
                        </View>
                      )}
                      
                      {/* 기타 파일 (오피스 문서 등) */}
                      {!isImage && !isPdf && (
                        <View style={styles.pdfNote}>
                          <Text>📎 파일: {att.file_name}</Text>
                          <Text style={{ fontSize: 9, marginTop: 3 }}>
                            원본 파일은 별도로 확인해주세요.
                          </Text>
                        </View>
                      )}
                      
                      <Text style={styles.fileInfo}>
                        크기: {(att.file_size / 1024).toFixed(1)} KB
                        {" • "}
                        업로드일: {new Date(att.created_at).toLocaleDateString("ko-KR")}
                      </Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </>
      )}

      {/* 안내사항 */}
      <View style={styles.note}>
        <Text style={styles.noteText}>
          📌 첨부 서류 안내
          {"\n"}
          • 위 첨부 서류는 보험 청구 시 함께 제출하시면 됩니다.
          {"\n"}
          • 각 파일의 URL을 클릭하시면 원본 파일을 확인하실 수 있습니다.
          {"\n"}
          • 파일이 보이지 않는 경우 고객센터(1577-0000)로 문의하세요.
        </Text>
      </View>
    </Page>
  );
}

