export interface Engineer {
  id: string;
  name: string;
  code: string;
}

export interface Device {
  id: number;
  customer_name: string;
  device_model: string;
  serial_number: string;
  address: string;
}

export interface ActListItem {
  id: number;
  act_number: string;
  status: string;
  customer_name: string;
  device_model: string;
  serial_number: string;
  engineer_name: string;
  engineer_key: string;
  created_at: string;
  work_date: string;
}

export interface ActDetail extends ActListItem {
  number_type: string;
  engineer_code: string;
  customer_representative: string;
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
  materials_text: string;
  start_time: string;
  end_time: string;
  device_condition: string;
  customer_signatory: string;
  source_device_id: number | null;
  intraservice_task_id: string;
  updated_at: string;
}

export interface ActFilters {
  q?: string;
  engineer?: string;
  status?: "draft" | "completed";
  date_from?: string;
  date_to?: string;
}
