import type { JSONContent } from "@tiptap/react";

export function boardDocument(content: string | null): JSONContent {
  try {
    const parsed: JSONContent = JSON.parse(content ?? "");
    if (parsed?.type === "doc" && Array.isArray(parsed.content)) return parsed;
  } catch { /* 기존 textarea 게시글은 일반 텍스트로 변환합니다. */ }
  return {
    type: "doc",
    content: (content ?? "").split(/\r?\n/).map((line) => ({
      type: "paragraph", content: line ? [{ type: "text", text: line }] : [],
    })),
  };
}

export function documentText(doc: JSONContent): string {
  return doc.text ?? doc.content?.map(documentText).join("") ?? "";
}
