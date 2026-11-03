import Link from "next/link";

// 홈 페이지 주소: /
export default function Home() {
  return (
    <div>
      <div> 블록1 </div>
      <div> 블록2 </div>
      <div> main, section, p, h1 이런 태그들은 div를 개조한거 뿐이다. 큰 차이는 없다. </div>
      <img src="image.jpg" alt="이미지 설명" />
      <video src="video.mp4" controls />
      <Link href="/about">About 페이지로 이동</Link>
    </div>
  );
}
