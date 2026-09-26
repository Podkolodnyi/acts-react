import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type {
  ActDetail,
  ActFilters,
  ActListItem,
  ActPayload,
  ActStats,
} from "./types";

export function getActs(filters: ActFilters = {}): Promise<ActListItem[]> {
  const entries = Object.entries(filters).filter(
    ([, value]) => value !== undefined && value !== "",
  ) as [string, string][];

  const params = new URLSearchParams(entries);
  return apiGet(`/api/acts?${params}`);
}

export function getAct(id: number): Promise<ActDetail> {
  return apiGet(`/api/acts/${id}`);
}

export function getActStats(): Promise<ActStats> {
  return apiGet("/api/acts/stats");
}

export function createAct(payload: ActPayload): Promise<ActDetail> {
  return apiPost("/api/acts", payload);
}

export function updateAct(id: number, payload: ActPayload): Promise<ActDetail> {
  return apiPut(`/api/acts/${id}`, payload);
}

// Переносит акт в «Удалённые акты»: он получает номер DEL-NNNN.
export function deleteAct(
  id: number,
): Promise<{ status: string; act_number: string }> {
  return apiDelete(`/api/acts/${id}`);
}

// Создаёт копию акта «Не работает» с состоянием «Работает».
export function repairAct(id: number, payload: ActPayload): Promise<ActDetail> {
  return apiPost(`/api/acts/${id}/repair`, payload);
}
