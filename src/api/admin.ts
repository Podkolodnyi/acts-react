import { apiDelete, apiGet, apiPost } from "./client";
import type {
  ActDetail,
  ActVersion,
  ActVersionDetail,
  AdminEngineer,
  DeletedAct,
  PendingEngineer,
  PurgePeriod,
} from "./types";

// Перезагружает справочник аппаратов из Google-таблицы.
export function syncDevices(): Promise<{ imported: number }> {
  return apiPost("/api/admin/devices/sync", {});
}

export function getDeletedActs(): Promise<DeletedAct[]> {
  return apiGet("/api/admin/deleted-acts");
}

// Окончательно удаляет выбранные акты из «Удалённых».
export function purgeDeletedActs(ids: number[]): Promise<{ purged: number }> {
  return apiPost("/api/admin/deleted-acts/purge", { ids });
}

// Очищает «Удалённые» целиком или за последние 30 / 7 дней.
export function purgeDeletedActsByPeriod(
  period: PurgePeriod,
): Promise<{ purged: number }> {
  return apiPost("/api/admin/deleted-acts/purge", { period });
}

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

export function getActVersions(): Promise<ActVersion[]> {
  return apiGet("/api/admin/act-versions");
}

export function getActVersion(id: number): Promise<ActVersionDetail> {
  return apiGet(`/api/admin/act-versions/${id}`);
}

export function purgeActVersions(ids: number[]): Promise<{ purged: number }> {
  return apiPost("/api/admin/act-versions/purge", { ids });
}

// Очищает версии целиком или сохранённые за последние 30 / 7 дней.
export function purgeActVersionsByPeriod(
  period: PurgePeriod,
): Promise<{ purged: number }> {
  return apiPost("/api/admin/act-versions/purge", { period });
}

// Возвращает удалённый акт с новым номером (код автора, текущий месяц).
export function restoreDeletedAct(
  id: number,
): Promise<{ id: number; act_number: string }> {
  return apiPost(`/api/admin/deleted-acts/${id}/restore`, {});
}

// Заменяет содержимое акта версией и удаляет все версии этого акта.
// Если акт удалён, сервер сначала восстанавливает его с новым номером.
export function restoreActVersion(id: number): Promise<ActDetail> {
  return apiPost(`/api/admin/act-versions/${id}/restore`, {});
}
