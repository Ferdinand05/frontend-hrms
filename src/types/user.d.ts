export type UserType = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  role_id: number;
  employee?: EmployeeType;
};

export type EmployeeType = {
  id: number;
  department?: {
    id: number;
    name: string;
    description: string;
    created_at: string;
  };
  employee_code: string;
  full_name: string;
  avatar: string;
  gender: string;
  date_of_birth: string;
  address: string;
  phone: string;
  hire_date: string;
  position: string;
  status: string;
  created_at: string;
  updated_at: string;
};
