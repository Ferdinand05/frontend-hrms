import AttendanceUser from "@/views/user/AttendanceUser.vue";
import LeaveUser from "@/views/user/LeaveUser.vue";
import PayrollUser from "@/views/user/PayrollUser.vue";
import ProfileUser from "@/views/user/ProfileUser.vue";
import type { RouteRecordRaw } from "vue-router";

export const userRoutes: RouteRecordRaw = {
  path: "/user",
  children: [
    {
      path: "profile",
      name: "user-profile",
      component: ProfileUser,
      meta: { title: "User Profile" },
    },
    { path: "leaves", name: "user-leaves", component: LeaveUser, meta: { title: "User Leaves" } },
    {
      path: "attendance",
      name: "user-attendance",
      component: AttendanceUser,
      meta: { title: "User Attendance" },
    },
    {
      path: "payroll",
      name: "user-payroll",
      component: PayrollUser,
      meta: { title: "User Payroll" },
    },
  ],
};
