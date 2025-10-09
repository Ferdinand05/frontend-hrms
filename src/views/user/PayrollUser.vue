<script lang="ts" setup>
import Button from "@/components/ui/button/Button.vue";
import UserDashboard from "../UserDashboard.vue";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer } from "lucide-vue-next";
</script>

<template>
  <UserDashboard>
    <!-- heading -->
    <div>
      <h1 class="font-semibold">Payroll</h1>
      <p class="font-light text-sm">Check and review payroll history</p>
    </div>

    <!-- body -->
    <div class="mt-5">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead> Status </TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Allowance</TableHead>
            <TableHead>Deduction</TableHead>
            <TableHead>Overtime Hours</TableHead>
            <TableHead>Overtime Pay</TableHead>
            <TableHead>Total Salary</TableHead>
            <TableHead> Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell> Paid </TableCell>
            <TableCell> 09-08 </TableCell>
            <TableCell>123</TableCell>
            <TableCell>1000</TableCell>
            <TableCell>1000</TableCell>
            <TableCell>1000</TableCell>
            <TableCell>1000</TableCell>
            <TableCell>
              <Button size="sm"><Printer /> </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </UserDashboard>
</template>
