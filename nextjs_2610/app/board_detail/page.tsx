"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth-store";
import { useStoreHydration } from "../lib/create-persisted-store";
import { BoardData } from "../types/board_types";

export default function BoardDetail() {
  const router = useRouter();
  const ready = useStoreHydration(useAuthStore);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const hasToken = useAuthStore((state) => Boolean(state.token));
  const [boardList, setBoardList] = useState<BoardData[]>([]);
  
  useEffect(() => {
    console.log("게시글 리스트");
    init();
  }, []);

  async function init(){
    try {
      let response:any= await fetch(`${process.env.NEXT_PUBLIC_API_URL}/board/get_board_list`,
        {
          method:"GET",
          headers:{
            authorization: `Bearer ${token||""}`
          },
        });
      response=await response.json();
      if(!response?.success){
        alert(`글 불러오기 실패. ${response?.msg||"알 수 없는 오류"}`);
        return;
      }
      setBoardList(response?.data || []);
    } catch (error:any) {
      console.error("!!글 불러오기 중 오류 발생:", error);
      alert(`글 불러오기 중 오류 발생: ${error?.message}`);
      return; 
    }
  }

  return (
    <section className="card">
      <h1>게시글 리스트</h1>
      <div>
        {boardList?.length && boardList?.map((board) => (
          <div key={board.id} onClick={()=>{
            router.push(`/board_detail?board_id=${board.id}`);
          }}>
            <h2>{board.title}</h2>
          </div>
        ))}
        {!boardList?.length && <p>게시글이 없습니다.</p>}
      </div>
      <div>
        <button onClick={()=>{
          router.push("/upsertBoard");
        }}>글 작성</button>
      </div>
    </section>
  );
}
