// Workspaces/index.jsx - 워크스페이스 관리 페이지
// 관리자용 워크스페이스 목록 및 관리 기능을 제공하는 컴포넌트

import { useEffect, useState } from "react";
import Sidebar from "@/components/SettingsSidebar";
import { isMobile } from "react-device-detect";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { BookOpen } from "@phosphor-icons/react";
import Admin from "@/models/admin";
import WorkspaceRow from "./WorkspaceRow";
import NewWorkspaceModal from "./NewWorkspaceModal";
import { useModal } from "@/hooks/useModal";
import ModalWrapper from "@/components/ModalWrapper";
import CTAButton from "@/components/lib/CTAButton";

export default function AdminWorkspaces() {
  // 모달 및 데이터 상태 관리
  const { isOpen, openModal, closeModal } = useModal();
  const [workspaces, setWorkspaces] = useState([]); // 워크스페이스 목록
  const [loading, setLoading] = useState(true); // 로딩 상태

  // 워크스페이스 데이터 로드
  useEffect(() => {
    async function fetchData() {
      const _workspaces = await Admin.workspaces();
      setWorkspaces(_workspaces);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
      <Sidebar />
      <div
        style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
        className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
      >
        <div className="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16">
          <div className="w-full flex flex-col gap-y-1 pb-6 border-white/10 border-b-2">
            <div className="items-center flex gap-x-4">
              <p className="text-lg leading-6 font-bold text-theme-text-primary">
                Instance Workspaces
              </p>
            </div>
            <p className="text-xs leading-[18px] font-base text-theme-text-secondary">
              These are all the workspaces that exist on this instance. Removing
              a workspace will delete all of its associated chats and settings.
            </p>
          </div>
          <div className="w-full justify-end flex">
            <CTAButton
              onClick={openModal}
              className="mt-3 mr-0 mb-4 md:-mb-14 z-10"
            >
              <BookOpen className="h-4 w-4" weight="bold" /> New Workspace
            </CTAButton>
          </div>
          <div className="overflow-x-auto">
            <WorkspacesContainer />
          </div>
        </div>
        <ModalWrapper isOpen={isOpen}>
          <NewWorkspaceModal closeModal={closeModal} />
        </ModalWrapper>
      </div>
    </div>
  );
}

// 워크스페이스 목록을 표시하는 컨테이너 컴포넌트
function WorkspacesContainer() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]); // 사용자 목록
  const [workspaces, setWorkspaces] = useState([]); // 워크스페이스 목록

  // 데이터 로드
  useEffect(() => {
    async function fetchData() {
      const _users = await Admin.users();
      const _workspaces = await Admin.workspaces();
      setUsers(_users);
      setWorkspaces(_workspaces);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <Skeleton.default
        height="80vh"
        width="100%"
        highlightColor="var(--theme-bg-primary)"
        baseColor="var(--theme-bg-secondary)"
        count={1}
        className="w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
        containerClassName="flex w-full"
      />
    );
  }

  return (
    <table className="w-full text-sm text-left rounded-lg mt-6 min-w-[640px]">
      <thead className="text-theme-text-secondary text-xs leading-[18px] font-bold uppercase border-white/10 border-b">
        <tr>
          <th scope="col" className="px-6 py-3 rounded-tl-lg">
            Name
          </th>
          <th scope="col" className="px-6 py-3">
            Link
          </th>
          <th scope="col" className="px-6 py-3">
            Users
          </th>
          <th scope="col" className="px-6 py-3">
            Created On
          </th>
          <th scope="col" className="px-6 py-3 rounded-tr-lg">
            {" "}
          </th>
        </tr>
      </thead>
      <tbody>
        {workspaces.map((workspace) => (
          <WorkspaceRow
            key={workspace.id}
            workspace={workspace}
            users={users}
          />
        ))}
      </tbody>
    </table>
  );
}
