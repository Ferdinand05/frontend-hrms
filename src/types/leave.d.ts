import type { EmployeeType, UserType } from "./user";

export interface Leave {
  id: number;
  employee_id: number;
  leave_type: string;
  start_date: string; // format: YYYY-MM-DD
  end_date: string; // format: YYYY-MM-DD
  reason: string;
  status: string;
  approved_by?: number | null;
  employee?: EmployeeType;
  approver?: UserType;
  created_at?: string;
  updated_at?: string;
}
