// Footer/index.jsx - 푸터 컴포넌트
// 페이지 하단에 표시되는 정보와 링크를 관리하는 컴포넌트

import System from "@/models/system";
import paths from "@/utils/paths";
import {
  BookOpen,
  DiscordLogo,
  GithubLogo,
  Briefcase,
  Envelope,
  Globe,
  HouseLine,
  Info,
  LinkSimple,
} from "@phosphor-icons/react";
import React, { useEffect, useState } from "react";
import SettingsButton from "../SettingsButton";
import { isMobile } from "react-device-detect";
import { Tooltip } from "react-tooltip";
import { Link } from "react-router-dom";

// 푸터에 표시할 최대 아이콘 수
export const MAX_ICONS = 3;

// 아이콘 컴포넌트 매핑
export const ICON_COMPONENTS = {
  BookOpen: BookOpen,       // 문서 아이콘
  DiscordLogo: DiscordLogo, // Discord 아이콘
  GithubLogo: GithubLogo,  // Github 아이콘
  Envelope: Envelope,
  LinkSimple: LinkSimple,
  HouseLine: HouseLine,
  Globe: Globe,
  Briefcase: Briefcase,
  Info: Info,
};

export default function Footer() {
  // 푸터 데이터 상태 관리
  const [footerData, setFooterData] = useState(false);

  // 푸터 데이터 로드
  useEffect(() => {
    async function fetchFooterData() {
      const { footerData } = await System.fetchCustomFooterIcons();
      setFooterData(footerData);
    }
    fetchFooterData();
  }, []);

  return (
    // 푸터 UI 렌더링
  );
}
