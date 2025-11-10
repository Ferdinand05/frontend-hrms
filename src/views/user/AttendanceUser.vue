<script lang="ts" setup>
import Input from "@/components/ui/input/Input.vue";
import UserDashboard from "../UserDashboard.vue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PrinterIcon } from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";
import { useAuthStore } from "@/stores/auth";
import { onMounted, ref, watch } from "vue";
import type { Attendance } from "@/types";
import axios from "axios";
import Badge from "@/components/ui/badge/Badge.vue";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const authStore = useAuthStore();
const attendance = ref<Attendance[]>([]);
const loading = ref(false);
const month = ref(new Date().toISOString().slice(0, 7)); // YYYY-MM format
function getAttendance() {
  loading.value = true;
  axios
    .get(`${authStore.apiUrl}/user/profile/attendance`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      params: {
        month: month.value,
      },
    })
    .then((response) => {
      console.log("Attendance data fetched successfully:", attendance.value);
      attendance.value = response.data.attendance;
    })
    .catch((error) => {
      console.error("Error fetching attendance data:", error);
    })
    .finally(() => {
      loading.value = false;
    });
}

onMounted(() => {
  getAttendance();
});

watch(month, () => {
  getAttendance();
});
const imageUrl = "http://localhost:8000/storage/";

function printAttendance() {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header
  doc.setFontSize(14);
  doc.text("Employee Attendance Report", 105, 15, { align: "center" });
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

  // 1️⃣ Generate table first (without image column)
  autoTable(doc, {
    startY: 30,
    head: [["#", "Status", "Date", "Clock In", "Clock Out", "Image"]],
    body: attendance.value.map((item, index) => [
      index + 1,
      item.status,
      item.date,
      item.clock_in,
      item.clock_out,
      "",
    ]),
    theme: "striped",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
    },
    styles: {
      cellPadding: 2,
      valign: "middle",
    },
    didDrawCell: (data) => {
      // ✅ Jalankan hanya di body section
      if (data.section === "body" && data.column.index === 5) {
        const item = attendance.value[data.row.index];
        if (item.image_path) {
          const linkTextWidth = doc.getTextWidth("View Image");
          const x = data.cell.x + (data.cell.width - linkTextWidth) / 2;
          const y = data.cell.y + data.cell.height / 2 + 2;

          doc.setTextColor(0, 0, 255); // biru
          doc.textWithLink("View Image", x, y, {
            url: imageUrl + item.image_path,
          });
          doc.setTextColor(0, 0, 0); // reset ke hitam
        }
      }
    },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.text(`Generated at: ${new Date().toLocaleString()}`, 10, pageHeight - 10);
  doc.text("HRM System - Confidential", 200, pageHeight - 10, { align: "right" });

  // Simpan PDF
  doc.save(`attendance-report-${month.value}.pdf`);
}
</script>

<template>
  <UserDashboard>
    <!-- heading -->
    <div>
      <h1 class="font-semibold">Attendance</h1>
      <p class="font-light text-sm">Check and review your attendance history</p>
    </div>

    <div class="flex justify-between items-center gap-x-3 mt-5 mb-2">
      <div>
        <Input type="month" v-model="month" />
      </div>
      <Button variant="outline" @click="printAttendance">
        <PrinterIcon class="" />
      </Button>
    </div>

    <!-- body -->
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead> Status </TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Check in </TableHead>
            <TableHead> Check out</TableHead>
            <TableHead> Image</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody v-if="attendance.length">
          <TableRow v-for="(item, index) in attendance" :key="index">
            <TableCell class="capitalize">
              <Badge :variant="item.status == 'present' ? 'default' : 'destructive'">
                {{ item.status }}
              </Badge>
            </TableCell>
            <TableCell>{{ item.date }}</TableCell>
            <TableCell>{{ item.clock_in }}</TableCell>
            <TableCell>{{ item.clock_out }}</TableCell>
            <TableCell>
              <img
                class="h-14 w-14 object-cover rounded"
                :src="imageUrl + item.image_path"
                alt="Attendance Image"
              />
            </TableCell>
          </TableRow>
        </TableBody>
        <TableBody v-else>
          <TableRow>
            <TableCell colspan="5" class="text-center"> No attendance records found. </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </UserDashboard>
</template>
