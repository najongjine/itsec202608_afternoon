import { expect, test } from "bun:test";
import { Elysia } from "elysia";
import { inArray } from "drizzle-orm";
import { tBoard, tUser } from "../../drizzle/schema";
import { signToken } from "../utils/jwt";

// 실제 개발 DB가 필요합니다. 생성한 테스트 회원과 글만 마지막에 삭제합니다.
const integrationTest = process.env.RUN_BOARD_INTEGRATION === "1" ? test : test.skip;
integrationTest("게시판 API: CRUD, 검색, 페이지 이동, 작성자 권한, 입력 오류", async () => {
  process.env.NODE_ENV = "development";
  const { db } = await import("../db");
  const { boardRouter } = await import("./board_router");
  const app = new Elysia().use(boardRouter);
  const ids: number[] = [];
  const prefix = `board_test_${crypto.randomUUID()}`;
  const doc = JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "검증 본문", marks: [{ type: "bold" }] }] }] });
  const request = async (path: string, method = "GET", token?: string, values?: Record<string, string>) => {
    const form = new FormData();
    for (const [key, value] of Object.entries(values ?? {})) form.set(key, value);
    const response = await app.handle(new Request(`http://localhost/board${path}`, {
      method, headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: values ? form : undefined,
    }));
    return { status: response.status, body: await response.json() };
  };
  try {
    for (const suffix of ["owner", "other"]) {
      const [user] = await db.insert(tUser).values({ username: `${prefix}_${suffix}` }).returning({ id: tUser.id });
      ids.push(user!.id);
    }
    const token = await signToken({ userId: ids[0] });
    const other = await signToken({ userId: ids[1] });
    expect((await request("/upsert", "POST", undefined, { title: "제목", content: doc })).status).toBe(401);
    expect((await request("/upsert", "POST", "invalid", { title: "제목", content: doc })).status).toBe(401);
    expect((await request("/upsert", "POST", token, { title: " ", content: doc })).status).toBe(400);
    expect((await request("/upsert", "POST", token, { title: "제목", content: "<p></p>" })).status).toBe(400);
    const created = await request("/upsert", "POST", token, { title: prefix, content: doc });
    expect(created.status).toBe(201);
    const id = created.body.data.id;
    const detail = await request(`/get_a_board?board_id=${id}`);
    expect(detail.body.data.title).toBe(prefix);
    expect(JSON.parse(detail.body.data.content)).toEqual(JSON.parse(doc));
    const list = await request(`/get_board_list?q=${prefix}&page=999`);
    expect(list.body.pagination).toEqual({ page: 1, pageSize: 10, total: 1 });
    expect(list.body.data[0].id).toBe(id);
    expect(list.body.data[0].content).toBeUndefined();
    expect((await request("/get_board_list?page=0")).status).toBe(400);
    expect((await request("/get_a_board?board_id=nope")).status).toBe(400);
    expect((await request("/upsert", "POST", other, { board_id: String(id), title: "탈취 시도", content: doc })).status).toBe(403);
    expect((await request(`/delete?board_id=${id}`, "DELETE", other)).status).toBe(403);
    const updated = await request("/upsert", "POST", token, { board_id: String(id), title: `${prefix}_수정`, content: doc });
    expect(updated.status).toBe(200);
    expect(updated.body.data.id).toBe(id);
    expect(updated.body.data.title).toBe(`${prefix}_수정`);
    expect((await request(`/get_board_list?q=${prefix}`)).body.pagination.total).toBe(1);
    const legacy = await db.insert(tBoard).values(Array.from({ length: 11 }, (_, i) => ({
      title: `${prefix}_기존글_${i}`, content: "기존 일반 텍스트\n<script>도 텍스트입니다.</script>", userId: ids[0]!,
    }))).returning({ id: tBoard.id });
    const firstPage = await request(`/get_board_list?q=${prefix}&page=1`);
    const secondPage = await request(`/get_board_list?q=${prefix}&page=2`);
    expect(firstPage.body.data.length).toBe(10);
    expect(secondPage.body.data.length).toBe(2);
    expect(secondPage.body.pagination).toEqual({ page: 2, pageSize: 10, total: 12 });
    expect(firstPage.body.data[0].id).toBe(legacy[10]!.id);
    expect((await request(`/get_a_board?board_id=${legacy[0]!.id}`)).body.data.content).toContain("기존 일반 텍스트");
    expect((await request(`/delete?board_id=${id}`, "DELETE")).status).toBe(401);
    expect((await request(`/delete?board_id=${id}`, "DELETE", token)).status).toBe(200);
    expect((await request(`/get_a_board?board_id=${id}`)).status).toBe(404);
    expect((await request("/upsert", "POST", token, { board_id: String(id), title: "삭제된 글", content: doc })).status).toBe(404);
    expect((await request(`/delete?board_id=${id}`, "DELETE", token)).status).toBe(404);
  } finally {
    if (ids.length) await db.delete(tUser).where(inArray(tUser.id, ids));
  }
}, 20_000);
