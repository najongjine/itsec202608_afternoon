"use client";

import { EditorContent, useEditor, useEditorState, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

const extensions = [StarterKit.configure({ link: false, heading: { levels: [2, 3] } })];

export default function BoardEditor({ initialContent, onChange, readOnly = false, disabled = false }: {
  initialContent: JSONContent;
  onChange?: (content: JSONContent, text: string) => void;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  const editor = useEditor({
    extensions, content: initialContent, immediatelyRender: false,
    editable: !readOnly && !disabled,
    editorProps: {
      attributes: { class: "board-prose", role: "textbox", "aria-label": "본문", "aria-multiline": "true" },
    },
    onUpdate: ({ editor }) => onChange?.(editor.getJSON(), editor.getText({ blockSeparator: "" })),
  });
  const active = useEditorState({
    editor,
    selector: ({ editor }) => editor ? {
      bold: editor.isActive("bold"), italic: editor.isActive("italic"), strike: editor.isActive("strike"),
      heading: editor.isActive("heading", { level: 2 }), bullet: editor.isActive("bulletList"),
      ordered: editor.isActive("orderedList"), quote: editor.isActive("blockquote"),
      code: editor.isActive("codeBlock"), undo: editor.can().undo(), redo: editor.can().redo(),
    } : null,
  });
  useEffect(() => { editor?.setEditable(!readOnly && !disabled); }, [editor, readOnly, disabled]);

  if (!editor) return <p role="status">{readOnly ? "본문" : "편집기"}을 불러오는 중...</p>;
  const tools = [
    { label: "굵게", active: active?.bold, run: () => editor.chain().focus().toggleBold().run() },
    { label: "기울임", active: active?.italic, run: () => editor.chain().focus().toggleItalic().run() },
    { label: "취소선", active: active?.strike, run: () => editor.chain().focus().toggleStrike().run() },
    { label: "소제목", active: active?.heading, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "글머리 목록", active: active?.bullet, run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "번호 목록", active: active?.ordered, run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "인용", active: active?.quote, run: () => editor.chain().focus().toggleBlockquote().run() },
    { label: "코드 블록", active: active?.code, run: () => editor.chain().focus().toggleCodeBlock().run() },
  ];
  return (
    <div className={readOnly ? "board-reader" : "board-editor"}>
      {!readOnly && (
        <div className="board-toolbar" role="toolbar" aria-label="본문 서식">
          {tools.map((tool) => <button key={tool.label} type="button" aria-pressed={Boolean(tool.active)}
            disabled={disabled} onClick={tool.run}>{tool.label}</button>)}
          <button type="button" disabled={disabled || !active?.undo} onClick={() => editor.chain().focus().undo().run()}>실행 취소</button>
          <button type="button" disabled={disabled || !active?.redo} onClick={() => editor.chain().focus().redo().run()}>다시 실행</button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
