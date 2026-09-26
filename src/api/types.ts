export interface Engineer {
  id: string;
  name: string;
  first_name: string;
  code: string;
  is_admin: boolean;
}

export interface EngineerOption {
  id: string;
  name: string;
  first_name: string;
  code: string;
  has_password: boolean;
}

export interface PendingEngineer {
  id: string;
  name: string;
  first_name: string;
  code: string;
  created_at: string;
}

export interface AdminEngineer {
  id: string;
  name: string;
  first_name: string;
  code: string;
  is_admin: boolean;
}

export interface Device {
  id: number;
  customer_name: string;
  device_model: string;
  serial_number: string;
  address: string;
}

// "standard" — обычный акт, "thermo" — ремонт узла терморегистрации.
export type ActNumberType = "standard" | "thermo";

export type DeviceCondition = "Работает" | "Не работает";

// Бейдж акта. У актов терморегистрации состояния нет — null.
export type ActState = "working" | "broken" | "repaired";

export interface LinkedAct {
  id: number;
  act_number: string;
}

export interface Material {
  name: string;
  article: string;
  quantity: string;
}

export interface ActListItem {
  id: number;
  act_number: string;
  number_type: ActNumberType;
  device_condition: string;
  state: ActState | null;
  customer_name: string;
  device_model: string;
  serial_number: string;
  engineer_name: string;
  engineer_key: string;
  created_at: string;
  work_date: string;
  repaired_by: LinkedAct | null;
  repair_of: LinkedAct | null;
}

// Поля, которые инженер заполняет в форме акта.
export interface ActFields {
  customer_name: string;
  customer_representative: string;
  device_model: string;
  serial_number: string;
  printeco_label: string;
  device_type: string;
  comment_label: string;
  address: string;
  phone: string;
  fault: string;
  counter_bw: string;
  counter_color: string;
  service_kind: string;
  diagnostics_result: string;
  works_text: string;
  work_date: string;
  start_time: string;
  end_time: string;
  customer_signatory: string;
  intraservice_task_id: string;
}

export interface ActDetail extends ActListItem, ActFields {
  engineer_code: string;
  source_device_id: number | null;
  updated_at: string;
  materials: Material[];
  can_edit: boolean;
  can_repair: boolean;
}

// Тело запроса на создание / изменение / ремонт акта.
export interface ActPayload extends ActFields {
  number_type?: ActNumberType;
  device_condition?: DeviceCondition | "";
  source_device_id: number | null;
  materials: Material[];
}

export interface ActFilters {
  type?: ActNumberType;
  q?: string;
  customer?: string;
  engineer?: string;
  state?: "working" | "broken";
  date_from?: string;
  date_to?: string;
}

export interface ActCounters {
  working: number;
  broken: number;
  thermo: number;
}

export interface ActStats {
  total: ActCounters;
  month: ActCounters;
}
