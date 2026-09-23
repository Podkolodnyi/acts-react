import { apiGet } from "./client";
import type { EngineerOption } from "./types";

export function getEngineers(): Promise<EngineerOption[]> {
  return apiGet("/api/engineers");
}
