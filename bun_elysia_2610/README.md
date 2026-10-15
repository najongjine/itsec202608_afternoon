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
