"use client";
import Link from "next/link";
import { useState } from "react";

// 홈 페이지 주소: /
export default function Home() {
  let number1=1;// 시스템 변수(화면에 반영이 잘 안됨)
  // binding state 변수(화면에 반영이 잘됨)
  const [number2, setNumber2] = useState<number>(1);

  function test1(){
    number1++;
    console.log(`${number1}`);
  }
  function test2(){
    let 임시변수=number2;
    임시변수++;
    setNumber2(임시변수);
  }
  return (
    <div>
      <div> 로또번호 생성기 </div>
      <div>번호1: {number1}</div>
      <div>번호2: {number2}</div>
      <button onClick={(e)=>{test1(); test2();}}>테스트버튼</button>
    </div>
  );
}
