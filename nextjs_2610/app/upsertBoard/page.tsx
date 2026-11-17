"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState, type FormEvent } from "react";
import BoardEditor from "../components/BoardEditor";
import { errorMessage, parseBoardId, saveBoard } from "../lib/board-api";
import { boardDocument, documentText } from "../lib/board-content";
import { useBoard } from "../lib/use-board";
import { useStoreHydration } from "../lib/create-persisted-store";
import { useAuthStore } from "../stores/auth-store";
import type { BoardData } from "../types/board_types";

export default function UpsertBoardPage() {
  return <Suspense fallback={<p role="status">글 작성 페이지를 불러오는 중...</p>}><UpsertBoard /></Suspense>;
}

function UpsertBoard() {
  const rawId = useSearchParams().get("board_id");
  const id = parseBoardId(rawId);
  const result = useBoard(id);
  const ready = useStoreHydration(useAuthStore);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  let message = "";
  if (!ready) message = "로그인 정보를 불러오는 중...";
  else if (!user || !token) message = "글을 작성하려면 로그인해 주세요.";
  else if (rawId !== null && !id) message = "올바른 게시글 주소가 아닙니다.";
  else if (id && !result) message = "게시글을 불러오는 중...";
  else if (result?.error) message = result.error;
  else if (id && result?.board?.userId !== user.id) message = "작성자만 수정할 수 있습니다.";

  if (message) return <section className="card board-page"><p role="status">{message}</p><div className="board-actions-group"><Link className="board-button secondary" href="/boardlist">목록</Link>{ready && !token && <Link className="board-button" href="/login">로그인</Link>}</div></section>;
  return <BoardForm key={`${id ?? "new"}:${user!.id}`} board={result?.board} token={token!} />;
}

function BoardForm({ board, token }: { board?: BoardData; token: string }) {
  const router = useRouter();
  const [initialContent] = useState(() => boardDocument(board?.content ?? ""));
  const [title, setTitle] = useState(board?.title ?? "");
  const [content, setContent] = useState(() => JSON.stringify(initialContent));
  const [text, setText] = useState(() => documentText(initialContent));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const cancelUrl = board ? `/board_detail?board_id=${board.id}` : "/boardlist";

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    if (!title.trim() || title.trim().length > 100) { setError("제목을 1~100자로 입력해 주세요."); return; }
    if (!text.trim() || text.length > 10_000) { setError("본문을 1~10,000자로 입력해 주세요."); return; }
    pending.current = true;
    setSaving(true);
    setError("");
    try {
      const saved = await saveBoard(title.trim(), content, token, board?.id);
      router.replace(`/board_detail?board_id=${saved.id}`);
    } catch (err) {
      setError(errorMessage(err));
      pending.current = false;
      setSaving(false);
    }
  }

  return (
    <section className="card board-page">
      <Link className="board-back" href={cancelUrl}>← {board ? "게시글로 돌아가기" : "게시글 목록"}</Link>
      <h1>{board ? "글 수정" : "새 글 작성"}</h1>
      <form onSubmit={onSave} className="board-form" aria-busy={saving}>
        <label htmlFor="board-title">제목 <span className="board-muted">{title.length} / 100</span></label>
        <input id="board-title" value={title} maxLength={100} required disabled={saving} placeholder="제목을 입력해 주세요" onChange={(event) => setTitle(event.target.value)} />
        <div className="board-field-label">본문 <span className={text.length > 10_000 ? "board-error" : "board-muted"}>{text.length.toLocaleString()} / 10,000</span></div>
        <BoardEditor initialContent={initialContent} disabled={saving} onChange={(doc, value) => { setContent(JSON.stringify(doc)); setText(value); }} />
        {error && <p className="board-error" role="alert">{error}</p>}
        <div className="board-actions">
          {!saving ? <Link className="board-button secondary" href={cancelUrl}>취소</Link> : <span />}
          <button className="board-button" type="submit" disabled={saving || !title.trim() || !text.trim() || text.length > 10_000}>{saving ? "저장 중..." : board ? "수정 저장" : "등록"}</button>
        </div>
      </form>
    </section>
  );
}
