<script lang="ts" setup>
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Table from "@/components/ui/table/Table.vue";
import TableBody from "@/components/ui/table/TableBody.vue";
import TableCell from "@/components/ui/table/TableCell.vue";
import TableHead from "@/components/ui/table/TableHead.vue";
import TableHeader from "@/components/ui/table/TableHeader.vue";
import TableRow from "@/components/ui/table/TableRow.vue";
import type { breadcrumbItem } from "@/types/breadcrumb";
import DashboardLayout from "@/views/layouts/DashboardLayout.vue";
import { Search } from "lucide-vue-next";

const breadcrumbs: breadcrumbItem[] = [
  {
    name: "Payroll",
    href: "/admin/payrolls",
  },
];
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Payroll Management"
    subheading="Manage all payroll records"
  >
    <section clas="w-full">
      <header class="mb-4 flex flex-col md:flex-row w-full gap-y-2 md:items-center justify-between">
        <div class="relative w-full max-w-sm items-center">
          <Input id="search" type="text" placeholder="Search..." class="pl-10" />
          <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
            <Search class="size-6 text-muted-foreground" />
          </span>
        </div>

        <Button class="max-w-sm"> Exports </Button>
      </header>

      <main>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[100px]"> Invoice </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead class="text-right"> Amount </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell class="font-medium"> INV001 </TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Credit Card</TableCell>
              <TableCell class="text-right"> $250.00 </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </main>
    </section>
  </DashboardLayout>
</template>
