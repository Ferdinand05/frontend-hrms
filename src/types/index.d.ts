import type { EmployeeType } from "./user";

export type RoleType = {
  id: number;
  role_name: string;
  created_at: string;
  count: number;
};

export type Department = {
  id: number;
  name: string;
  description: string;
  count: number;
  created_at: string;
};

export type Office = {
  id: number;
  app_name: string;
  latitude: string;
  longitude: string;
  radius: number;
  max_accuracy: number;
  start_time: string;
  end_time: string;
};

export type Attendance = {
  id: number;
  employee_id: number;
  employee: EmployeeType;
  date: string;
  clock_in: string;
  clock_out: string | null;
  image_path: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  status: string;
  created_at: string;
};

type MenuItem = {
  name: string;
  color: string;
  icon: unknown;
  function?: () => void;
  disabled?: boolean;
};
