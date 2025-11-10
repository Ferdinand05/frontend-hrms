<script lang="ts" setup>
import type { breadcrumbItem } from "@/types/breadcrumb";
import DashboardLayout from "@/views/layouts/DashboardLayout.vue";
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Table from "@/components/ui/table/Table.vue";
import TableBody from "@/components/ui/table/TableBody.vue";
import TableCell from "@/components/ui/table/TableCell.vue";
import TableHead from "@/components/ui/table/TableHead.vue";
import TableHeader from "@/components/ui/table/TableHeader.vue";
import TableRow from "@/components/ui/table/TableRow.vue";
import {
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnFiltersState,
  type ExpandedState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/vue-table";
import type { Attendance } from "@/types";
import { h, onMounted, ref } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { ChevronDown, ChevronsUpDown, Edit, Eye, Printer } from "lucide-vue-next";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import { valueUpdater } from "@/components/ui/table/utils";
import { cn } from "@/lib/utils";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuCheckboxItem from "@/components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue";
import ModalDialog from "@/components/home/ModalDialog.vue";
import Label from "@/components/ui/label/Label.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectGroup from "@/components/ui/select/SelectGroup.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import Swal from "sweetalert2";
import DatePicker from "@/components/attendance/DatePicker.vue";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const breadcrumbs: breadcrumbItem[] = [
  {
    name: "Attendance",
    href: "/admin/attendances",
  },
];
const authStore = useAuthStore();
// attendances data
const attendances = ref<Attendance[]>([]);
function getAttendances() {
  axios
    .get(`${authStore.apiUrl}/attendances`, {
      headers: {
        Authorization: `Bearer ${authStore.getToken}`,
      },
    })
    .then((response) => {
      attendances.value = response.data.attendances;
    })
    .catch((error) => {
      console.log(error);
    });
}
onMounted(() => {
  getAttendances();
});

const imageUrl = "http://localhost:8000/storage/";
const columnHelper = createColumnHelper<Attendance>();
const columns = [
  columnHelper.display({
    id: "select",
    header: ({ table }) =>
      h(Checkbox, {
        modelValue:
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate"),
        "onUpdate:modelValue": (value) => table.toggleAllPageRowsSelected(!!value),
        ariaLabel: "Select all",
      }),
    cell: ({ row }) => {
      return h(Checkbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value) => row.toggleSelected(!!value),
        ariaLabel: "Select row",
      });
    },
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("status", {
    enablePinning: true,
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Status", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) =>
      h(
        Badge,
        {
          class: "capitalize",
          variant: row.original.status == "present" ? "default" : "destructive",
        },
        row.getValue("status")
      ),
  }),
  columnHelper.accessor("employee.full_name", {
    id: "employee.full_name",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Employee", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => {
      return h("div", { class: "capitalize" }, row.original.employee.full_name);
    },
  }),
  columnHelper.accessor("date", {
    id: "date",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Date", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", row.getValue("date")),
  }),
  columnHelper.accessor("clock_in", {
    id: "clock_in",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Check In", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", row.getValue("clock_in")),
  }),
  columnHelper.accessor("clock_out", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Check Out", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => {
      return h("div", row.getValue("clock_out") ?? "None");
    },
  }),
  columnHelper.accessor("latitude", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          class: "capitalize",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Coords", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", row.original.latitude + "," + row.original.longitude),
  }),
  columnHelper.accessor("accuracy", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          class: "capitalize",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["accuracy", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", row.getValue("accuracy")),
  }),
  columnHelper.display({
    id: "actions",
    header: () => "Actions",
    cell: ({ row }) => {
      return h("div", { class: "flex gap-2" }, [
        h(Button, { size: "sm", asChild: true, title: "Detail Employee" }, () =>
          h(
            Button,
            { size: "sm", onClick: () => openAndFillModal(row.original) },
            h(Eye, { class: "h-4 w-4" })
          )
        ),
        h(Button, { variant: "outline", size: "sm", asChild: true, title: "Edit Employee" }, () =>
          h(
            Button,
            { size: "sm", variant: "outline", onClick: () => openAndFillModalEdit(row.original) },
            h(Edit, { class: "h-4 w-4" })
          )
        ),
      ]);
    },
    enableSorting: false,
    enableHiding: false,
  }),
];

//  Modal detail
const openModalDetail = ref<boolean>(false);
const dataModalAttendance = ref<Attendance | null>(null);
function openAndFillModal(attendance: Attendance) {
  dataModalAttendance.value = attendance;
  openModalDetail.value = true;
}

//TODO setup edit attendance
const openModalEdit = ref<boolean>(false);
const editDate = ref("");
const editClockIn = ref("");
const editClockOut = ref<string>("");
const editStatus = ref<"late" | "present" | string>("");
const attendance_id = ref<number>();
function openAndFillModalEdit(attendance: Attendance) {
  editDate.value = attendance.date;
  editClockIn.value = attendance.clock_in;
  editClockOut.value = attendance.clock_out ?? "";
  editStatus.value = attendance.status;
  attendance_id.value = attendance.id;
  openModalEdit.value = true;
}

