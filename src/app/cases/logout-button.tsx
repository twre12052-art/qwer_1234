"use client";

import { logout } from "@/modules/auth/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const result = await logout();
      if (result.success) {
        // 페이지 이동만 수행 (refresh는 자동으로 처리됨)
        window.location.href = result.redirectTo;
      } else {
        alert(result.message || '로그아웃에 실패했습니다.');
        setLoading(false);
      }
    } catch (error) {
      console.error('로그아웃 에러:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? '로그아웃 중...' : '로그아웃'}
    </button>
  );
}

