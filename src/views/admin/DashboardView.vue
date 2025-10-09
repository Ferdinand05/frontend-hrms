<script lang="ts" setup>
import type { breadcrumbItem } from "@/types/breadcrumb";
import DashboardLayout from "../layouts/DashboardLayout.vue";
import { CalendarCheck, CalendarX2, SquareUser, Users } from "lucide-vue-next";

const breadcrumbItem: breadcrumbItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
  },
];
</script>

<template>
  <DashboardLayout :breadcrumbs="breadcrumbItem" heading="Dashboard" subheading="Overview">
    <section>
      <!-- First Tier - Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-gray-500 text-sm">Total Employees</h3>
            <div>
              <SquareUser class="text-gray-600" />
            </div>
          </div>
          <p class="text-2xl font-semibold">1,234</p>
          <div class="text-green-500 text-sm">+12% is active</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-gray-500 text-sm">Total Users</h3>
            <div>
              <Users class="text-gray-600" />
            </div>
          </div>
          <p class="text-2xl font-semibold">42</p>
          <div class="text-blue-500 text-sm">Current users</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-gray-500 text-sm">Total Attendance</h3>
            <div>
              <CalendarCheck class="text-gray-600" />
            </div>
          </div>
          <p class="text-2xl font-semibold">98%</p>
          <div class="text-green-500 text-sm">+2% from last week</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-gray-500 text-sm">Leaves</h3>
            <div>
              <CalendarX2 class="text-gray-600" />
            </div>
          </div>
          <p class="text-2xl font-semibold">87</p>
          <div class="text-yellow-500 text-sm">This month</div>
        </div>
      </div>
      <!-- Second Tier - Charts/Tables Container -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">Chart Section 1</h3>
          <!-- Add your chart component here -->
          <div class="h-64">Chart placeholder</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">Table Section</h3>
          <!-- Add your table component here -->
          <div class="h-64">Table placeholder</div>
        </div>
      </div>
    </section>
  </DashboardLayout>
</template>
