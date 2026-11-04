"use client";
import Link from "next/link";

// 홈 페이지 주소: /
export default function Home() {
  let number1=1;

  function test1(){
    number1++;
    console.log(`${number1}`);
  }
  return (
    <div>
      <div> 로또번호 생성기 </div>
      <div>번호: {number1}</div>
      <button onClick={(e)=>{test1()}}>테스트버튼</button>
    </div>
  );
}
