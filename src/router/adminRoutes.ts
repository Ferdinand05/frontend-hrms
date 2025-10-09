import AttendanceView from "@/views/admin/attendance/AttendanceView.vue";
import DashboardView from "@/views/admin/DashboardView.vue";
import DepartmentView from "@/views/admin/department/DepartmentView.vue";
import CreateEmployee from "@/views/admin/employee/CreateEmployee.vue";
import EmployeeView from "@/views/admin/employee/EmployeeView.vue";
import LeaveView from "@/views/admin/leave/LeaveView.vue";
import RoleView from "@/views/admin/role/RoleView.vue";
import CreateUser from "@/views/admin/user/CreateUser.vue";
import UserView from "@/views/admin/user/UserView.vue";
import type { RouteRecordRaw } from "vue-router";

export const adminRoutes: RouteRecordRaw = {
  // parent route for admin section
  path: "/admin",
  meta: {
    title: "Admin",
    portal: "admin", // only admin can access this route
  },
  children: [
    {
      path: "dashboard",
      name: "dashboard",
      component: DashboardView,
      meta: { title: "Dashboard", portal: "admin" },
    },
    // admin user management routes
    {
      path: "users",
      meta: { title: "User Management", portal: "admin" },
      children: [
        {
          path: "",
          name: "users-list",
          component: UserView,
          meta: { title: "User List", portal: "admin" },
        },
        {
          path: "create",
          name: "create-user",
          component: CreateUser,
          meta: { title: "Create User", portal: "admin" },
        },
      ],
    },
    // admin role management route
    {
      path: "roles",
      name: "roles",
      component: RoleView,
      meta: { title: "Role Management", portal: "admin" },
    },
    {
      path: "departments",
      name: "departments",
      component: DepartmentView,
      meta: { title: "Department Management", portal: "admin" },
    },
    {
      path: "employees",
      children: [
        {
          path: "",
          name: "employees-list",
          component: EmployeeView,
          meta: { title: "Employee List", portal: "admin" },
        },
        {
          path: "create",
          name: "create-employee",
          component: CreateEmployee,
          meta: { title: "Create Employee", portal: "admin" },
        },
      ],
    },
    {
      path: "attendances",
      name: "attendances",
      component: AttendanceView,
      meta: { title: "Attendance Management", portal: "admin" },
    },
    {
      path: "leaves",
      name: "leaves",
      component: LeaveView,
      meta: { title: "Leave Management", portal: "admin" },
    },

    {
      path: "payrolls",
      name: "payrolls",
      component: () => import("@/views/admin/payroll/PayrollView.vue"),
      meta: { title: "Payroll Management", portal: "admin" },
    },
  ],
};
