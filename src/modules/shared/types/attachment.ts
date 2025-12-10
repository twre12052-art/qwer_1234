// 첨부파일 타입 정의

export type AttachmentType = 
  | 'HOSPITAL_RECEIPT'      // 병원 영수증
  | 'HOSPITAL_DETAIL'        // 병원 세부영수증
  | 'ADMISSION_DISCHARGE'    // 입퇴원 확인서
  | 'NURSING_LOG'            // 간호일지
  | 'CARE_LOG_PDF';          // 간병일지 PDF

export interface Attachment {
  id: string;
  case_id: string;
  file_type: AttachmentType;
  file_name: string;
  file_url: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

// 첨부파일 타입별 라벨
export const ATTACHMENT_TYPE_LABELS: Record<AttachmentType, string> = {
  HOSPITAL_RECEIPT: '병원 영수증',
  HOSPITAL_DETAIL: '병원 세부내역영수증',
  ADMISSION_DISCHARGE: '입퇴원 확인서',
  NURSING_LOG: '간호일지',
  CARE_LOG_PDF: '간병일지 PDF',
};

// 허용된 파일 확장자 (일반적인 업로드 사이트 기준)
// 이미지: JPG, JPEG, PNG, GIF, WEBP, BMP (사진, 캡처)
// 문서: PDF (스캔본, 문서)
// 오피스: DOC, DOCX, XLS, XLSX, PPT, PPTX (병원 서류)
export const ALLOWED_FILE_EXTENSIONS = [
  // 이미지 (사진, 캡처)
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp',
  // 문서
  '.pdf',
  // 오피스 문서
  '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
];

// 파일 크기 제한: 20MB (일반적인 업로드 사이트 기준)
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// MIME 타입 매핑 (브라우저 호환성)
export const ALLOWED_MIME_TYPES = [
  // 이미지
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
  // 문서
  'application/pdf',
  // 오피스
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

