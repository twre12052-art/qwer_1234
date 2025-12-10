"use client";

import { useState, useEffect, useRef } from "react";
import { getCareLogAttachmentsByToken, deleteCareLogAttachmentByToken, uploadCareLogAttachmentByToken } from "@/modules/attachment/caregiver-actions";
import { Attachment, ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE } from "@/modules/shared/types/attachment";

interface CareLogAttachmentsProps {
  token: string;
}

export function CareLogAttachments({ token }: CareLogAttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 첨부파일 목록 로드
  const loadAttachments = async () => {
    try {
      setLoading(true);
      const data = await getCareLogAttachmentsByToken(token);
      setAttachments(data);
    } catch (err: any) {
      setError(err.message || "첨부파일을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, [token]);

  // 파일 유효성 검사
  const validateFile = (file: File): string | null => {
    const fileName = file.name.toLowerCase();
    const lastDotIndex = fileName.lastIndexOf(".");
    
    if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
      return "파일 확장자가 없습니다.";
    }
    
    const ext = fileName.substring(lastDotIndex);
    
    if (!ALLOWED_FILE_EXTENSIONS.includes(ext)) {
      return `지원하지 않는 파일 형식입니다. PDF 파일만 업로드 가능합니다.`;
    }

    if (file.size === 0) {
      return "빈 파일은 업로드할 수 없습니다.";
    }
    
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      const maxSizeMB = MAX_FILE_SIZE / 1024 / 1024;
      return `파일 크기가 너무 큽니다. (현재: ${fileSizeMB}MB, 최대: ${maxSizeMB}MB)`;
    }

    return null;
  };

  // 파일 업로드 처리
  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append("file", file);

      // 서버 액션으로 업로드
      const result = await uploadCareLogAttachmentByToken(token, formData);

      if (!result.success) {
        setError(result.message);
        setUploading(false);
        return;
      }

      setSuccess("✅ 파일이 업로드되었습니다!");
      setError(""); // 성공 시 에러 메시지 제거
      
      // 목록 새로고침
      await loadAttachments();
      
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
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

  // 파일 삭제
  const handleDelete = async (attachmentId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) {
      return;
    }

    try {
      const result = await deleteCareLogAttachmentByToken(token, attachmentId);
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

  return (
    <div className="space-y-4">
      {/* 에러/성공 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-base">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="font-medium whitespace-pre-line">{error}</p>
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

      {/* 업로드 섹션 */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          간병일지 PDF
        </label>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400 bg-gray-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(file);
              }
            }}
            disabled={uploading}
            className="hidden"
            id="care-log-pdf-upload"
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
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-xs"
            >
              {uploading ? "업로드 중..." : "선택"}
            </button>
          </div>
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
          <div className="space-y-2">
            {attachments.map((att) => (
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
        )}
      </div>
    </div>
  );
}

