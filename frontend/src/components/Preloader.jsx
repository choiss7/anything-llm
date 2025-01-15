// Preloader.jsx - 로딩 인디케이터 컴포넌트
// 페이지나 컨텐츠 로딩 중 표시되는 로딩 화면 컴포넌트

// 전체 화면 로딩 인디케이터
export function FullScreenLoader() {
  return (
    <div id="preloader" className="fixed left-0 top-0 z-999999 flex h-screen w-screen items-center justify-center bg-theme-bg-primary">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-[var(--theme-loader)] border-t-transparent"></div>
    </div>
  );
}

// 크기 조절 가능한 로딩 스피너
export function Loader({ size = "40" }) {
  return (
    <div className={`h-${size} w-${size} animate-spin rounded-full border-4 border-solid border-primary border-t-transparent`}></div>
  );
}
