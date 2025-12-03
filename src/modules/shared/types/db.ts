export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cases: {
        Row: {
          id: string;
          guardian_id: string;
          patient_name: string;
          hospital_name: string | null;
          diagnosis: string | null;
          start_date: string;
          end_date_expected: string;
          end_date_final: string | null;
          daily_wage: number;
          caregiver_name: string | null;
          caregiver_contact: string | null;
          caregiver_phone: string | null;
          caregiver_birth_date: string | null;
          caregiver_account_bank: string | null;
          caregiver_account_number: string | null;
          status: "GUARDIAN_PENDING" | "CAREGIVER_PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
          guardian_agreed_at: string | null;
          caregiver_agreed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guardian_id: string;
          patient_name: string;
          hospital_name?: string | null;
          diagnosis?: string | null;
          start_date: string;
          end_date_expected: string;
          end_date_final?: string | null;
          daily_wage: number;
          caregiver_name?: string | null;
          caregiver_contact?: string | null;
          caregiver_phone?: string | null;
          caregiver_birth_date?: string | null;
          caregiver_account_bank?: string | null;
          caregiver_account_number?: string | null;
          status?: "GUARDIAN_PENDING" | "CAREGIVER_PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
          guardian_agreed_at?: string | null;
          caregiver_agreed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          guardian_id?: string;
          patient_name?: string;
          hospital_name?: string | null;
          diagnosis?: string | null;
          start_date?: string;
          end_date_expected?: string;
          end_date_final?: string | null;
          daily_wage?: number;
          caregiver_name?: string | null;
          caregiver_contact?: string | null;
          caregiver_phone?: string | null;
          caregiver_birth_date?: string | null;
          caregiver_account_bank?: string | null;
          caregiver_account_number?: string | null;
          status?: "GUARDIAN_PENDING" | "CAREGIVER_PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
          guardian_agreed_at?: string | null;
          caregiver_agreed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      case_tokens: {
        Row: {
          id: string;
          case_id: string;
          token: string;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          case_id: string;
          token?: string;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          case_id?: string;
          token?: string;
          created_at?: string;
          expires_at?: string | null;
        };
      };
    };
  };
}

