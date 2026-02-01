
export type Language = 'TH' | 'EN';
export type Theme = 'DIGITAL' | 'BUILDING' | 'BUSINESS';

export enum AppView {
  MAIN = 'MAIN',
  ASSET = 'ASSET',
  WORK_ORDER = 'WORK_ORDER',
  PPM = 'PPM',
  ADMIN = 'ADMIN',
  INVENTORY = 'INVENTORY',
  AI_ANALYTICS = 'AI_ANALYTICS',
  MOBILE_APPS = 'MOBILE_APPS',
  DASHBOARD_MONITOR = 'DASHBOARD_MONITOR',
  MORNING_BRIEF = 'MORNING_BRIEF'
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  building: string;
  email?: string;
  status: 'pending' | 'approved' | 'rejected';
  password?: string;
  created_at?: string;
}

export interface MorningBrief {
  id: string;
  date: string;
  recorder: string;
  
  // 1. Risk Assessment
  risk_status: 'normal' | 'abnormal';
  // Added risk_note for abnormal risk reporting
  risk_note?: string;
  risk_elec_fail: boolean;
  risk_water_loss: boolean;
  risk_chiller_fail: boolean;
  risk_water_leak: boolean;
  risk_elevator_fail: boolean;
  risk_gas_fail: boolean;
  
  // 2. Fire Safety
  fire_safety_status: 'normal' | 'abnormal';
  // Added fire_notes for fire safety reporting
  fire_notes?: string;
  
  // 3. Customer Satisfaction
  satisfaction_status: 'normal' | 'abnormal';
  // Added sat_notes for satisfaction reporting
  sat_notes?: string;
  
  // 4. Roster
  roster_morning: number;
  roster_afternoon: number;
  roster_night: number;
  roster_total: number;
  roster_note?: string;

  // 5. Operation CM/PM/OM
  op_total_percent: number;
  cm_percent: number;
  cm_in: number;
  cm_out: number;
  cm_pending_month: number;
  pm_total: number;
  pm_complete: number;
  pm_pending_notes?: string;
  om_plan: number;
  om_actual: number;

  // 6. Main Equipment Availability
  avail_elec: boolean;
  avail_emergency: boolean;
  avail_ac: boolean;
  avail_vent: boolean;
  avail_fire_alarm: boolean;
  avail_fire_protection: boolean;
  avail_sanitary: boolean;
  avail_transp: boolean;
  avail_waste_water: boolean;
  avail_med_gas: boolean;
  avail_lpg: boolean;
  avail_cctv: boolean;
  avail_gate: boolean;
  avail_notes?: string;

  // 7. FMS Emergency Test
  gen_test_date: string;
  gen_fuel_level: number;
  gen_fuel_percent: number;
  gen_backup_hours: number;
  fire_pump_date: string;
  fire_pump_fuel: number;
  fire_pump_percent: number;
  fire_pump_hours: number;
  wwtp_check_pass: boolean;

  // 8. Utility Cost
  elec_kwh: number;
  elec_diff: number;
  chiller_kwh: number;
  chiller_diff: number;
  water_m3: number;
  water_diff: number;
  lox_remains: number;
  lox_usage: number;
  lox_diff: number;
  lpg_a_tanks: number;
  lpg_a_bar: number;
  lpg_b_tanks: number;
  lpg_b_bar: number;
  water_hosp_unit: number;
  water_hosp_diff: number;
  water_cooling_unit: number;
  water_cooling_diff: number;
  water_ro_unit: number;
  water_ro_diff: number;
  tank_total_m3: number;
  tank_backup_days: number;
  tank_a_m3: number;
  tank_a_percent: number;
  tank_b_m3: number;
  tank_b_percent: number;
  tank_fire_m3: number;

  // 9. MA Contract / Third Party
  ma_vendors: string;
  improvement_vendors: string;

  created_at: string;
}

export interface Staff {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'off';
  mttr: number;
  jobsCompleted: number;
}

