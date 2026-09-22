import { apiDelete, apiGet, apiPost } from "./client";
import type { Engineer } from "./types";

export function getSession(): Promise<{ engineer: Engineer | null }> {
  return apiGet("/api/session");
}

export function selectEngineer(
  engineerKey: string,
): Promise<{ engineer: Engineer }> {
  return apiPost("/api/session/engineer", { engineer_key: engineerKey });
}

export function logout(): Promise<{ engineer: null }> {
  return apiDelete("/api/session");
}
