import type { EmployeeType } from "./user";

export interface Salary {
  id: number;
  employee_id: number;
  employee: EmployeeType;
  base_salary: number;
  allowance: number;
  deduction: number;
  overtime_rate: number;
  created_at: string;
  updated_at: string;
}
