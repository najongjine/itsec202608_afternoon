"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth-store";
import { useStoreHydration } from "../lib/create-persisted-store";
import { BoardData } from "../types/board_types";


export default function UpsertBoard() {
  return (
    <Suspense fallback={<p role="status">글 작성 페이지를 불러오는 중...</p>}>
      <UpsertBoardForm />
    </Suspense>
  );
}

function UpsertBoardForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const board_id = Number(searchParams?.get("board_id") || 0);
  const ready = useStoreHydration(useAuthStore);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const hasToken = useAuthStore((state) => Boolean(state.token));
  const [board, setBoard] = useState<BoardData>({
    id: 0,
    title: "",
    content: "",
    userId: 0,
    createdDt: "",
    viewcnt: 0,
    likecnt: 0,
  });
  
  useEffect(() => {
    if (!ready || !Number.isInteger(board_id) || board_id <= 0) return;

    const controller = new AbortController();

    async function init() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/board/get_a_board?board_id=${board_id}`,
          {
            method: "GET",
            headers: {
              authorization: `Bearer ${token || ""}`,
            },
            signal: controller.signal,
          },
        );
        const result: { success: boolean; data: BoardData; msg?: string } =
          await response.json();
        if (controller.signal.aborted) return;
        if (!response.ok || !result.success) {
          alert(`글 불러오기 실패. ${result.msg || "알 수 없는 오류"}`);
          return;
        }
        if (!result.data?.id) {
          alert("게시글을 찾을 수 없습니다.");
          return;
        }
        setBoard(result?.data||{});
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        console.error("!!글 불러오기 중 오류 발생:", error);
        alert(`글 불러오기 중 오류 발생: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
      }
    }

    void init();
    return () => controller.abort();
  }, [board_id, ready, token]);

  async function onSave(){
    try {
      const formData = new FormData();
     formData.append("title", board?.title||"");
     formData.append("content", board?.content||"");
      let response:any= await fetch(`${process.env.NEXT_PUBLIC_API_URL}/board/upsert`,
        {
          method:"POST",
          headers:{
            authorization: `Bearer ${token||""}`
          },
          body:formData
        });
      response=await response.json();
      if(!response?.success){
        alert(`글 저장 실패. ${response?.msg||"알 수 없는 오류"}`);
        return;
      }
      alert("글 저장 성공");
      router.push("/");
    } catch (error:any) {
      console.error("!!글 저장 중 오류 발생:", error);
      alert(`글 저장 중 오류 발생: ${error?.message}`);
      return; 
    }
  }

  return (
    <section className="card">
      <h1>글 작성</h1>
      <div>
        <span>제목:</span>
        <input
          type="text"
          value={board?.title || ""}
          onChange={(e) => {
            setBoard((prev) => ({
              ...prev!,
              title: e.target.value
            }));
          }}
        />
      </div>

      <div>
        <span>내용:</span>
        <textarea
          value={board?.content || ""}
          onChange={(e) => {
            setBoard((prev) => ({
              ...prev!,
              content: e.target.value
            }));
          }}
        />
      </div>
   
      <div>
        <button disabled={!ready} onClick={(e)=>{onSave();}}>저장</button>
      </div>
    </section>
  );
}
