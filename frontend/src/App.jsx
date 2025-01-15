// App.jsx - 애플리케이션의 메인 컴포넌트
// 라우팅 설정 및 전역 상태 관리를 담당

// 필요한 컴포넌트와 라이브러리 임포트
import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next"; // 다국어 지원
import { ContextWrapper } from "@/AuthContext"; // 인증 컨텍스트
import PrivateRoute, {
  AdminRoute,
  ManagerRoute,
} from "@/components/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "@/pages/Login";
import SimpleSSOPassthrough from "@/pages/Login/SSO/simple";
import OnboardingFlow from "@/pages/OnboardingFlow";
import i18n from "./i18n";

// 컨텍스트 프로바이더 임포트
import { PfpProvider } from "./PfpContext";
import { LogoProvider } from "./LogoContext";
import { FullScreenLoader } from "./components/Preloader";
import { ThemeProvider } from "./ThemeContext";

// 지연 로딩을 위한 컴포넌트 임포트
const Main = lazy(() => import("@/pages/Main")); // 메인 페이지
const InvitePage = lazy(() => import("@/pages/Invite")); // 초대 페이지
const WorkspaceChat = lazy(() => import("@/pages/WorkspaceChat")); // 워크스페이스 채팅
const AdminUsers = lazy(() => import("@/pages/Admin/Users")); // 관리자 사용자 관리
const AdminInvites = lazy(() => import("@/pages/Admin/Invitations")); // 관리자 초대 관리
const AdminWorkspaces = lazy(() => import("@/pages/Admin/Workspaces")); // 관리자 워크스페이스 관리
const AdminLogs = lazy(() => import("@/pages/Admin/Logging")); // 관리자 로그 관리
const AdminAgents = lazy(() => import("@/pages/Admin/Agents")); // 관리자 에이전트 관리
const GeneralChats = lazy(() => import("@/pages/GeneralSettings/Chats")); // 일반 채팅 설정
const GeneralAppearance = lazy(
  () => import("@/pages/GeneralSettings/Appearance")
); // 일반 외관 설정
const GeneralApiKeys = lazy(() => import("@/pages/GeneralSettings/ApiKeys")); // API 키 설정
const GeneralLLMPreference = lazy(
  () => import("@/pages/GeneralSettings/LLMPreference")
); // LLM 설정
const GeneralTranscriptionPreference = lazy(
  () => import("@/pages/GeneralSettings/TranscriptionPreference")
); // 텍스트 변환 설정
const GeneralAudioPreference = lazy(
  () => import("@/pages/GeneralSettings/AudioPreference")
); // 오디오 설정
const GeneralEmbeddingPreference = lazy(
  () => import("@/pages/GeneralSettings/EmbeddingPreference")
); // 임베딩 설정
const EmbeddingTextSplitterPreference = lazy(
  () => import("@/pages/GeneralSettings/EmbeddingTextSplitterPreference")
); // 텍스트 분할 설정
const GeneralVectorDatabase = lazy(
  () => import("@/pages/GeneralSettings/VectorDatabase")
); // 벡터 데이터베이스 설정
const GeneralSecurity = lazy(() => import("@/pages/GeneralSettings/Security")); // 보안 설정
const GeneralBrowserExtension = lazy(
  () => import("@/pages/GeneralSettings/BrowserExtensionApiKey")
); // 브라우저 확장 설정
const WorkspaceSettings = lazy(() => import("@/pages/WorkspaceSettings")); // 워크스페이스 설정
const EmbedConfigSetup = lazy(
  () => import("@/pages/GeneralSettings/EmbedConfigs")
); // 임베드 설정
const EmbedChats = lazy(() => import("@/pages/GeneralSettings/EmbedChats")); // 임베드 채팅
const PrivacyAndData = lazy(
  () => import("@/pages/GeneralSettings/PrivacyAndData")
); // 개인정보 및 데이터
const ExperimentalFeatures = lazy(
  () => import("@/pages/Admin/ExperimentalFeatures")
); // 실험적 기능
const LiveDocumentSyncManage = lazy(
  () => import("@/pages/Admin/ExperimentalFeatures/Features/LiveSync/manage")
); // 실시간 문서 동기화 관리

// 커뮤니티 허브 관련 컴포넌트
const CommunityHubTrending = lazy(
  () => import("@/pages/GeneralSettings/CommunityHub/Trending")
); // 트렌딩
const CommunityHubAuthentication = lazy(
  () => import("@/pages/GeneralSettings/CommunityHub/Authentication")
); // 인증
const CommunityHubImportItem = lazy(
  () => import("@/pages/GeneralSettings/CommunityHub/ImportItem")
); // 아이템 가져오기

