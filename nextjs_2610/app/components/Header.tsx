import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <div className="container header-content">
        <Link href="/" className="logo">
          나의 첫 사이트
        </Link>
        {/* 메뉴를 추가하려면 여기에 Link를 하나 더 넣으세요. */}
        <nav className="menu" aria-label="메인 메뉴">
          <Link href="/">홈 페이지</Link>
          <Link href="/test1">테스트1 페이지</Link>
        </nav>
      </div>
    </header>
  );
}
