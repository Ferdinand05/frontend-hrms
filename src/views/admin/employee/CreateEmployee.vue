<script lang="ts" setup>
import DashboardLayout from "@/views/layouts/DashboardLayout.vue";

const breadcrumbs = [
  {
    name: "Employee",
    href: "/admin/employees",
  },
  {
    name: "Create Employee",
    href: "/admin/employees/create",
  },
];
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Create Employee"
    subheading="Add a new employee to the system"
  >
    <section clas="w-full">
      <header class="mb-4 flex w-full items-center justify-between"></header>

      <main></main>
    </section>
  </DashboardLayout>
</template>
