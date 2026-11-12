"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth-store";
import { useStoreHydration } from "../lib/create-persisted-store";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const ready = useStoreHydration(useAuthStore);
  const setLogin = useAuthStore((state) => state.setLogin);
  
  useEffect(() => {
    console.log("로그인 페이지 진입");
  }, []);

  async function onLogin(){
    try {
      const formData = new FormData();
     formData.append("username", username);
     formData.append("password", password);
      let response:any= await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/login`,
        {
          method:"POST",
          headers:{},
          body:formData
        });
      response=await response.json();
      if(!response?.success){
        alert(`로그인 실패. ${response?.msg||"알 수 없는 오류"}`);
        return;
      }
      setLogin(response?.data?.user, response?.data?.token);
      alert(`로그인 성공 ${JSON.stringify(response?.data||{})}`);
    } catch (error:any) {
      console.error("!!로그인 중 오류 발생:", error);
      alert(`로그인 중 오류 발생: ${error?.message}`);
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
        <button onClick={(e)=>{onLogin()}}>로그인</button>
      </div>
    </section>
  );
}
