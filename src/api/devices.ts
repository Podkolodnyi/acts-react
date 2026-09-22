import { apiGet } from "./client";
import type { Device } from "./types";

export function searchDevices(query: string): Promise<Device[]> {
  const params = new URLSearchParams({ q: query });
  return apiGet(`/api/devices?${params}`);
}
