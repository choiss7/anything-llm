// ChatBubble/index.jsx - 채팅 메시지 버블 컴포넌트
// 개별 채팅 메시지를 표시하는 UI 컴포넌트

import React from "react";
import UserIcon from "../UserIcon";
import { userFromStorage } from "@/utils/request";

export default function ChatBubble({ message, type, popMsg }) {
  const isUser = type === "user"; // 사용자 메시지 여부 확인

  return (
    <div className={`flex justify-center items-end w-full bg-theme-bg-secondary`}>
      <div className={`py-8 px-4 w-full flex gap-x-5 md:max-w-[80%] flex-col`}>
        <div className="flex gap-x-5">
          {/* 사용자 아이콘 표시 */}
          <UserIcon
            user={{ uid: isUser ? userFromStorage()?.username : "system" }}
            role={type}
          />

          {/* 메시지 내용 표시 */}
          <span className={`whitespace-pre-line text-white font-normal text-sm md:text-sm flex flex-col gap-y-1 mt-2`}>
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}
