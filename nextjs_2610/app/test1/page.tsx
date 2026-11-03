import Link from "next/link";

// 테스트1 페이지 주소: /test1
export default function Test1() {
  return (
    <section className="card">
      <h1>테스트1 페이지</h1>
      <p>테스트1 페이지에 도착했습니다!</p>
      <p>이곳에 원하는 내용을 자유롭게 추가해 보세요.</p>
      <Link href="/" className="button">
        홈으로 돌아가기
      </Link>
    </section>
  );
}
