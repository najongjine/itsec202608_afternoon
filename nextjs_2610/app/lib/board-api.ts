import type { BoardData, BoardSummary, Pagination } from "../types/board_types";

type ApiResult<T> = { success: boolean; data: T; msg?: string; pagination?: Pagination };

async function request<T>(path: string, options?: RequestInit): Promise<ApiResult<T>> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("API 주소가 설정되지 않았습니다.");
  let response: Response;
  try {
    response = await fetch(`${base.replace(/\/$/, "")}/board${path}`, { cache: "no-store", ...options });
  } catch (error) {
    if (options?.signal?.aborted) throw error;
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }
  const result: ApiResult<T> = await response.json();
  if (!response.ok || !result.success) throw new Error(result.msg || "요청을 처리하지 못했습니다.");
  return result;
}

export async function getBoards(page: number, search: string, signal: AbortSignal) {
  const query = new URLSearchParams({ page: String(page), q: search });
  const result = await request<BoardSummary[]>(`/get_board_list?${query}`, { signal });
  if (!result.pagination) throw new Error("목록 응답이 올바르지 않습니다.");
  return { boards: result.data, pagination: result.pagination };
}

export async function getBoard(id: number, signal: AbortSignal) {
  return (await request<BoardData>(`/get_a_board?board_id=${id}`, { signal })).data;
}

export async function saveBoard(title: string, content: string, token: string, id?: number) {
  const body = new FormData();
  body.set("title", title);
  body.set("content", content);
  if (id) body.set("board_id", String(id));
  return (await request<BoardData>("/upsert", {
    method: "POST", headers: { Authorization: `Bearer ${token}` }, body,
  })).data;
}

export async function deleteBoard(id: number, token: string) {
  await request(`/delete?board_id=${id}`, {
    method: "DELETE", headers: { Authorization: `Bearer ${token}` },
  });
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
}

export function parseBoardId(value: string | null): number | null {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 && id <= 2147483647 ? id : null;
}

export function formatBoardDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short",
  }).format(date);
}
