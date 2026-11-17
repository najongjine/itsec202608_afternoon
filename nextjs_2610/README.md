This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Zustand + persist

공통 모듈: `lib/create-persisted-store.ts` · [사용 매뉴얼](docs/zustand-persist.md)

## 텍스트 게시판

서버(`../bun_elysia_2610`)와 프론트를 각각 실행합니다.

```powershell
# 서버 디렉터리에서 (Windows PowerShell)
bun install
$env:NODE_ENV = "development"
bun run src/index.ts

# 별도 터미널, 이 프론트 디렉터리에서
npm install
npm run dev -- --port 3001
```

`.env.development`의 `NEXT_PUBLIC_API_URL`은 `http://localhost:3000`으로 설정합니다.
서버는 기존 `.env.development`의 DB·JWT 설정을 사용합니다. DB 스키마 변경은 없습니다.

`http://localhost:3001/boardlist` 또는 상단 **게시판** 메뉴에서 이용합니다.
목록·제목 검색·상세 조회는 공개이며, 기존 회원가입·로그인 후 작성할 수 있습니다.
수정·삭제는 작성자만 가능하고 서버에서도 권한을 확인합니다.

본문은 Tiptap JSON 문자열을 기존 `t_board.content`에 저장하며, 기존 일반 텍스트 글도 조회·수정할 수 있습니다.
제목은 100자, 본문은 10,000자까지입니다. 굵게, 기울임, 취소선, 소제목, 목록, 인용, 코드 블록을 지원합니다.
이미지·영상·파일 업로드는 없습니다.

게시판 API: `GET /board/get_board_list?page=1&q=검색어`, `GET /board/get_a_board?board_id=1`,
`POST /board/upsert` (FormData: `title`, `content`, 수정 시 `board_id`), `DELETE /board/delete?board_id=1`.
쓰기 요청에는 `Authorization: Bearer <token>`이 필요합니다.

검증: 프론트 `npm run build`, 서버 `bun run typecheck`, `bun test src/utils`.
실제 개발 DB 통합 테스트는 서버 디렉터리에서 `$env:RUN_BOARD_INTEGRATION = "1"` 설정 후
`bun test src/router/board_router.test.ts`로 실행합니다. 테스트가 만든 회원과 글은 자동 정리됩니다.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
