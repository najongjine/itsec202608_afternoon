import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "나의 첫 Next.js 사이트",
  description: "홈과 테스트1 페이지가 있는 Next.js 연습 사이트",
};

// 모든 페이지에 공통으로 적용되는 틀입니다.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>
        <Header />
        {/* children 자리에 현재 페이지의 내용이 들어옵니다. */}
        <main className="container">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
