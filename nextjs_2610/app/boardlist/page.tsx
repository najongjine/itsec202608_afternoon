"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { getBoards, errorMessage, formatBoardDate } from "../lib/board-api";
import { useAuthStore } from "../stores/auth-store";
import { useStoreHydration } from "../lib/create-persisted-store";

export default function BoardListPage() {
  return <Suspense fallback={<p role="status">게시판을 불러오는 중...</p>}><BoardList /></Suspense>;
}

function BoardList() {
  const router = useRouter();
  const params = useSearchParams();
  const rawPage = Number(params.get("page") ?? 1);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const search = (params.get("q") ?? "").trim().slice(0, 100);
  const ready = useStoreHydration(useAuthStore);
  const token = useAuthStore((state) => state.token);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    router.push(`/boardlist?${new URLSearchParams({ q, page: "1" })}`);
  }

  return (
    <section className="card board-page">
      <div className="board-heading">
        <div><p className="board-eyebrow">COMMUNITY</p><h1>자유 게시판</h1><p className="board-muted">생각과 이야기를 자유롭게 나눠 보세요.</p></div>
        <Link className="board-button" href={ready && token ? "/upsertBoard" : "/login"}>
          {ready && token ? "글 작성" : "로그인하고 글 작성"}
        </Link>
      </div>
      <form key={search} className="board-search" onSubmit={onSearch} role="search">
        <input aria-label="제목 검색" name="q" placeholder="제목으로 검색" maxLength={100} defaultValue={search} />
        <button className="board-button secondary" type="submit">검색</button>
        {search && <Link className="board-button secondary" href="/boardlist">전체 보기</Link>}
      </form>
      <BoardResults key={`${page}:${search}:${router.bfcacheId}`} page={page} search={search} />
    </section>
  );
}

function BoardResults({ page, search }: { page: number; search: string }) {
  const [result, setResult] = useState<Awaited<ReturnType<typeof getBoards>> | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    getBoards(page, search, controller.signal).then(
      (data) => { if (!controller.signal.aborted) { setResult(data); setError(""); } },
      (err: unknown) => { if (!controller.signal.aborted) setError(errorMessage(err)); },
    );
    return () => controller.abort();
  }, [page, search, attempt]);

  if (error) return <div className="board-notice" role="alert"><p>{error}</p><button className="board-button secondary" onClick={() => { setError(""); setAttempt((n) => n + 1); }}>다시 시도</button></div>;
  if (!result) return <p className="board-notice" role="status">게시글을 불러오는 중...</p>;
  const { boards, pagination } = result;
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  const pageLink = (target: number) => `/boardlist?${new URLSearchParams({ q: search, page: String(target) })}`;
  return (
    <>
      <p className="board-muted">총 {pagination.total.toLocaleString()}개의 글</p>
      {boards.length === 0 ? <p className="board-notice">{search ? "검색 결과가 없습니다." : "아직 게시글이 없습니다. 첫 글을 남겨 보세요."}</p> : (
        <ul className="board-list">
          {boards.map((board) => <li key={board.id}>
            <Link className="board-row" href={`/board_detail?board_id=${board.id}`}>
              <span className="board-row-id">{board.id}</span>
              <span className="board-row-body"><strong>{board.title || "제목 없음"}</strong><span className="board-meta">{board.author || `회원 ${board.userId}`} · {formatBoardDate(board.createdDt)}</span></span>
              <span aria-hidden="true">→</span>
            </Link>
          </li>)}
        </ul>
      )}
      {pagination.total > 0 && <nav className="board-pagination" aria-label="게시판 페이지">
        {pagination.page > 1 ? <Link className="board-button secondary" href={pageLink(pagination.page - 1)}>이전</Link> : <span />}
        <span>{pagination.page} / {totalPages} 페이지</span>
        {pagination.page < totalPages ? <Link className="board-button secondary" href={pageLink(pagination.page + 1)}>다음</Link> : <span />}
      </nav>}
    </>
  );
}
