"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface AutoRefreshProps {
  token: string;
  interval?: number;
}

export function AutoRefresh({ token, interval = 5000 }: AutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    // 5초마다 페이지 새로고침 (실시간 연동)
    const refreshInterval = setInterval(() => {
      router.refresh();
    }, interval);

    return () => clearInterval(refreshInterval);
  }, [router, interval]);

  return null;
}