export interface WorkOrder {
  id?: string;
  work_request_no: string;
  date: string;
  notification_time: string;
  building_name: string;
  main_floor: string;
  main_area: string;
  main_department: string;
  type_area: string;
  room_no: string;
  job_detail: string;
  code_emergency: string;
  priority_work: string;
  staff_notification_name: string;
  phone_number: string;
  work_progress: 'Pending' | 'On Process' | 'Complete';
  helpdesk_name?: string;
  technician_name?: string;
  technician_id?: string;
  work_date_actual_start?: string;
  work_date_actual_finish?: string;
  work_system?: 'RM' | 'PM' | 'OM' | 'MA';
  work_type?: 'EE' | 'SN' | 'ER' | 'FA' | 'BS' | 'OTH';
  closure_type?: 'Permanent' | 'Temporary' | 'Follow-up' | 'Waiting for Parts';
  problem_desc?: string;
  cause_desc?: string;
  solution_desc?: string;
  prevention_desc?: string;
  repair_duration_hrs?: number;
  lead_time_hrs?: number;
  summarizer_name?: string;
  customer_name?: string;
  customer_satisfy?: number;
  satisfy_feedback?: string;
  approver_name?: string;
  created_at?: string;
}

export interface MasterData {
  floors: string[];
  typeAreas: string[];
  staff: Staff[];
  workGroups: string[];
  systemWorks: string[];
  emergencyCodes: Array<{ code: string, desc: string, color: string }>;
  separateDetails: string[];
  targetTimes: Array<{ id: string, system: string, value: number }>;
  departments: Array<{
    id: string;
    mainArea: string;
    name: string;
    floor: string;
    typeArea: string;
    internalNo: string;
    mobileNo: string;
  }>;
  equipment: Array<{
    id: string;
    name: string;
    floor: string;
    department: string;
    subArea: string;
    system: string;
    subSystem: string;
    group: string;
    code: string;
  }>;
}

export interface AnalyticsSignal {
  configId: string;
  currentValue: number;
  status: 'normal' | 'alert';
  timestamp: string;
}

export interface AnalyticsConfig {
  id: string;
  name: string;
  unit: string;
  min: number;
  max: number;
  standard: number;
  appUrl: string;
  connectionMode?: 'api' | 'csv';
  csvUrl?: string;
  columnName?: string;
}

export interface AnalyticsGroup {
  id: string;
  name: string;
  parameters: AnalyticsConfig[];
}

export interface AppSheetRecord {
  hospital: string;
  category: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  status: string;
}

export interface AnalyticsAlertHistory {
  id: string;
  configId: string;
  value: number;
  status: 'normal' | 'alert';
  timestamp: string;
  resolvedAt?: string;
}

export interface Asset {
  asset_class: string;
  company_code: string;
  asset_no: string;
  sub_number: string;
  capitalized_on: string;
  asset_description: string;
  useful_life: number;
  cost_center: string;
  cost_center_name: string;
  code_ref: string;
  status: string;
  asset_value: number;
}

export interface AnnualRecord {
  id: string;
  building: string;
  floor: string;
  area_detail: string;
  inspected_by: string;
  tel_no: string;
  signature_url?: string;
  created_at: string;
}

export interface PPMTask {
  ppm_id: string;
  equipment_name: string;
  building: 'vimut' | 'vth';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to: string;
  next_maintenance: string;
  notes: string;
  status: 'scheduled' | 'pending' | 'completed' | 'overdue';
  created_at: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Mechanical' | 'Electrical' | 'Plumbing' | 'Medical' | 'IT' | 'General';
  quantity: number;
  min_level: number;
  unit: string;
  location: string;
  unit_price: number;
}

export interface InventoryTransaction {
  id: string;
  item_id: string;
  item_name: string;
  type: 'IN' | 'OUT';
  quantity: number;
  user: string;
  date: string;
  reference: string;
}
