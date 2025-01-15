// CanViewChatHistory/index.jsx - 채팅 기록 조회 권한 컴포넌트
// 사용자의 채팅 기록 조회 권한을 확인하고 관리하는 컴포넌트

import { useEffect, useState } from "react";
import { FullScreenLoader } from "@/components/Preloader";
import System from "@/models/system";
import paths from "@/utils/paths";

/**
 * 채팅 기록 조회 권한이 없는 사용자를 보호하는 컴포넌트
 * 권한이 없는 경우 홈페이지로 리다이렉트
 */
export function CanViewChatHistory({ children }) {
  const { loading, viewable } = useCanViewChatHistory();
  
  // 로딩 중일 때 로딩 화면 표시
  if (loading) return <FullScreenLoader />;
  
  // 권한이 없으면 홈으로 리다이렉트
  if (!viewable) {
    window.location.href = paths.home();
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}

/**
 * 채팅 기록 조회 가능 여부를 자식 컴포넌트에 제공하는 프로바이더
 */
export function CanViewChatHistoryProvider({ children }) {
  const { loading, viewable } = useCanViewChatHistory();
  if (loading) return null;
  return <>{children({ viewable })}</>;
}

/**
 * 채팅 기록 조회 권한 상태를 관리하는 커스텀 훅
 */
export function useCanViewChatHistory() {
  const [loading, setLoading] = useState(true);
  const [viewable, setViewable] = useState(false);

  // 권한 상태 로드
  useEffect(() => {
    async function fetchViewable() {
      const { viewable } = await System.fetchCanViewChatHistory();
      setViewable(viewable);
      setLoading(false);
    }
    fetchViewable();
  }, []);

  return { loading, viewable };
}
