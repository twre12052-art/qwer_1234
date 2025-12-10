"use server";

import { createAdminClient } from "@/modules/shared/lib/supabase/admin";
import { getCaseByToken } from "@/modules/caregiver/actions";
import { Attachment } from "@/modules/shared/types/attachment";

/**
 * 간병인용: 토큰 기반 간병일지 PDF 첨부파일 조회
 */
export async function getCareLogAttachmentsByToken(token: string): Promise<Attachment[]> {
  // 1. 토큰 검증 및 caseId 가져오기
  const res = await getCaseByToken(token);
  if (res.error || !res.caseData) {
    return [];
  }

  // 2. adminSupabase로 간병일지 PDF 첨부파일만 조회
  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("attachments")
    .select("*")
    .eq("case_id", res.caseData.id)
    .eq("file_type", "CARE_LOG_PDF")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("간병일지 PDF 첨부파일 조회 오류:", error);
    return [];
  }

  return (data || []) as Attachment[];
}

/**
 * 간병인용: 토큰 기반 간병일지 PDF 첨부파일 삭제
 */
export async function deleteCareLogAttachmentByToken(token: string, attachmentId: string): Promise<{ success: boolean; message: string }> {
  // 1. 토큰 검증 및 caseId 가져오기
  const res = await getCaseByToken(token);
  if (res.error || !res.caseData) {
    return { success: false, message: "유효하지 않은 접근입니다." };
  }

  // 2. 첨부파일 정보 조회
  const adminSupabase = createAdminClient();
  const { data: attachment } = await adminSupabase
    .from("attachments")
    .select("file_url, file_type")
    .eq("id", attachmentId)
    .eq("case_id", res.caseData.id)
    .eq("file_type", "CARE_LOG_PDF")
    .single();

  if (!attachment) {
    return { success: false, message: "첨부파일을 찾을 수 없습니다." };
  }

  // 3. Storage에서 파일 삭제
  const filePath = attachment.file_url.split("/").slice(-2).join("/");
  const { error: storageError } = await adminSupabase.storage
    .from("attachments")
    .remove([filePath]);

  if (storageError) {
    console.error("Storage 파일 삭제 오류:", storageError);
  }

  // 4. DB에서 삭제
  const { error } = await adminSupabase
    .from("attachments")
    .delete()
    .eq("id", attachmentId)
    .eq("case_id", res.caseData.id);

  if (error) {
    console.error("첨부파일 삭제 오류:", error);
    return { success: false, message: "첨부파일 삭제에 실패했습니다." };
  }

  return { success: true, message: "첨부파일이 삭제되었습니다." };
}

/**
 * 간병인용: 업로드 경로 생성 (토큰 기반)
 */
export async function getCareLogUploadPathByToken(
  token: string,
  fileName: string
): Promise<{ success: boolean; filePath?: string; caseId?: string; error?: string }> {
  // 1. 토큰 검증 및 caseId 가져오기
  const res = await getCaseByToken(token);
  if (res.error || !res.caseData) {
    return { success: false, error: "유효하지 않은 접근입니다." };
  }

  // 2. 파일명 정리
  const sanitizeFileName = (fileName: string): string => {
    const lastDotIndex = fileName.lastIndexOf(".");
    if (lastDotIndex === -1) {
      return `file_${Date.now()}`;
    }
    const ext = fileName.substring(lastDotIndex).toLowerCase();
    const nameWithoutExt = fileName.substring(0, lastDotIndex);
    let sanitized = nameWithoutExt
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
    if (!sanitized || sanitized.length < 2) {
      sanitized = `file_${Date.now()}`;
    } else {
      sanitized = sanitized.substring(0, 50);
    }
    return `${sanitized}${ext}`;
  };

  const sanitizedFileName = sanitizeFileName(fileName);
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const filePath = `${res.caseData.id}/${timestamp}_${randomStr}_${sanitizedFileName}`;

  return {
    success: true,
    filePath: filePath,
    caseId: res.caseData.id,
  };
}

/**
 * 간병인용: 간병일지 PDF 파일 업로드 (서버에서 처리)
 */
export async function uploadCareLogAttachmentByToken(
  token: string,
  formData: FormData
): Promise<{ success: boolean; message: string; attachmentId?: string }> {
  // 1. 토큰 검증 및 caseId 가져오기
  const res = await getCaseByToken(token);
  if (res.error || !res.caseData) {
    return { success: false, message: "유효하지 않은 접근입니다." };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, message: "파일이 없습니다." };
  }

  // 2. 파일명 정리 및 경로 생성
  const sanitizeFileName = (fileName: string): string => {
    const lastDotIndex = fileName.lastIndexOf(".");
    if (lastDotIndex === -1) {
      return `file_${Date.now()}`;
    }
    const ext = fileName.substring(lastDotIndex).toLowerCase();
    const nameWithoutExt = fileName.substring(0, lastDotIndex);
    let sanitized = nameWithoutExt
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
    if (!sanitized || sanitized.length < 2) {
      sanitized = `file_${Date.now()}`;
    } else {
      sanitized = sanitized.substring(0, 50);
    }
    return `${sanitized}${ext}`;
  };

  const sanitizedFileName = sanitizeFileName(file.name);
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const filePath = `${res.caseData.id}/${timestamp}_${randomStr}_${sanitizedFileName}`;

  // 3. adminSupabase로 Storage에 업로드
  const adminSupabase = createAdminClient();
  const fileBuffer = await file.arrayBuffer();
  const { error: uploadError } = await adminSupabase.storage
    .from("attachments")
    .upload(filePath, fileBuffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/pdf",
    });

  if (uploadError) {
    console.error("Storage 업로드 오류:", uploadError);
    return { success: false, message: "파일 업로드에 실패했습니다." };
  }

  // 4. Public URL 생성
  const { data: urlData } = adminSupabase.storage
    .from("attachments")
    .getPublicUrl(filePath);

  const publicUrl = urlData.publicUrl;

  // 5. DB에 메타데이터 저장
  const { data, error } = await adminSupabase
    .from("attachments")
    .insert({
      case_id: res.caseData.id,
      file_type: "CARE_LOG_PDF",
      file_name: file.name,
      file_url: publicUrl,
      file_size: file.size,
    })
    .select()
    .single();

  if (error) {
    console.error("간병일지 PDF 첨부파일 메타데이터 저장 오류:", error);
    // 메타데이터 저장 실패 시 Storage에서 파일 삭제
    await adminSupabase.storage.from("attachments").remove([filePath]);
    return { success: false, message: "첨부파일 정보 저장에 실패했습니다." };
  }

  return {
    success: true,
    message: "첨부파일이 업로드되었습니다.",
    attachmentId: data.id,
  };
}

/**
 * 간병인용: 간병일지 PDF 첨부파일 메타데이터 저장 (레거시 - 사용 안 함)
 */
export async function saveCareLogAttachmentByToken(
  token: string,
  fileName: string,
  filePath: string,
  fileSize: number
): Promise<{ success: boolean; message: string; attachmentId?: string }> {
  // 이 함수는 더 이상 사용하지 않음 (uploadCareLogAttachmentByToken 사용)
  return { success: false, message: "이 함수는 더 이상 사용되지 않습니다." };
}

