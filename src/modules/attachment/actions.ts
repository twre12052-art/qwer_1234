"use server";

import { createClient } from "@/modules/shared/lib/supabase/server";
import { Attachment, AttachmentType } from "@/modules/shared/types/attachment";

/**
 * 케이스의 모든 첨부파일 조회
 * 보호자만 조회 가능 (RLS 정책으로 보호됨)
 * RLS 정책이 자동으로 권한을 확인하므로 cases 테이블 조회 불필요
 */
export async function getAttachments(caseId: string): Promise<Attachment[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("인증이 필요합니다.");
  }

  // RLS 정책이 자동으로 권한을 확인하므로 바로 조회
  // RLS 정책이 cases 테이블을 참조하여 guardian_id를 확인함
  const { data, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("첨부파일 조회 오류:", error);
    // RLS 정책 위반 시 빈 배열 반환 (권한 없음)
    if (error.code === 'PGRST301' || error.message?.includes('permission')) {
      return [];
    }
    throw new Error("첨부파일을 불러오는 중 오류가 발생했습니다.");
  }

  return (data || []) as Attachment[];
}

/**
 * 첨부파일 삭제
 * 보호자만 삭제 가능 (RLS 정책으로 보호됨)
 * RLS 정책이 자동으로 권한을 확인하므로 cases 테이블 조회 불필요
 */
export async function deleteAttachment(attachmentId: string, caseId: string): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, message: "인증이 필요합니다." };
  }

  // 첨부파일 정보 조회 (Storage에서 삭제하기 위해)
  const { data: attachment } = await supabase
    .from("attachments")
    .select("file_url")
    .eq("id", attachmentId)
    .eq("case_id", caseId)
    .single();

  if (!attachment) {
    return { success: false, message: "첨부파일을 찾을 수 없습니다." };
  }

  // Storage에서 파일 삭제
  const filePath = attachment.file_url.split("/").slice(-2).join("/"); // attachments/caseId/filename
  const { error: storageError } = await supabase.storage
    .from("attachments")
    .remove([filePath]);

  if (storageError) {
    console.error("Storage 파일 삭제 오류:", storageError);
    // Storage 삭제 실패해도 DB는 삭제 진행
  }

  // DB에서 삭제
  const { error } = await supabase
    .from("attachments")
    .delete()
    .eq("id", attachmentId)
    .eq("case_id", caseId);

  if (error) {
    console.error("첨부파일 삭제 오류:", error);
    return { success: false, message: "첨부파일 삭제에 실패했습니다." };
  }

  return { success: true, message: "첨부파일이 삭제되었습니다." };
}

/**
 * 파일명 정리 (한글 및 특수문자 처리)
 * Supabase Storage는 파일 경로에 한글이 포함되면 "Invalid key" 에러 발생
 * 따라서 한글을 제거하고 영문/숫자/안전한 문자만 사용
 */
function sanitizeFileName(fileName: string): string {
  // 확장자 추출 (소문자로 변환)
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    // 확장자가 없으면 타임스탬프만 사용
    return `file_${Date.now()}`;
  }
  
  const ext = fileName.substring(lastDotIndex).toLowerCase();
  const nameWithoutExt = fileName.substring(0, lastDotIndex);
  
  // 한글 및 특수문자를 제거하고 영문/숫자/하이픈/언더스코어만 허용
  // 한글은 완전히 제거 (Supabase Storage 호환성)
  let sanitized = nameWithoutExt
    .replace(/[^a-zA-Z0-9_-]/g, "_") // 한글 및 특수문자를 언더스코어로 변환
    .replace(/_+/g, "_") // 연속된 언더스코어를 하나로
    .replace(/^_|_$/g, ""); // 앞뒤 언더스코어 제거
  
  // 파일명이 너무 짧거나 비어있으면 타임스탬프 사용
  if (!sanitized || sanitized.length < 2) {
    sanitized = `file_${Date.now()}`;
  } else {
    // 최대 50자로 제한 (너무 긴 파일명 방지)
    sanitized = sanitized.substring(0, 50);
  }
  
  return `${sanitized}${ext}`;
}

/**
 * 업로드 경로 생성 및 권한 확인 (클라이언트에서 직접 업로드)
 */
export async function getUploadPath(
  caseId: string,
  fileType: AttachmentType,
  fileName: string
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "인증이 필요합니다." };
  }

  // RLS 정책이 자동으로 권한을 확인하므로 cases 테이블 조회 불필요

  // 파일명 정리 (한글 제거, URL-safe)
  const sanitizedFileName = sanitizeFileName(fileName);
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8); // 6자리 랜덤 문자열
  // 파일 경로: {caseId}/{timestamp}_{random}_{sanitizedFileName}
  // 한글이 제거된 안전한 파일명 사용
  const filePath = `${caseId}/${timestamp}_${randomStr}_${sanitizedFileName}`;

  return {
    success: true,
    filePath: filePath,
  };
}

/**
 * 첨부파일 메타데이터 저장 (Storage 업로드 후)
 */
export async function saveAttachmentMetadata(
  caseId: string,
  fileType: AttachmentType,
  fileName: string,
  filePath: string,
  fileSize: number
): Promise<{ success: boolean; message: string; attachmentId?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, message: "인증이 필요합니다." };
  }

  // RLS 정책이 자동으로 권한을 확인하므로 cases 테이블 조회 불필요

  // Public URL 생성
  const { data: urlData } = supabase.storage
    .from("attachments")
    .getPublicUrl(filePath);

  const publicUrl = urlData.publicUrl;

  // DB에 메타데이터 저장
  const { data, error } = await supabase
    .from("attachments")
    .insert({
      case_id: caseId,
      file_type: fileType,
      file_name: fileName,
      file_url: publicUrl,
      file_size: fileSize,
    })
    .select()
    .single();

  if (error) {
    console.error("첨부파일 메타데이터 저장 오류:", error);
    return { success: false, message: "첨부파일 정보 저장에 실패했습니다." };
  }

  return {
    success: true,
    message: "첨부파일이 업로드되었습니다.",
    attachmentId: data.id,
  };
}

