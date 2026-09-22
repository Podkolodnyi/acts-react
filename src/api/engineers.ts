import { apiGet } from "./client";
import type { Engineer } from "./types";

export function getEngineers(): Promise<Engineer[]> {
  return apiGet("/api/engineers");
}
