<script lang="ts" setup>
import Table from "@/components/ui/table/Table.vue";
import UserDashboard from "../UserDashboard.vue";
import TableHeader from "@/components/ui/table/TableHeader.vue";
import TableRow from "@/components/ui/table/TableRow.vue";
import TableHead from "@/components/ui/table/TableHead.vue";
import TableBody from "@/components/ui/table/TableBody.vue";
import TableCell from "@/components/ui/table/TableCell.vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { onMounted, ref, watch } from "vue";
import type { Leave } from "@/types/leave";
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import { PrinterIcon } from "lucide-vue-next";
import Input from "@/components/ui/input/Input.vue";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const authStore = useAuthStore();
const leave = ref<Leave[]>([]);
const loading = ref(false);

const month = ref(new Date().toISOString().slice(0, 7)); // YYYY-MM format
function getLeave() {
  loading.value = true;
  axios
    .get(`${authStore.apiUrl}/user/profile/leave`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      params: {
        month: month.value,
      },
    })
    .then((response) => {
      leave.value = response.data.leave;
    })
    .catch((error) => {
      console.error("Error fetching leave data:", error);
    })
    .finally(() => {
      loading.value = false;
    });
}

onMounted(() => {
  getLeave();
});

watch(month, () => {
  getLeave();
});

function printLeave() {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header
  doc.setFontSize(14);
  doc.text("Employee Leave Report", 105, 15, { align: "center" });
  doc.setFontSize(10);
  doc.text(
    `Month: ${new Date(month.value).toLocaleString("default", {
      month: "long",
      year: "numeric",
    })}`,
    105,
    22,
    { align: "center" }
  );

  // Table
  autoTable(doc, {
    startY: 30,
    head: [["#", "Status", "Leave Type", "Reason", "Start", "End", "Approver"]],
    body: leave.value.map((item, index) => [
      index + 1,
      item.status,
      item.leave_type,
      item.reason,
      item.start_date,
      item.end_date,
      item.approver?.name ?? "-",
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

  // Save
  doc.save(`leave-report-${month.value}.pdf`);
}
</script>

<template>
  <UserDashboard>
    <!-- heading -->
    <div>
      <h1 class="font-semibold">Leave</h1>
      <p class="font-light text-sm">Check and view your leave history</p>
    </div>

    <!-- loading data -->

    <!-- body -->
    <div class="mt-5">
      <div class="my-2 flex justify-between items-center gap-x-3">
        <div>
          <Input type="month" v-model="month" />
        </div>
        <Button @click="printLeave" variant="outline">
          <PrinterIcon class="" />
        </Button>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead> Status </TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Approver</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody v-if="leave.length">
            <TableRow v-for="(item, index) in leave" :key="index">
              <TableCell>
                <Badge
                  class="capitalize"
                  :variant="
                    item.status == 'approved'
                      ? 'default'
                      : item.status == 'rejected'
                      ? 'destructive'
                      : 'secondary'
                  "
                  >{{ item.status }}</Badge
                >
              </TableCell>
              <TableCell> {{ item.leave_type }} </TableCell>
              <TableCell> {{ item.reason }} </TableCell>
              <TableCell> {{ item.start_date }} </TableCell>
              <TableCell> {{ item.end_date }} </TableCell>
              <TableCell> {{ item.approver?.name ?? "-" }} </TableCell>
            </TableRow>
          </TableBody>
          <TableBody v-else>
            <TableRow>
              <TableCell colspan="6" class="text-center">
                No leave records found for the selected month.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </UserDashboard>
</template>
