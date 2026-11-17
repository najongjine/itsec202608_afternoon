import { Elysia } from "elysia";
import { and, count, desc, eq, getTableColumns, ilike } from "drizzle-orm";
import { db } from "../db";
import { tBoard, tUser } from "../../drizzle/schema";
import { getBearerToken, verifyToken } from "../utils/jwt";
import { validateBoardInput } from "../utils/board-content";

export const boardRouter = new Elysia({ prefix: "/board" });
const fail = (msg: string) => ({ success: false, data: null, msg });

function boardId(value: unknown): number | null {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 && id <= 2147483647 ? id : null;
}

async function authenticatedUser(request: Request) {
  const token = getBearerToken(request.headers.get("authorization"));
  if (!token) return null;
  const auth = await verifyToken(token);
  return boardId(auth?.userId);
}

boardRouter.get("/get_board_list", async ({ query, set }) => {
  const requestedPage = Number(query.page ?? 1);
  const search = (query.q ?? "").trim();
  if (!Number.isSafeInteger(requestedPage) || requestedPage < 1 || search.length > 100) {
    set.status = 400;
    return fail("목록 조회 조건이 올바르지 않습니다.");
  }
  try {
    const pageSize = 10;
    const where = search ? ilike(tBoard.title, `%${search.replace(/[\\%_]/g, "\\$&")}%`) : undefined;
    const [summary] = await db.select({ total: count() }).from(tBoard).where(where);
    const total = summary?.total ?? 0;
    const page = Math.min(requestedPage, Math.max(1, Math.ceil(total / pageSize)));
    const data = await db.select({
      id: tBoard.id, title: tBoard.title, userId: tBoard.userId,
      createdDt: tBoard.createdDt, author: tUser.username,
    }).from(tBoard).leftJoin(tUser, eq(tBoard.userId, tUser.id))
      .where(where).orderBy(desc(tBoard.id)).limit(pageSize).offset((page - 1) * pageSize);
    return { success: true, data, pagination: { page, pageSize, total }, msg: "" };
  } catch (error) {
    console.error("[board:list]", error);
    set.status = 500;
    return fail("게시글 목록을 불러오지 못했습니다.");
  }
});

boardRouter.get("/get_a_board", async ({ query, set }) => {
  const id = boardId(query.board_id);
  if (!id) { set.status = 400; return fail("올바른 게시글 번호가 필요합니다."); }
  try {
    const [data] = await db.select({ ...getTableColumns(tBoard), author: tUser.username })
      .from(tBoard).leftJoin(tUser, eq(tBoard.userId, tUser.id))
      .where(eq(tBoard.id, id)).limit(1);
    if (!data) { set.status = 404; return fail("게시글을 찾을 수 없습니다."); }
    return { success: true, data, msg: "" };
  } catch (error) {
    console.error("[board:detail]", error);
    set.status = 500;
    return fail("게시글을 불러오지 못했습니다.");
  }
});

boardRouter.post("/upsert", async ({ request, set }) => {
  try {
    const userId = await authenticatedUser(request);
    if (!userId) { set.status = 401; return fail("로그인이 필요합니다. 다시 로그인해 주세요."); }
    let form: FormData;
    try { form = await request.formData(); }
    catch { set.status = 400; return fail("잘못된 요청 형식입니다."); }
    const rawId = form.get("board_id");
    const id = rawId === null ? null : boardId(rawId);
    if (rawId !== null && !id) { set.status = 400; return fail("올바른 게시글 번호가 필요합니다."); }
    const input = validateBoardInput(form.get("title"), form.get("content"));
    if (!input.success) { set.status = 400; return fail(input.msg); }
    if (id) {
      const [existing] = await db.select({ userId: tBoard.userId }).from(tBoard).where(eq(tBoard.id, id));
      if (!existing) { set.status = 404; return fail("게시글을 찾을 수 없습니다."); }
      if (existing.userId !== userId) { set.status = 403; return fail("작성자만 수정할 수 있습니다."); }
      const [data] = await db.update(tBoard).set(input.data)
        .where(and(eq(tBoard.id, id), eq(tBoard.userId, userId))).returning();
      if (!data) { set.status = 404; return fail("게시글을 찾을 수 없습니다."); }
      return { success: true, data, msg: "수정했습니다." };
    }
    const [data] = await db.insert(tBoard).values({ ...input.data, userId }).returning();
    set.status = 201;
    return { success: true, data, msg: "등록했습니다." };
  } catch (error) {
    console.error("[board:save]", error);
    set.status = 500;
    return fail("게시글을 저장하지 못했습니다.");
  }
}, { parse: "none" });

boardRouter.delete("/delete", async ({ request, query, set }) => {
  try {
    const userId = await authenticatedUser(request);
    if (!userId) { set.status = 401; return fail("로그인이 필요합니다. 다시 로그인해 주세요."); }
    const id = boardId(query.board_id);
    if (!id) { set.status = 400; return fail("올바른 게시글 번호가 필요합니다."); }
    const [existing] = await db.select({ userId: tBoard.userId }).from(tBoard).where(eq(tBoard.id, id));
    if (!existing) { set.status = 404; return fail("게시글을 찾을 수 없습니다."); }
    if (existing.userId !== userId) { set.status = 403; return fail("작성자만 삭제할 수 있습니다."); }
    const [data] = await db.delete(tBoard)
      .where(and(eq(tBoard.id, id), eq(tBoard.userId, userId))).returning({ id: tBoard.id });
    if (!data) { set.status = 404; return fail("게시글을 찾을 수 없습니다."); }
    return { success: true, data, msg: "삭제했습니다." };
  } catch (error) {
    console.error("[board:delete]", error);
    set.status = 500;
    return fail("게시글을 삭제하지 못했습니다.");
  }
});
