import { apiGet } from "./client";
import type { ActDetail, ActFilters, ActListItem } from "./types";

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
