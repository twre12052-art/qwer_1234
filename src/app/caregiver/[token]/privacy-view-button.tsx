"use client";

export function PrivacyViewButton() {
  const handleView = () => {
    // 개인정보 수집 및 이용 동의 내용을 모달이나 새 창으로 표시
    alert("개인정보 수집 및 이용 동의 내용\n\n간병 서비스 제공을 위해 필요한 최소한의 개인정보를 수집합니다.\n\n수집 항목: 이름, 연락처, 생년월일, 주소, 계좌정보\n\n이용 목적: 간병 서비스 제공, 보험 청구 서류 작성\n\n보관 기간: 서비스 종료 후 1년");
  };

  return (
    <button 
      type="button"
      onClick={handleView}
      className="text-sm text-blue-600 hover:underline"
    >
      보기
    </button>
  );
}

