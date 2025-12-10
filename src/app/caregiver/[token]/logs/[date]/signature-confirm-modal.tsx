"use client";

import { useState } from "react";

interface SignatureConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SignatureConfirmModal({ isOpen, onConfirm, onCancel }: SignatureConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            서명 후 수정 불가 안내
          </h2>
          <p className="text-base text-gray-600 mb-4">
            서명을 하면 간병일지를 수정할 수 없습니다.
            <br />
            내용을 신중히 확인한 후 진행해주세요.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
            <p className="text-sm text-blue-800">
              <strong>💡 수정이 필요한 경우</strong>
              <br />
              고객센터로 연락주시면 도와드리겠습니다.
              <br />
              <span className="text-blue-600 font-medium">고객센터: 1577-0000</span>
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            다시 확인
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            진행
          </button>
        </div>
      </div>
    </div>
  );
}

