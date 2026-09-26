import { apiGet } from "./client";
import type { IntraserviceDevice, IntraserviceTask } from "./types";

// Поиск заявок Intraservice по серийному номеру.
export function searchIntraservice(query: string): Promise<{ tasks: IntraserviceTask[] }> {
  const params = new URLSearchParams({ q: query });
  return apiGet(`/api/intraservice/search?${params}`);
}

// Временная карточка аппарата: модель и клиент из заявки + наши акты.
export function getIntraserviceDevice(
  taskId: number,
  serial: string,
): Promise<IntraserviceDevice> {
  const params = new URLSearchParams({ serial });
  return apiGet(`/api/intraservice/task/${taskId}?${params}`);
}

// Ссылка на новый акт с данными из заявки Intraservice.
export function newActFromTask(serial: string, task: IntraserviceTask): string {
  const params = new URLSearchParams({ serial, task: String(task.id) });
  if (task.model) params.set("model", task.model);
  if (task.customer) params.set("customer", task.customer);
  return `/acts/new?${params}`;
}
