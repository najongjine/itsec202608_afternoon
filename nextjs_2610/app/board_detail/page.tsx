"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import BoardEditor from "../components/BoardEditor";
import { deleteBoard, errorMessage, formatBoardDate, parseBoardId } from "../lib/board-api";
import { boardDocument } from "../lib/board-content";
import { useBoard } from "../lib/use-board";
import { useStoreHydration } from "../lib/create-persisted-store";
import { useAuthStore } from "../stores/auth-store";

export default function BoardDetailPage() {
  return <Suspense fallback={<p role="status">게시글을 불러오는 중...</p>}><BoardDetail /></Suspense>;
}

function BoardDetail() {
  const id = parseBoardId(useSearchParams().get("board_id"));
  const result = useBoard(id);
  const router = useRouter();
  const ready = useStoreHydration(useAuthStore);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const board = result?.board;
  const owner = ready && token && user?.id === board?.userId;

  async function onDelete() {
    if (!id || !token || !owner || pending.current) return;
    if (!window.confirm("이 게시글을 삭제하시겠습니까? 삭제한 글은 복구할 수 없습니다.")) return;
    pending.current = true;
    setDeleting(true);
    setError("");
    try {
      await deleteBoard(id, token);
      router.replace("/boardlist");
    } catch (err) {
      setError(errorMessage(err));
      pending.current = false;
      setDeleting(false);
    }
  }

  return (
    <section className="card board-page">
      <Link className="board-back" href="/boardlist">← 게시글 목록</Link>
      {!id ? <p role="alert">올바른 게시글 주소가 아닙니다.</p> : result?.error ? <p className="board-error" role="alert">{result.error}</p> : !board ? <p role="status">게시글을 불러오는 중...</p> : (
        <>
          <header className="board-detail-heading"><h1>{board.title || "제목 없음"}</h1><p className="board-meta">{board.author || `회원 ${board.userId}`} · {formatBoardDate(board.createdDt)}</p></header>
          <BoardEditor key={`${board.id}:${board.content}`} initialContent={boardDocument(board.content)} readOnly />
          {error && <p className="board-error" role="alert">{error}</p>}
          <div className="board-actions">
            <Link className="board-button secondary" href="/boardlist">목록</Link>
            {owner && <div className="board-actions-group">
              {!deleting && <Link className="board-button secondary" href={`/upsertBoard?board_id=${board.id}`}>수정</Link>}
              <button className="board-button danger" disabled={deleting} onClick={onDelete}>{deleting ? "삭제 중..." : "삭제"}</button>
            </div>}
          </div>
        </>
      )}
    </section>
  );
}
