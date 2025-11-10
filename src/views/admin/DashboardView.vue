<script lang="ts" setup>
import type { breadcrumbItem } from "@/types/breadcrumb";
import DashboardLayout from "../layouts/DashboardLayout.vue";
import { CalendarCheck, CalendarX2, SquareUser, Users } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import { watch } from "vue";
import AreaChart from "@/components/ui/chart-area/AreaChart.vue";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Leave } from "@/types/leave";
import Badge from "@/components/ui/badge/Badge.vue";

const breadcrumbItem: breadcrumbItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
  },
];
const authStore = useAuthStore();

interface LeaveChartData {
  name: string; // Nama bulan, misal "Jan"
  total: number; // Total semua leave per bulan
  rejected: number; // Total leave dengan status rejected
}

const data = ref<{
  totalEmployee: number;
  totalEmployeeActive: number;
  totalLeave: number;
  totalLeaveThisMonth: number;
  totalLeavePending: number;
  totalThisMonthAttendance: number;
  totalAttendanceLateThisMonth: number;
  totalUsers: number;
  latestPendingLeaves: Leave[];
  dataChart: LeaveChartData[];
}>();

const month = ref<string>("");
function getDashboardData() {
  axios
    .get(`${authStore.apiUrl}/dashboard?month=${month.value}`, {
      headers: {
        Authorization: `Bearer ${authStore.getToken}`,
      },
    })
    .then((response) => {
      console.log(response.data);
      data.value = response.data.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

onMounted(() => {
  getDashboardData();
});

watch(month, () => {
  getDashboardData();
});
</script>

<template>
  <DashboardLayout :breadcrumbs="breadcrumbItem" heading="Dashboard" subheading="Overview">
    <section>
      <!-- First Tier - Info Cards -->
      <!-- Filter month -->
      <div class="my-3 flex justify-end">
        <div class="space-y-2">
          <Label>Month</Label>
          <Input type="month" v-model="month" />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-gray-500 text-sm">Total Employees</h3>
            <div>
              <SquareUser class="text-gray-600" />
            </div>
          </div>
          <p class="text-2xl font-semibold">{{ data?.totalEmployee ?? "-" }}</p>
          <div class="text-green-500 text-sm">{{ data?.totalEmployeeActive }} is active</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-gray-500 text-sm">Total Users</h3>
            <div>
              <Users class="text-gray-600" />
            </div>
          </div>
          <p class="text-2xl font-semibold">{{ data?.totalUsers }}</p>
          <div class="text-blue-500 text-sm">Current users</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-gray-500 text-sm">Total Attendance</h3>
            <div>
              <CalendarCheck class="text-gray-600" />
            </div>
          </div>
          <p class="text-2xl font-semibold">{{ data?.totalThisMonthAttendance }}</p>
          <div class="text-green-500 text-sm">
            {{ data?.totalAttendanceLateThisMonth }} Employee Late
          </div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-gray-500 text-sm">Leaves</h3>
            <div>
              <CalendarX2 class="text-gray-600" />
            </div>
          </div>
          <p class="text-2xl font-semibold">{{ data?.totalLeaveThisMonth }}</p>
          <div class="text-yellow-500 text-sm">{{ data?.totalLeavePending }} Leave is Pending</div>
        </div>
      </div>
      <!-- Second Tier - Charts/Tables Container -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-2 rounded-lg shadow">
          <h3 class="text-lg p-4 font-semibold mb-4">Leaves Monthly</h3>
          <!-- Add your chart component here -->
          <div class="w-full h-full">
            <AreaChart
              :data="data?.dataChart ?? []"
              index="name"
              :colors="['black', 'red']"
              :categories="['total', 'rejected']"
            ></AreaChart>
          </div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">Pending Leaves</h3>
          <!-- Add your table component here -->
          <Table>
            <TableCaption>A list of your recent Pending leaves.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead> Status </TableHead>
                <TableHead> Employee </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(leave, index) in data?.latestPendingLeaves" :key="index">
                <TableCell class="capitalize">
                  <Badge>{{ leave.status }}</Badge>
                </TableCell>
                <TableCell class="capitalize"> {{ leave.employee?.full_name }} </TableCell>
                <TableCell class="capitalize"> {{ leave.leave_type }} </TableCell>
                <TableCell> {{ leave.reason }} </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  </DashboardLayout>
</template>