//TODO update attendance
function updateAttendance() {
  axios
    .put(
      `${authStore.apiUrl}/attendances/${attendance_id.value}`,
      {
        date: editDate.value,
        clock_in: editClockIn.value,
        clock_out: editClockOut.value,
        status: editStatus.value,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.getToken}`,
        },
      }
    )
    .then((response) => {
      console.log(response.data);

      if ((response.status = 200)) {
        Swal.fire({
          title: "Attendance updated!",
          text: `${response.data.message}`,
          icon: "success",
        });

        getAttendances();
      }
    })
    .catch((error) => {
      console.log(error);

      Swal.fire({
        title: "Update failed!",
        text: `Error occured`,
        icon: "error",
      });
    });

  openModalEdit.value = false;
}

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});
const expanded = ref<ExpandedState>({});

// const selectedData = computed(() => {
//   return Object.entries(rowSelection.value).map(function (id) {
//     const data = table.getRow(id[0]);
//     return data.original.id;
//   });
// });

const table = useVueTable({
  data: attendances,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: (updaterOrValue) => valueUpdater(updaterOrValue, rowSelection),
  onExpandedChange: (updaterOrValue) => valueUpdater(updaterOrValue, expanded),
  enableRowSelection: true,
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
    get expanded() {
      return expanded.value;
    },
    columnPinning: {
      left: ["status"],
    },
  },
});

const buttonFilter = ref<boolean>(false);
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterByDate(range: { start: any; end: any }) {
  const start = range.start !== undefined ? range.start.toString() : null;
  const end = range.end !== undefined ? range.end.toString() : null;
  console.log(`Filter dari : ${range.start} sampai ${range.end}`);
  buttonFilter.value = true;
  axios
    .get(`${authStore.apiUrl}/attendances`, {
      headers: {
        Authorization: `Bearer ${authStore.getToken}`,
      },
      params: {
        start_date: start,
        end_date: end,
      },
    })
    .then((response) => {
      console.log(response.data);
      attendances.value = response.data.attendances;
      startDate.value = start;
      endDate.value = end;
    })
    .catch((error) => {
      console.log(error);
      buttonFilter.value = false;
    })
    .finally(() => {
      buttonFilter.value = false;
    });
}

function printAttendances() {
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
    `Date Range: ${
      startDate.value && endDate.value
        ? `${new Date(startDate.value).toLocaleDateString()} - ${new Date(
            endDate.value
          ).toLocaleDateString()}`
        : "All Dates"
    }`,
    105,
    22,
    { align: "center" }
  );

  // 1️⃣ Generate table first (without image column)
  autoTable(doc, {
    startY: 30,
    head: [
      [
        "#",
        "Status",
        "Employee Name",
        "Date",
        "Check In",
        "Check Out",
        "Coords",
        "Accuracy",
        "Image",
      ],
    ],
    body: attendances.value.map((item, index) => [
      index + 1,
      item.status,
      item.employee.full_name,
      item.date,
      item.clock_in,
      item.clock_out,
      item.latitude + "," + item.longitude,
      item.accuracy,
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
      if (data.section === "body" && data.column.index === 8) {
        const item = attendances.value[data.row.index];
        // jika item undefined atau tidak punya image_path, keluar lebih awal
        if (!item || !item.image_path) return;

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

  if (startDate.value && endDate.value) {
    doc.save(`attendances-report-${startDate.value}-${endDate.value}.pdf`);
  } else {
    doc.save(`attendances-report.pdf`);
  }
}
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Attendance Management"
    subheading="Manage all attendance records"
  >
    <main class="w-full">
      <!-- date filter -->
      <div class="flex justify-end">
        <DatePicker :buttonStatus="buttonFilter" @updateDate="filterByDate"></DatePicker>
      </div>
      <div class="flex flex-col-reverse md:flex-row gap-2 items-center py-4">
        <div class="w-full">
          <Input
            class="w-full md:w-64 lg:w-96"
            placeholder="Search by employee name..."
            :model-value="table.getColumn('employee.full_name')?.getFilterValue() as string"
            @update:model-value="table.getColumn('employee.full_name')?.setFilterValue($event)"
          />
        </div>

        <div class="flex gap-x-2 justify-end w-full">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" class="ml-auto">
                Columns <ChevronDown class="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                v-for="column in table.getAllColumns().filter((column) => column.getCanHide())"
                :key="column.id"
                class="capitalize"
                :model-value="column.getIsVisible()"
                @update:model-value="
                  (value: boolean) => {
                    column.toggleVisibility(!!value);
                  }
                "
              >
                {{ column.id }}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button @click.prevent="printAttendances" :disabled="attendances.length === 0"
            >Exports <Printer
          /></Button>
        </div>
      </div>
      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
              <TableHead
                v-for="header in headerGroup.headers"
                :key="header.id"
                :data-pinned="header.column.getIsPinned()"
                :class="
                  cn(
                    { 'sticky bg-background/95': header.column.getIsPinned() },
                    header.column.getIsPinned() === 'left' ? 'left-0' : 'right-0'
                  )
                "
              >
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="table.getRowModel().rows?.length">
              <template v-for="row in table.getRowModel().rows" :key="row.id">
                <TableRow :data-state="row.getIsSelected() && 'selected'">
                  <TableCell
                    v-for="cell in row.getVisibleCells()"
                    :key="cell.id"
                    :data-pinned="cell.column.getIsPinned()"
                    :class="
                      cn(
                        { 'sticky bg-background/95': cell.column.getIsPinned() },
                        cell.column.getIsPinned() === 'left' ? 'left-0' : 'right-0'
                      )
                    "
                  >
                    <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                  </TableCell>
                </TableRow>
                <TableRow v-if="row.getIsExpanded()">
                  <TableCell :colspan="row.getAllCells().length">
                    {{ JSON.stringify(row.original) }}
                  </TableCell>
                </TableRow>
              </template>
            </template>

            <TableRow v-else>
              <TableCell :colspan="columns.length" class="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div class="flex items-center justify-end space-x-2 py-4">
        <div class="flex-1 text-sm text-muted-foreground">
          {{ table.getFilteredSelectedRowModel().rows.length }} of
          {{ table.getFilteredRowModel().rows.length }} row(s) selected.
        </div>
        <div class="space-x-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="!table.getCanPreviousPage()"
            @click="table.previousPage()"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="!table.getCanNextPage()"
            @click="table.nextPage()"
          >
            Next
          </Button>
        </div>
      </div>
    </main>

    <!-- modal detail attendance -->
    <ModalDialog v-model:open="openModalDetail" title="Detail Employee Attendance">
      <section class="p-4">
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start bg-white rounded-xl shadow-sm"
        >
          <!-- FOTO -->
          <div class="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-gray-50">
            <img
              class="object-cover object-center w-full h-64 md:h-full"
              :src="imageUrl + dataModalAttendance?.image_path"
              :alt="dataModalAttendance?.employee.full_name"
            />
          </div>

          <!-- DETAIL -->
          <div class="flex flex-col justify-between h-full">
            <div>
              <!-- Nama & Info Karyawan -->
              <div class="mb-3">
                <h1 class="capitalize text-xl font-semibold tracking-wide text-gray-800">
                  {{ dataModalAttendance?.employee.full_name }}
                </h1>
                <p class="capitalize text-sm text-gray-600">
                  {{ dataModalAttendance?.employee.department?.name }} •
                  {{ dataModalAttendance?.employee.position }}
                </p>
              </div>

              <hr class="my-3 border-gray-300" />

              <!-- Info Kehadiran -->
              <div class="space-y-2 text-sm text-gray-700">
                <div class="flex justify-between">
                  <span class="font-medium text-gray-600">Date</span>
                  <span>{{ dataModalAttendance?.date }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="font-medium text-gray-600">Check In</span>
                  <span>{{ dataModalAttendance?.clock_in }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="font-medium text-gray-600">Check Out</span>
                  <span>{{ dataModalAttendance?.clock_out ?? "—" }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="font-medium text-gray-600">Map Location</span>
                  <a
                    target="_blank"
                    :href="`https://www.google.com/maps?q=${dataModalAttendance?.latitude},${dataModalAttendance?.longitude}`"
                    class="text-blue-500 hover:underline"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <template #footer>
        <div class="flex justify-end mt-4">
          <Button
            size="sm"
            variant="secondary"
            class="bg-gray-200 hover:bg-gray-300 text-gray-700"
            @click="openModalDetail = false"
          >
            Close
          </Button>
        </div>
      </template>
    </ModalDialog>

    <!-- modal Edit attendance -->
    <ModalDialog v-model:open="openModalEdit" title="Edit Data Attendance">
      <!-- form edit -->
      <section class="p-4">
        <form class="space-y-3">
          <div class="space-y-2">
            <Label>Date</Label>
            <Input type="date" v-model="editDate" />
          </div>
          <div class="space-y-2">
            <Label>Check In</Label>
            <Input type="datetime" v-model="editClockIn" />
          </div>
          <div class="space-y-2">
            <Label>Check Out</Label>
            <Input type="datetime" v-model="editClockOut" />
          </div>
          <div class="space-y-2">
            <Label>Check Out</Label>
            <Select v-model="editStatus">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="present"> Present </SelectItem>
                  <SelectItem value="late"> Late </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </form>
      </section>

      <template #footer>
        <div class="flex justify-end gap-x-2">
          <Button size="sm" @click.prevent="updateAttendance">Save</Button>
          <Button
            size="sm"
            variant="secondary"
            class="bg-gray-200 hover:bg-gray-300 text-gray-700"
            @click="openModalEdit = false"
          >
            Close
          </Button>
        </div>
      </template>
    </ModalDialog>
  </DashboardLayout>
</template>
