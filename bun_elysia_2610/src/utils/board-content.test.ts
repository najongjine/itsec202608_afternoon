import { describe, expect, test } from "bun:test";
import { validateBoardInput } from "./board-content";

const doc = (text: string) => JSON.stringify({ type: "doc", content: [
  { type: "paragraph", content: text ? [{ type: "text", text, marks: [{ type: "bold" }] }] : [] },
] });

describe("게시글 입력 검증", () => {
  test("텍스트와 서식 보존, 제목 앞뒤 공백 제거", () => {
    const result = validateBoardInput("  한글 제목  ", doc("한글 본문"));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("한글 제목");
      expect(JSON.parse(result.data.content).content[0].content[0].marks).toEqual([{ type: "bold" }]);
    }
  });
  test("빈 글과 제한을 넘긴 글 거부", () => {
    for (const [title, content] of [[" ", doc("내용")], ["a".repeat(101), doc("내용")],
      ["제목", doc("")], ["제목", doc(" \n\t")], ["제목", doc("a".repeat(10001))],
      ["제목", "a".repeat(200001)]]) {
      expect(validateBoardInput(title, content).success).toBe(false);
    }
    expect(validateBoardInput("a".repeat(100), doc("a".repeat(10000))).success).toBe(true);
  });
  test("잘못된 JSON, 미디어, 링크, 깨진 문서 구조 거부", () => {
    for (const content of ["<script>alert(1)</script>", "null", "{}", JSON.stringify({ type: "doc", content: [{ type: "image", attrs: { src: "x" } }] }),
      JSON.stringify({ type: "doc", content: [{ type: "text", text: "문단 없는 텍스트" }] }),
      JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "링크", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }] }] }] })]) {
      expect(validateBoardInput("제목", content).success).toBe(false);
    }
  });
});
