"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

// 홈 페이지 주소: /
export default function Home() {
  // 그냥 1~45
  const [lottonums, setLottonums]=useState<number[]>([]);
  // 번호 6개 추첨된거
  const [finalLottoNums, setFinalLottoNums]=useState<number[]>([]);
  
  // 페이지 진입시 무조건 실행되는 함수
  useEffect(
    ()=>{
      init();
      console.log("페이지 진입시 무조건 실행되는 함수");
    },[]
  );
  function init(){
    let 임시변수:number[]=[];
    for(let i=1;i<=45;i++){
      임시변수.push(i);
    }
    setLottonums(임시변수);
  }
  function makeLottoNums(){
    // 바인딩 변수는 변경이 까다로워요. 그래서 시스템 변수에 복제본 만들었어요
    let _lottonums=lottonums;
    for(let i=_lottonums.length-1;i>0;i--){
      // 시스템 변수에 있는 1~45 무작위로 섞기
      const j=Math.floor(Math.random()*(i+1));
      [_lottonums[i], _lottonums[j]]=[_lottonums[j], _lottonums[i]];
    }
    // 섞은거에서 6개만 잘라서 정렬해서 바인딩 변수에 넣기
    setFinalLottoNums(_lottonums.slice(0,6).sort((a,b)=>a-b));
  }

  return (
    <div>
      <div> 로또번호 생성기 </div>
      <div>{finalLottoNums.join(", ")}</div>
      <button onClick={(e)=>{makeLottoNums();}}>로또번호 생성 버튼</button>
    </div>
  );
}
