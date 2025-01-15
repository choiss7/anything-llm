// AuthContext.jsx - 인증 관리 컨텍스트
// 사용자 인증 상태와 관련 기능을 전역적으로 관리하는 컨텍스트

import React, { useState, createContext } from "react";
import { AUTH_TIMESTAMP, AUTH_TOKEN, AUTH_USER } from "@/utils/constants";

export const AuthContext = createContext(null);

export function ContextWrapper(props) {
  // 로컬 스토리지에서 사용자 정보와 인증 토큰 로드
  const localUser = localStorage.getItem(AUTH_USER);
  const localAuthToken = localStorage.getItem(AUTH_TOKEN);
  
  // 인증 상태 관리
  const [store, setStore] = useState({
    user: localUser ? JSON.parse(localUser) : null,
    authToken: localAuthToken ? localAuthToken : null,
  });

  // 인증 관련 액션 정의
  const [actions] = useState({
    updateUser: (user, authToken = "") => {
      // 사용자 정보 업데이트 및 저장
      localStorage.setItem(AUTH_USER, JSON.stringify(user));
      localStorage.setItem(AUTH_TOKEN, authToken);
      setStore({ user, authToken });
    },
    unsetUser: () => {
      // 사용자 정보 제거 및 로그아웃
      localStorage.removeItem(AUTH_USER);
      localStorage.removeItem(AUTH_TOKEN);
      localStorage.removeItem(AUTH_TIMESTAMP);
      setStore({ user: null, authToken: null });
    },
  });

  return (
    <AuthContext.Provider value={{ store, actions }}>
      {props.children}
    </AuthContext.Provider>
  );
}
