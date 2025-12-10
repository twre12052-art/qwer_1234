"use client";

import { useState, useEffect, useRef } from "react";
import { getAttachments, deleteAttachment, getUploadPath, saveAttachmentMetadata } from "@/modules/attachment/actions";
import { Attachment, AttachmentType, ATTACHMENT_TYPE_LABELS, ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE } from "@/modules/shared/types/attachment";
import { createClient } from "@/modules/shared/lib/supabase/client";

interface AttachmentsSectionProps {
  caseId: string;
}

export function AttachmentsSection({ caseId }: AttachmentsSectionProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<AttachmentType>("HOSPITAL_RECEIPT");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // 첨부파일 목록 로드
  const loadAttachments = async () => {
    try {
      setLoading(true);
      const data = await getAttachments(caseId);
      setAttachments(data);
    } catch (err: any) {
      setError(err.message || "첨부파일을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, [caseId]);

  // 파일 유효성 검사 (개선된 버전)
  const validateFile = (file: File): string | null => {
    // 파일명에서 확장자 추출 (더 안전한 방법)
    const fileName = file.name.toLowerCase();
    const lastDotIndex = fileName.lastIndexOf(".");
    
    if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
      return "파일 확장자가 없습니다. 파일명에 확장자를 포함해주세요.";
    }
    
    const ext = fileName.substring(lastDotIndex); // .png, .jpg 등
    
    // 확장자 확인
    if (!ALLOWED_FILE_EXTENSIONS.includes(ext)) {
      const allowedList = ALLOWED_FILE_EXTENSIONS.map(e => e.toUpperCase().replace('.', '')).join(', ');
      return `지원하지 않는 파일 형식입니다.\n지원 형식: ${allowedList}\n현재 파일: ${ext.toUpperCase()}`;
    }

    // 파일 크기 확인
    if (file.size === 0) {
      return "빈 파일은 업로드할 수 없습니다.";
    }
    
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      const maxSizeMB = MAX_FILE_SIZE / 1024 / 1024;
      return `파일 크기가 너무 큽니다.\n현재: ${fileSizeMB}MB\n최대: ${maxSizeMB}MB`;
    }

    return null;
  };

  // 파일 업로드 처리
  const handleFileUpload = async (file: File, fileType?: AttachmentType) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // 파일 타입이 전달되지 않으면 기본값 사용
    const targetFileType = fileType || selectedType;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      // 1. 업로드 경로 생성 및 권한 확인
      const pathResult = await getUploadPath(caseId, targetFileType, file.name);
      if (!pathResult.success || !pathResult.filePath) {
        setError(pathResult.error || "업로드 경로 생성에 실패했습니다.");
        setUploading(false);
        return;
      }

      // 2. Storage에 직접 업로드 (클라이언트에서)
      const supabase = createClient();
      
      console.log("📤 업로드 시작:", {
        bucket: "attachments",
        path: pathResult.filePath,
        fileName: file.name,
        fileSize: file.size,
        fileSizeMB: (file.size / 1024 / 1024).toFixed(2) + "MB",
        fileType: file.type,
        fileExtension: file.name.substring(file.name.lastIndexOf(".")),
      });
      
      // 업로드 진행률 표시를 위한 옵션
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(pathResult.filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) {
        console.error("❌ Storage 업로드 오류:", {
          error: uploadError,
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          errorCode: uploadError.error,
        });
        
        // 구체적인 에러 메시지
        let errorMessage = "파일 업로드에 실패했습니다.";
        let detailMessage = "";
        
        if (uploadError.message?.includes("Bucket not found") || uploadError.error === "Bucket not found") {
          errorMessage = "⚠️ Storage Bucket이 없습니다.";
          detailMessage = "Supabase Dashboard → Storage → [New bucket] → Name: attachments, Public: ✓";
        } else if (
          uploadError.message?.includes("new row violates row-level security") ||
          uploadError.message?.includes("permission denied") ||
          uploadError.statusCode === "403"
        ) {
          errorMessage = "⚠️ 권한이 없습니다.";
          detailMessage = "Storage RLS 정책을 확인해주세요. SQL: 0013_storage_policies_simple.sql 실행 필요";
        } else if (uploadError.message?.includes("duplicate") || uploadError.statusCode === "409") {
          errorMessage = "같은 이름의 파일이 이미 존재합니다.";
        } else {
          errorMessage = `파일 업로드 실패: ${uploadError.message || uploadError.error || "알 수 없는 오류"}`;
          detailMessage = `상세: ${JSON.stringify(uploadError)}`;
        }
        
        setError(`${errorMessage}${detailMessage ? `\n${detailMessage}` : ""}`);
        setUploading(false);
        return;
      }
      
      console.log("✅ Storage 업로드 성공:", uploadData);

      if (!uploadData) {
        setError("파일 업로드에 실패했습니다. (데이터 없음)");
        setUploading(false);
        return;
      }

      // 3. 메타데이터 저장
      const metaResult = await saveAttachmentMetadata(
        caseId,
        targetFileType,
        file.name,
        pathResult.filePath,
        file.size
      );

      if (!metaResult.success) {
        setError(metaResult.message);
        // 업로드는 성공했지만 메타데이터 저장 실패 시 Storage에서 삭제
        try {
          await supabase.storage.from("attachments").remove([pathResult.filePath]);
        } catch (removeErr) {
          console.error("Storage 파일 삭제 실패:", removeErr);
        }
        setUploading(false);
        return;
      }

      setSuccess("✅ 파일이 업로드되었습니다!");
      setError(""); // 성공 시 에러 메시지 제거
      
      // 목록 새로고침
      await loadAttachments();
      
      // 3초 후 성공 메시지 자동 제거
      setTimeout(() => {
        setSuccess("");
      }, 3000);
      
    } catch (err: any) {
      console.error("업로드 오류:", err);
      setError(err.message || "파일 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  // 파일 선택 (클릭)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 드래그 앤 드롭
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // 파일 삭제
  const handleDelete = async (attachmentId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const result = await deleteAttachment(attachmentId, caseId);
      if (result.success) {
        setSuccess(result.message);
        await loadAttachments();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || "삭제 중 오류가 발생했습니다.");
    }
  };

  // 타입별 첨부파일 그룹화
  const attachmentsByType = attachments.reduce((acc, att) => {
    if (!acc[att.file_type]) {
      acc[att.file_type] = [];
    }
    acc[att.file_type].push(att);
    return acc;
  }, {} as Record<AttachmentType, Attachment[]>);

  return (
    <div className="space-y-6">
      {/* 에러/성공 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-base">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="font-medium whitespace-pre-line">{error}</p>
              {error.includes("Bucket not found") && (
                <div className="text-sm mt-2 text-red-500 space-y-1">
                  <p>📖 가이드: docs/첨부파일_업로드_완전_가이드.md 참고</p>
                  <p>Supabase Dashboard → Storage → [New bucket] → Name: attachments, Public: ✓</p>
                </div>
              )}
              {error.includes("권한이 없습니다") && (
                <div className="text-sm mt-2 text-red-500 space-y-1">
                  <p>📖 가이드: docs/첨부파일_업로드_완전_가이드.md 참고</p>
                  <p>SQL 실행: 0013_storage_policies_simple.sql</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {success && (
        <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg text-base">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* 업로드 섹션 - 타입별로 분리 (가로 4칸) */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">파일 업로드</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(ATTACHMENT_TYPE_LABELS).map(([type, label]) => {
          const typeKey = `upload-${type}`;
          const typeFileInputRef = useRef<HTMLInputElement>(null);
          const [typeUploading, setTypeUploading] = useState(false);
          const [typeDragActive, setTypeDragActive] = useState(false);
          
          const handleTypeFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
              setTypeUploading(true);
              await handleFileUpload(file, type as AttachmentType);
              setTypeUploading(false);
            }
            if (typeFileInputRef.current) {
              typeFileInputRef.current.value = "";
            }
          };

          const handleTypeDrag = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.type === "dragenter" || e.type === "dragover") {
              setTypeDragActive(true);
            } else if (e.type === "dragleave") {
              setTypeDragActive(false);
            }
          };

          const handleTypeDrop = async (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setTypeDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) {
              setTypeUploading(true);
              await handleFileUpload(file, type as AttachmentType);
              setTypeUploading(false);
            }
          };

          return (
            <div key={type} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {label}
              </label>
              <div
                onDragEnter={handleTypeDrag}
                onDragLeave={handleTypeDrag}
                onDragOver={handleTypeDrag}
                onDrop={handleTypeDrop}
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors h-full ${
                  typeDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400 bg-gray-50"
                }`}
              >
                <input
                  ref={typeFileInputRef}
                  type="file"
                  accept={ALLOWED_FILE_EXTENSIONS.join(",")}
                  onChange={handleTypeFileSelect}
                  className="hidden"
                  disabled={typeUploading || uploading}
                  multiple={false}
                />
                <div className="space-y-2">
                  <svg
                    className="w-8 h-8 mx-auto text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-xs text-gray-600">
                    드래그 또는 클릭
                  </p>
                  <button
                    type="button"
                    onClick={() => typeFileInputRef.current?.click()}
                    disabled={typeUploading || uploading}
                    className="w-full px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-xs"
                  >
                    {typeUploading ? "업로드 중..." : "선택"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* 첨부파일 목록 */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">업로드된 파일</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500 text-base">로딩 중...</div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-base">
            업로드된 파일이 없습니다.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(ATTACHMENT_TYPE_LABELS).map(([type, label]) => {
              const typeAttachments = attachmentsByType[type as AttachmentType] || [];
              if (typeAttachments.length === 0) return null;

              return (
                <div key={type} className="space-y-2">
                  <h4 className="text-base font-semibold text-gray-700">
                    {label} ({typeAttachments.length}개)
                  </h4>
                  <div className="space-y-2">
                    {typeAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <svg
                            className="w-5 h-5 text-gray-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-medium text-gray-900 truncate">
                              {att.file_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {(att.file_size / 1024).toFixed(1)} KB ·{" "}
                              {new Date(att.created_at).toLocaleDateString("ko-KR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={att.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            보기
                          </a>
                          <button
                            onClick={() => handleDelete(att.id)}
                            className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

