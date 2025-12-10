"use client";

export function BackButton() {
  return (
    <button 
      type="button"
      onClick={() => window.history.back()}
      className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
    >
      뒤로가기
    </button>
  );
}

