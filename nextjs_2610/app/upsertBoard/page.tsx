"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth-store";
import { useStoreHydration } from "../lib/create-persisted-store";

export default function UpsertBoard() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const ready = useStoreHydration(useAuthStore);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const hasToken = useAuthStore((state) => Boolean(state.token));
  
  useEffect(() => {
    console.log("글작성 페이지 진입");
  }, []);

  async function onSave(){
    try {
      const formData = new FormData();
     formData.append("title", title);
     formData.append("content", content);
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
      <h1>로그인 페이지</h1>
      <div>
        <span>아이디:</span>
        <input type="text" onChange={(e)=>{
          setUsername(e?.target?.value||"");
        }} />
      </div>
      <div>
        <span>비밀번호:</span>
        <input type="password" onChange={(e)=>{
          setPassword(e?.target?.value||"");
        }}/>
      </div>
      <div>
        <button disabled={!ready} onClick={onLogin}>로그인</button>
      </div>
    </section>
  );
}
