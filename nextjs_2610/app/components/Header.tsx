"use client";

import Link from "next/link";
import { useStoreHydration } from "../lib/create-persisted-store";
import { useAuthStore } from "../stores/auth-store";
import "./header.css";

export default function Header() {
  const ready = useStoreHydration(useAuthStore);
  const user = useAuthStore((state) => state.user);
  const hasToken = useAuthStore((state) => Boolean(state.token));
  const clearLogin = useAuthStore((state) => state.clearLogin);

  return (
    <header className="header">
      <div className="container header-content">
        <Link href="/" className="logo">
          나의 첫 사이트
        </Link>
        <nav className="auth-menu" aria-label="회원 메뉴">
          {!ready ? (
            <span className="auth-user" role="status">로그인 정보 불러오는 중...</span>
          ) : user && hasToken ? (
            <>
              <span className="auth-user">
                {user.username}님 (회원 번호: {user.id})
              </span>
              <button type="button" className="auth-logout" onClick={clearLogin}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login">로그인</Link>
              <Link href="/register">회원가입</Link>
            </>
          )}
        </nav>
        {/* 메뉴를 추가하려면 여기에 Link를 하나 더 넣으세요. */}
        <nav className="menu" aria-label="메인 메뉴">
          <Link href="/">홈 페이지</Link>
          <Link href="/test1">테스트1 페이지</Link>
        </nav>
      </div>
    </header>
  );
}
