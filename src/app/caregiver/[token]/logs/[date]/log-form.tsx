"use client";

import { useState, useRef } from "react";
import { SignaturePad } from "./signature-pad";
import { SignatureConfirmModal } from "./signature-confirm-modal";

interface LogFormProps {
  initialMemo: string;
  checkedItems: Set<string>;
  initialSignature?: string | null;
  isSigned?: boolean; // 서명이 이미 있는지 여부
}

export function LogForm({ initialMemo, checkedItems, initialSignature, isSigned = false }: LogFormProps) {
  const [signatureData, setSignatureData] = useState<string | null>(initialSignature || null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  // 서명이 이미 있으면 수정 불가
  const hasExistingSignature = !!initialSignature;
  const isDisabled = hasExistingSignature && !isSigned; // isSigned는 어드민 여부를 나타냄

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 서명이 있고 기존에 서명이 없었던 경우 (새로 서명하는 경우)
    if (signatureData && !hasExistingSignature) {
      setShowConfirmModal(true);
      return;
    }
    
    // 서명이 없거나 기존 서명이 있는 경우 바로 제출
    formRef.current?.submit();
  };

  const handleConfirm = () => {
    setShowConfirmModal(false);
    formRef.current?.submit();
  };

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit}>
        {/* 수행 항목 */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">수행 항목</h2>
          <div className="space-y-3">
            {[
              { id: "meal", label: "식사 보조", value: "식사 보조" },
              { id: "position", label: "체위 변경", value: "체위 변경" },
              { id: "medication", label: "투약", value: "투약" },
              { id: "mobility", label: "이동 도움", value: "이동 도움" },
              { id: "toilet", label: "배변/배뇨 도움", value: "배변/배뇨 도움" },
            ].map((item) => (
              <div key={item.id} className="flex items-center">
                <input
                  type="checkbox"
                  name={item.id}
                  id={item.id}
                  data-testid={`checklist-${item.id}`}
                  defaultChecked={checkedItems.has(item.value)}
                  disabled={isDisabled}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label htmlFor={item.id} className={`ml-3 text-base ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* 상세 메모 */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">상세 메모</h2>
          <textarea
            name="content"
            defaultValue={initialMemo}
            data-testid="log-memo-input"
            placeholder="환자분의 상태나 특이사항을 간단히 적어주세요."
            disabled={isDisabled}
            className="w-full text-base border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          ></textarea>
        </div>

        {/* 서명 패드 */}
        <SignaturePad
          onSignatureChange={setSignatureData}
          initialSignature={initialSignature}
          disabled={isDisabled}
        />

        {/* 서명 데이터를 hidden input으로 전달 */}
        <input type="hidden" name="signature" value={signatureData || ""} />

        {/* 서명 후 수정 불가 안내 */}
        {hasExistingSignature && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ 서명 완료</strong>
              <br />
              이 일지는 이미 서명되어 수정할 수 없습니다.
              <br />
              수정이 필요한 경우 고객센터(1577-0000)로 연락주세요.
            </p>
          </div>
        )}

        {/* 저장 버튼 */}
        <button
          type="submit"
          data-testid="save-log-button"
          disabled={isDisabled}
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {hasExistingSignature ? "🔒 서명 완료 (수정 불가)" : "💾 저장하기"}
        </button>
      </form>

      {/* 서명 확인 모달 */}
      <SignatureConfirmModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
}

