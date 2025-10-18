<script lang="ts" setup>
import type { breadcrumbItem } from "@/types/breadcrumb";
import DashboardLayout from "@/views/layouts/DashboardLayout.vue";

const breadcrumbs: breadcrumbItem[] = [
  {
    name: "Employee Salary",
    href: "/admin/salaries",
  },
];
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Salaries Management"
    subheading="Manage all employee salary here"
  >
  </DashboardLayout>
</template>
