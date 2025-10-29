<script lang="ts" setup>
import type { breadcrumbItem } from "@/types/breadcrumb";
import DashboardLayout from "@/views/layouts/DashboardLayout.vue";

const breadcrumbs: breadcrumbItem[] = [
  {
    name: "Logs",
    href: "/admin/logs",
  },
];
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Logs"
    subheading="Logs view, to see and control what system doing."
  >
    <section></section>
  </DashboardLayout>
</template>
