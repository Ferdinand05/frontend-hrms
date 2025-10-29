import type { Salary } from "./salary";
import type { EmployeeType } from "./user";

export interface Payroll {
  id: number;
  employee_id: number;
  salary_id: number | null;
  period: string; // contoh: "2025-10" atau "2025-10-01"
  base_salary: number;
  allowance: number;
  overtime_hours: number;
  overtime_pay: number;
  deduction: number;
  total_salary: number;
  status: "pending" | "paid" | string; // tergantung enum/status yang kamu gunakan
  created_at?: string;
  updated_at?: string;

  // Relasi opsional
  employee?: EmployeeType;
  salary?: Salary;

  // Accessor (computed dari backend, jika dikirim lewat resource)
  calculated_total?: number;
}
