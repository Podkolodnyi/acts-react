import { ApiError } from "../api/client";
import type { LinkedAct } from "../api/types";

export function extractErrorMessage(err: unknown, fallback: string): string {
  const body = err instanceof ApiError ? err.body : null;
  if (body && typeof body === "object" && "error" in body) {
    return String((body as { error: unknown }).error);
  }
  return fallback;
}

// Сервер отвечает ORIGINAL_REPAIRED, когда восстановить копию нельзя:
// исходный акт уже отремонтирован другой копией. Достаём ссылку на неё.
export function extractRepairedBy(err: unknown): LinkedAct | null {
  const body = err instanceof ApiError ? err.body : null;
  if (body && typeof body === "object" && "repaired_by" in body) {
    return (body as { repaired_by: LinkedAct }).repaired_by;
  }
  return null;
}
