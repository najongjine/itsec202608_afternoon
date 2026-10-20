# Elysia with Bun runtime

bun 설치

powershell -c "irm bun.sh/install.ps1|iex"

bun path 등록

$env:Path += ";$env:USERPROFILE\.bun\bin"

## Getting Started

To get started with this template, simply paste this command into your terminal:

```bash
bun create elysia ./elysia-example
```

## Development

To start the development server run:

```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.

## PostgreSQL + Drizzle ORM

1. 의존성을 설치합니다.

```powershell
bun install
```

2. 프로젝트 루트의 환경 파일에 `DATABASE_URL`을 입력합니다.

| 모드 | DB 접속 정보 입력 파일 | 서버 실행 | 마이그레이션 |
| --- | --- | --- | --- |
| 개발 | `.env.development` | `bun run dev` | `bun run db:migrate` |
| 운영 | `.env.production` | `bun run start` | `bun run db:migrate:prod` |

개발용 기본값은 `postgresql://postgres:postgres@localhost:5432/bun_elysia_dev`입니다.
URL의 사용자, 비밀번호, 호스트, 포트, 데이터베이스 이름을 실제 DB에 맞게 수정하세요.
운영 파일은 접속 정보를 직접 입력하도록 비워 두었습니다.
해당 DB는 PostgreSQL에 미리 생성해야 합니다.

환경 파일은 Git에서 제외됩니다. 새로 clone한 경우 아래처럼 예제 파일을 복사하세요.

```powershell
Copy-Item .env.development.example .env.development
Copy-Item .env.production.example .env.production
```

실행 스크립트가 `NODE_ENV`를 지정하고 `src/db/env.ts`가 해당 모드의 파일만 읽습니다.
시스템에서 주입한 `DATABASE_URL`이 파일보다 우선합니다.
`bunfig.toml`은 Bun의 자동 env 로딩을 꺼서 다른 모드의 설정이 섞이지 않도록 합니다.
참고: [Bun 환경 변수 문서](https://bun.sh/docs/runtime/environment-variables)

3. 개발 DB 마이그레이션을 적용하고 서버를 실행합니다.

```powershell
bun run db:migrate
bun run dev
```

파일 구성:

- `src/db/index.ts`: PostgreSQL 연결 풀과 Drizzle `db`, 연결 종료 함수 `closeDb`
- `src/db/env.ts`: 연결 환경 변수 로딩 및 검증
- `drizzle/schema.ts`: 실제 DB에서 가져온 테이블 정의
- `drizzle.config.ts`: Drizzle Kit 설정
- `drizzle/`: 생성된 SQL 마이그레이션

라우트에서는 Elysia 컨텍스트에 등록된 `db`를 사용합니다.

```ts
import { tBoard } from "../drizzle/schema";

app.get("/boards", async ({ db }) => {
  return await db.select().from(tBoard);
});
```

다른 모듈에서는 `import { db } from "./db"`로 가져올 수 있습니다.
연결은 첫 쿼리에서 시작하며, 서버의 `app.stop()` 시 연결 풀을 종료합니다.

스키마 변경 후 `bun run db:generate`로 SQL을 생성하고 `bun run db:migrate`로 적용합니다.
개발 중에는 `bun run db:push`로 스키마를 직접 반영하거나 `bun run db:studio`로 데이터를 확인할 수 있습니다.
타입 검사는 `bun run typecheck`로 실행합니다.

참고: [Drizzle PostgreSQL 공식 문서](https://orm.drizzle.team/docs/get-started/postgresql-new)
