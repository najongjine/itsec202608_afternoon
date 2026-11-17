import { getSchema } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

// 프론트와 같은 텍스트 전용 스키마로 검사하고 정규화합니다.
const schema = getSchema([StarterKit.configure({ link: false, heading: { levels: [2, 3] } })]);

type Result = { success: true; data: { title: string; content: string } }
  | { success: false; msg: string };

export function validateBoardInput(titleValue: unknown, contentValue: unknown): Result {
  if (typeof titleValue !== "string" || !titleValue.trim() || titleValue.trim().length > 100) {
    return { success: false, msg: "제목을 1~100자로 입력해 주세요." };
  }
  if (typeof contentValue !== "string" || contentValue.length > 200_000) {
    return { success: false, msg: "본문 데이터가 너무 크거나 올바르지 않습니다." };
  }
  try {
    const json = JSON.parse(contentValue);
    if (json?.type !== "doc") throw new Error("Invalid document");
    const doc = schema.nodeFromJSON(json);
    doc.check();
    if (!doc.textContent.trim() || doc.textContent.length > 10_000) {
      return { success: false, msg: "본문을 1~10,000자로 입력해 주세요." };
    }
    return { success: true, data: { title: titleValue.trim(), content: JSON.stringify(doc.toJSON()) } };
  } catch {
    return { success: false, msg: "본문 형식이 올바르지 않습니다. 텍스트 편집기로 작성해 주세요." };
  }
}
