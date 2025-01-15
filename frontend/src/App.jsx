// App.jsx - 애플리케이션의 메인 컴포넌트
// 전체 애플리케이션의 라우팅과 상태 관리를 담당하는 최상위 컴포넌트

import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next"; // 다국어 지원 프로바이더
import { ContextWrapper } from "@/AuthContext"; // 인증 상태 관리 컨텍스트

// 코드 분할을 위한 지연 로딩 컴포넌트들
const Main = lazy(() => import("@/pages/Main")); // 메인 페이지
const InvitePage = lazy(() => import("@/pages/Invite")); // 초대 페이지
const WorkspaceChat = lazy(() => import("@/pages/WorkspaceChat")); // 워크스페이스 채팅
// ... 기타 지연 로딩 컴포넌트