// 앱의 메인 컴포넌트
export default function App() {
  return (
    <ThemeProvider>
      <Suspense fallback={<FullScreenLoader />}>
        <ContextWrapper>
          <LogoProvider>
            <PfpProvider>
              <I18nextProvider i18n={i18n}>
                <Routes>
                  {/* 기본 라우트 */}
                  <Route path="/" element={<PrivateRoute Component={Main} />} />
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/sso/simple"
                    element={<SimpleSSOPassthrough />}
                  />

                  {/* 워크스페이스 관련 라우트 */}
                  <Route
                    path="/workspace/:slug/settings/:tab"
                    element={<ManagerRoute Component={WorkspaceSettings} />}
                  />
                  <Route
                    path="/workspace/:slug"
                    element={<PrivateRoute Component={WorkspaceChat} />}
                  />
                  <Route
                    path="/workspace/:slug/t/:threadSlug"
                    element={<PrivateRoute Component={WorkspaceChat} />}
                  />
                  <Route path="/accept-invite/:code" element={<InvitePage />} />

                  {/* 관리자 설정 라우트 */}
                  <Route
                    path="/settings/llm-preference"
                    element={<AdminRoute Component={GeneralLLMPreference} />}
                  />
                  <Route
                    path="/settings/transcription-preference"
                    element={
                      <AdminRoute Component={GeneralTranscriptionPreference} />
                    }
                  />
                  <Route
                    path="/settings/audio-preference"
                    element={<AdminRoute Component={GeneralAudioPreference} />}
                  />
                  <Route
                    path="/settings/embedding-preference"
                    element={
                      <AdminRoute Component={GeneralEmbeddingPreference} />
                    }
                  />
                  <Route
                    path="/settings/text-splitter-preference"
                    element={
                      <AdminRoute Component={EmbeddingTextSplitterPreference} />
                    }
                  />
                  <Route
                    path="/settings/vector-database"
                    element={<AdminRoute Component={GeneralVectorDatabase} />}
                  />
                  <Route
                    path="/settings/agents"
                    element={<AdminRoute Component={AdminAgents} />}
                  />
                  <Route
                    path="/settings/event-logs"
                    element={<AdminRoute Component={AdminLogs} />}
                  />
                  <Route
                    path="/settings/embed-config"
                    element={<AdminRoute Component={EmbedConfigSetup} />}
                  />
                  <Route
                    path="/settings/embed-chats"
                    element={<AdminRoute Component={EmbedChats} />}
                  />
                  {/* 매니저 설정 라우트 */}
                  <Route
                    path="/settings/security"
                    element={<ManagerRoute Component={GeneralSecurity} />}
                  />
                  <Route
                    path="/settings/privacy"
                    element={<AdminRoute Component={PrivacyAndData} />}
                  />
                  <Route
                    path="/settings/appearance"
                    element={<ManagerRoute Component={GeneralAppearance} />}
                  />
                  <Route
                    path="/settings/beta-features"
                    element={<AdminRoute Component={ExperimentalFeatures} />}
                  />
                  <Route
                    path="/settings/api-keys"
                    element={<AdminRoute Component={GeneralApiKeys} />}
                  />
                  <Route
                    path="/settings/browser-extension"
                    element={
                      <ManagerRoute Component={GeneralBrowserExtension} />
                    }
                  />
                  <Route
                    path="/settings/workspace-chats"
                    element={<ManagerRoute Component={GeneralChats} />}
                  />
                  <Route
                    path="/settings/invites"
                    element={<ManagerRoute Component={AdminInvites} />}
                  />
                  <Route
                    path="/settings/users"
                    element={<ManagerRoute Component={AdminUsers} />}
                  />
                  <Route
                    path="/settings/workspaces"
                    element={<ManagerRoute Component={AdminWorkspaces} />}
                  />
                  {/* 온보딩 플로우 라우트 */}
                  <Route path="/onboarding" element={<OnboardingFlow />} />
                  <Route
                    path="/onboarding/:step"
                    element={<OnboardingFlow />}
                  />

                  {/* 실험적 기능 페이지 라우트 */}
                  {/* 실시간 문서 동기화 기능 */}
                  <Route
                    path="/settings/beta-features/live-document-sync/manage"
                    element={<AdminRoute Component={LiveDocumentSyncManage} />}
                  />

                  {/* 커뮤니티 허브 라우트 */}
                  <Route
                    path="/settings/community-hub/trending"
                    element={<AdminRoute Component={CommunityHubTrending} />}
                  />
                  <Route
                    path="/settings/community-hub/authentication"
                    element={
                      <AdminRoute Component={CommunityHubAuthentication} />
                    }
                  />
                  <Route
                    path="/settings/community-hub/import-item"
                    element={<AdminRoute Component={CommunityHubImportItem} />}
                  />
                </Routes>
                <ToastContainer />
              </I18nextProvider>
            </PfpProvider>
          </LogoProvider>
        </ContextWrapper>
      </Suspense>
    </ThemeProvider>
  );
}
