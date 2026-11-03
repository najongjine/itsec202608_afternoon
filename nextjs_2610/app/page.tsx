import Link from "next/link";

// 홈 페이지 주소: /
export default function Home() {
  return (
    <section className="card">
      <h1>홈 페이지</h1>
      <p>환영합니다! Next.js로 만든 첫 번째 홈페이지입니다.</p>
      <p>위쪽 메뉴를 눌러 페이지를 이동해 보세요.</p>
      <Link href="/test1" className="button">
        테스트1 페이지로 이동
      </Link>
    </section>
  );
}
