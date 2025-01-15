// Main/index.jsx - 메인 페이지 컴포넌트
// 애플리케이션의 메인 페이지를 구성하는 컴포넌트

import React from "react";
import Sidebar from "@/components/Sidebar";
import DefaultChat from "@/components/DefaultChat";
import { isMobile } from "react-device-detect";

export default function Main() {
  // 모바일 여부에 따른 레이아웃 조정
  const containerStyle = {
    height: isMobile ? "100%" : "calc(100% - 32px)",
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
      {/* 사이드바 컴포넌트 */}
      <Sidebar />
      
      {/* 메인 채팅 영역 */}
      <div style={containerStyle} className="flex-1 flex flex-col h-full">
        <DefaultChat />
      </div>
    </div>
  );
}
