import { ApiError } from "../api/client";

export function extractErrorMessage(err: unknown, fallback: string): string {
  const body = err instanceof ApiError ? err.body : null;
  if (body && typeof body === "object" && "error" in body) {
    return String((body as { error: unknown }).error);
  }
  return fallback;
}
