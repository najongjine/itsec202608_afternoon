"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

// 회원가입 페이지 주소: /register
export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  useEffect(() => {
    console.log("회원가입 페이지 진입");
  }, []);

  return (
    <section className="card">
      <h1>회원가입 페이지</h1>
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
        <button>회원가입</button>
      </div>
    </section>
  );
}
