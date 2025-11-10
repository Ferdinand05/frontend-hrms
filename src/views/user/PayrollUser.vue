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
import { Printer, PrinterIcon } from "lucide-vue-next";
import Input from "@/components/ui/input/Input.vue";
import axios from "axios";
import { onMounted, ref, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import type { Payroll } from "@/types/payroll";
import Badge from "@/components/ui/badge/Badge.vue";
import { formatToIDR } from "@/services/salaryService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Label from "@/components/ui/label/Label.vue";
import { printDetailPayroll } from "@/services/payrollService";

const authStore = useAuthStore();
const payroll = ref<Payroll[]>([]);

const year = ref(new Date().getFullYear()); // Current year
function getPayroll() {
  axios
    .get(`${authStore.apiUrl}/user/profile/payroll`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      params: {
        year: year.value,
      },
    })
    .then((response) => {
      payroll.value = response.data.payroll;
      console.log("Payroll data:", payroll.value);
    })
    .catch((error) => {
      console.error("Error fetching payroll data:", error);
    });
}

onMounted(() => {
  getPayroll();
});

watch(year, () => {
  getPayroll();
});

function printPayrolls() {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header
  doc.setFontSize(14);
  doc.text("Employee Payroll Report", 105, 15, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Year: ${year.value}`, 105, 22, { align: "center" });

  // Table
  autoTable(doc, {
    startY: 30,
    head: [
      [
        "#",
        "Status",
        "Base Salary",
        "Allowance",
        "Deduction",
        "Overtime Hours",
        "Overtime Rate",
        "Overtime Pay",
        "Total Salary",
      ],
    ],
    body: payroll.value.map((item, index) => [
      index + 1,
      item.status,
      formatToIDR(item.salary?.base_salary as number),
      formatToIDR(item.salary?.allowance as number),
      formatToIDR(item.salary?.deduction as number),
      item.overtime_hours + " hour(s)",
      formatToIDR(item.salary?.overtime_rate as number),
      formatToIDR(item.overtime_pay as number),
      formatToIDR(item.total_salary as number),
    ]),
    theme: "striped",
    headStyles: {
      fillColor: [41, 128, 185], // biru muda
      textColor: [255, 255, 255],
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [33, 33, 33],
    },
    styles: {
      cellPadding: 2,
      lineWidth: 0.1,
      valign: "middle",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.text(`Generated at: ${new Date().toLocaleString()}`, 10, pageHeight - 10);
  doc.text("HRM System - Confidential", 200, pageHeight - 10, { align: "right" });

  doc.save(`payroll_${year.value}.pdf`);
}
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
      <div class="flex justify-between items-center gap-x-3">
        <div class="space-y-2">
          <Label>Year</Label>
          <Input type="number" min="2000" max="2099" step="1" v-model="year" />
        </div>
        <Button variant="outline" @click="printPayrolls">
          <PrinterIcon class="" />
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead> Status </TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Base Salary</TableHead>
            <TableHead>Allowance</TableHead>
            <TableHead>Deduction</TableHead>
            <TableHead>Overtime Hours</TableHead>
            <TableHead>Overtime Pay</TableHead>
            <TableHead>Total Salary</TableHead>
            <TableHead> Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody v-if="payroll.length">
          <TableRow v-for="item in payroll" :key="item.id">
            <TableCell>
              <Badge
                class="capitalize"
                :variant="item.status == 'paid' ? 'default' : 'secondary'"
                >{{ item.status }}</Badge
              >
            </TableCell>
            <TableCell> {{ item.period }} </TableCell>
            <TableCell> {{ formatToIDR(item.salary?.base_salary as number) }} </TableCell>
            <TableCell>{{ formatToIDR(item.salary?.allowance as number) }}</TableCell>
            <TableCell>{{ formatToIDR(item.salary?.deduction as number) }}</TableCell>
            <TableCell>{{ item.overtime_hours }} hour(s)</TableCell>
            <TableCell>{{ formatToIDR(item.overtime_pay as number) }}</TableCell>
            <TableCell>{{ formatToIDR(item.total_salary as number) }}</TableCell>
            <TableCell>
              <Button v-if="item.status == 'paid'" @click="printDetailPayroll(item)" size="sm"
                ><Printer />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
        <TableBody v-else>
          <TableRow>
            <TableCell colspan="8" class="text-center"> No payroll data available. </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </UserDashboard>
</template>
