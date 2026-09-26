import { apiGet } from "./client";
import type { Device, DeviceCatalogResult, DeviceDetail } from "./types";

// Поиск по серийнику — для формы акта («Найти в справочнике»).
export function searchDevices(query: string): Promise<Device[]> {
  const params = new URLSearchParams({ q: query });
  return apiGet(`/api/devices?${params}`);
}

// Поиск по серийнику, модели, клиенту и адресу — для страницы «Аппараты».
export function searchDeviceCatalog(query: string): Promise<DeviceCatalogResult> {
  const params = new URLSearchParams({ q: query });
  return apiGet(`/api/devices/catalog?${params}`);
}

export function getDevice(id: number): Promise<DeviceDetail> {
  return apiGet(`/api/devices/${id}`);
}
