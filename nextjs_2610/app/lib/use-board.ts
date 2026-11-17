"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BoardData } from "../types/board_types";
import { errorMessage, getBoard } from "./board-api";

export function useBoard(id: number | null) {
  const { bfcacheId } = useRouter();
  const [result, setResult] = useState<{
    id: number; visit: string; board?: BoardData; error?: string;
  } | null>(null);
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    getBoard(id, controller.signal).then(
      (board) => { if (!controller.signal.aborted) setResult({ id, visit: bfcacheId, board }); },
      (error: unknown) => { if (!controller.signal.aborted) setResult({ id, visit: bfcacheId, error: errorMessage(error) }); },
    );
    return () => controller.abort();
  }, [id, bfcacheId]);
  return result?.id === id && result?.visit === bfcacheId ? result : null;
}
