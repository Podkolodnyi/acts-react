import { apiDelete, apiGet, apiPost } from "./client";
import type { AdminEngineer, PendingEngineer } from "./types";

export function getPendingEngineers(): Promise<PendingEngineer[]> {
  return apiGet("/api/admin/pending-engineers");
}

export function approveEngineer(key: string): Promise<{ status: string }> {
  return apiPost(`/api/admin/engineers/${key}/approve`, {});
}

export function rejectEngineer(key: string): Promise<{ status: string }> {
  return apiPost(`/api/admin/engineers/${key}/reject`, {});
}

export function getAdminEngineers(): Promise<AdminEngineer[]> {
  return apiGet("/api/admin/engineers");
}

export function deleteEngineer(key: string): Promise<{ status: string }> {
  return apiDelete(`/api/admin/engineers/${key}`);
}

export function promoteEngineer(key: string): Promise<{ is_admin: boolean }> {
  return apiPost(`/api/admin/engineers/${key}/promote`, {});
}

export function demoteEngineer(key: string): Promise<{ is_admin: boolean }> {
  return apiPost(`/api/admin/engineers/${key}/demote`, {});
}
