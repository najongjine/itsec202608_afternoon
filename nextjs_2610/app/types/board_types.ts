export type BoardSummary = {
  id: number;
  title: string | null;
  userId: number;
  author: string | null;
  createdDt: string | null;
};

export type BoardData = BoardSummary & {
  content: string | null;
  viewcnt: number | null;
  likecnt: number | null;
};

export type Pagination = { page: number; pageSize: number; total: number };
