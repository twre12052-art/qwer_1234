// Database types (shared across all modules)

export type CaseStatus = 
  | 'GUARDIAN_PENDING'
  | 'CAREGIVER_PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELED';

export type UserRole = 'guardian' | 'admin';

export interface User {
  id: string;
  auth_email: string;
  name: string;
  full_name?: string;
  birth_date?: string;
  contact_email?: string;
  phone: string;
  phone_verified_at?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  guardian_id: string;
  patient_name: string;
  hospital_name?: string;
  diagnosis?: string;
  start_date: string;
  end_date_expected: string;
  end_date_final?: string;
  daily_wage: number;
  caregiver_name?: string;
  caregiver_contact?: string;
  caregiver_phone?: string;
  caregiver_birth_date?: string;
  caregiver_account_bank?: string;
  caregiver_account_number?: string;
  status: CaseStatus;
  guardian_agreed_at?: string;
  caregiver_agreed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CaseToken {
  id: string;
  case_id: string;
  token: string;
  created_at: string;
  expires_at?: string;
}

export interface CareLog {
  id: string;
  case_id: string;
  date: string;
  content?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  case_id: string;
  total_amount?: number;
  paid_at?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  case_id?: string;
  action: string;
  meta?: Record<string, any>;
  created_at: string;
}

// Activity Log Actions
export const ACTIVITY_ACTIONS = {
  CHANGE_PERIOD: 'CHANGE_PERIOD',
  FORCE_END: 'FORCE_END',
  DELETE_CASE: 'DELETE_CASE',
  EXTEND_CASE: 'EXTEND_CASE',
  EARLY_END: 'EARLY_END',
  RESEND_LINK: 'RESEND_LINK',
} as const;

export type ActivityAction = typeof ACTIVITY_ACTIONS[keyof typeof ACTIVITY_ACTIONS];
