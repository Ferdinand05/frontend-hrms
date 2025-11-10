<script lang="ts" setup>
import DatePicker from "@/components/attendance/DatePicker.vue";
import ModalDialog from "@/components/home/ModalDialog.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuCheckboxItem from "@/components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuLabel from "@/components/ui/dropdown-menu/DropdownMenuLabel.vue";
import DropdownMenuSeparator from "@/components/ui/dropdown-menu/DropdownMenuSeparator.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectGroup from "@/components/ui/select/SelectGroup.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import Table from "@/components/ui/table/Table.vue";
import TableBody from "@/components/ui/table/TableBody.vue";
import TableCell from "@/components/ui/table/TableCell.vue";
import TableHead from "@/components/ui/table/TableHead.vue";
import TableHeader from "@/components/ui/table/TableHeader.vue";
import TableRow from "@/components/ui/table/TableRow.vue";
import { valueUpdater } from "@/components/ui/table/utils";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import type { breadcrumbItem } from "@/types/breadcrumb";
import type { Leave } from "@/types/leave";
import DashboardLayout from "@/views/layouts/DashboardLayout.vue";
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
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ChevronDown, ChevronsUpDown, Edit, Printer, Trash } from "lucide-vue-next";
import Swal from "sweetalert2";
import { computed, h, onMounted, ref } from "vue";

const breadcrumbs: breadcrumbItem[] = [
  {
    name: "Leave",
    href: "/admin/leaves",
  },
];

const authStore = useAuthStore();
const leaves = ref<Leave[]>([]);
function getLeaves() {
  axios
    .get(`${authStore.apiUrl}/leaves`, {
      headers: {
        Authorization: `Bearer ${authStore.getToken}`,
      },
    })
    .then((response) => {
      leaves.value = response.data.leaves;
    })
    .catch((error) => {
      console.log(error);
    });
}

onMounted(() => {
  getLeaves();
});
const columnHelper = createColumnHelper<Leave>();
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
    id: "status",
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
    cell: ({ row }) => {
      const status = row.original.status;
      const variant =
        status == "approved" ? "default" : status == "rejected" ? "destructive" : "secondary";

      return h(Badge, { variant, class: "capitalize" }, status);
    },
  }),
  columnHelper.accessor("leave_type", {
    id: "leave_type",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Type", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) =>
      h(
        "div",
        {
          class: "capitalize font-medium",
        },
        row.getValue("leave_type")
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
    cell: ({ row }) =>
      h(
        "div",
        {
          class: "capitalize font-medium",
        },
        row.original.employee?.full_name
      ),
  }),

  columnHelper.accessor("start_date", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Start Date", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", row.getValue("start_date")),
  }),
  columnHelper.accessor("end_date", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["End Date", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", row.getValue("end_date")),
  }),
  columnHelper.accessor("reason", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Reason", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) =>
      h(
        "div",
        { class: "max-w-[200px] whitespace-normal break-words line-clamp-2" },
        row.getValue("reason")
      ),
  }),
  columnHelper.accessor("approver.name", {
    header: () => h("div", "Approver"),
    cell: ({ row }) => {
      return h("div", { class: "" }, row.original.approver?.name ?? "-");
    },
  }),
  columnHelper.accessor("created_at", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Created at", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", row.getValue("created_at")),
  }),
  columnHelper.display({
    id: "actions",
    header: () => "Actions",
    cell: ({ row }) => {
      return h("div", { class: "flex gap-2" }, [
        h(Button, { size: "sm", variant: "outline", asChild: true, title: "Detail Leave" }, () =>
          h(
            Button,
            { variant: "outline", onClick: () => openModalEdit(row.original) },
            h(Edit, { class: "h-4 w-4" })
          )
        ),
        h(
          Button,
          {
            variant: "destructive",
            size: "sm",
            title: "Delete Leave",
            onClick: () => deleteLeave(row.original.id),
          },
          () => h(Trash, { class: "h-4 w-4" })
        ),
      ]);
    },
    enableSorting: false,
    enableHiding: false,
  }),
];

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});
const expanded = ref<ExpandedState>({});

const selectedData = computed(() => {
  return Object.entries(rowSelection.value).map(function (id) {
    const data = table.getRow(id[0]);
    return data.original.id;
  });
});

const table = useVueTable({
  data: leaves,
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

//SECTION delete and update leave

const modalEdit = ref<boolean>(false);
const formErrors = ref();
const editType = ref("");
const editStartDate = ref("");
const editEndDate = ref("");
const editReason = ref("");
const id_leave = ref();
function openModalEdit(leave: Leave) {
  editType.value = leave.leave_type;
  editStartDate.value = leave.start_date;
  editEndDate.value = leave.end_date;
  editReason.value = leave.reason;
  id_leave.value = leave.id;
  // open modal
  modalEdit.value = true;
}

const isLoading = ref<boolean>(false);

function updateLeave() {
  isLoading.value = true;

  axios
    .put(
      `${authStore.apiUrl}/leaves/${id_leave.value}`,
      {
        leave_type: editType.value,
        start_date: editStartDate.value,
        end_date: editEndDate.value,
        reason: editReason.value,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.getToken}`,
        },
      }
    )
    .then((response) => {
      console.log(response.data);

      Swal.fire({
        position: "center",
        icon: "success",
        title: `${response.data.message}`,
        showConfirmButton: false,
        timer: 1500,
      });

      modalEdit.value = false;
      formErrors.value = "";
      getLeaves();
    })
    .catch((error) => {
      console.log(error);
      formErrors.value = error.response.data.errors;
    })
    .finally(() => {
      isLoading.value = false;
    });
}

function deleteLeave(id: number) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .delete(`${authStore.apiUrl}/leaves/${id}`, {
          headers: {
            Authorization: `Bearer ${authStore.getToken}`,
          },
        })
        .then((response) => {
          Swal.fire({
            position: "center",
            icon: "success",
            title: `${response.data.message}`,
            showConfirmButton: false,
            timer: 1500,
          });

          getLeaves();
        })
        .catch((error) => {
          console.log(error);

          formErrors.value = error.response.data.errors;
        });
    }
  });
}

// SECTION Bulk action

function bulkApprove() {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, approve!",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .post(
          `${authStore.apiUrl}/leaves/bulk/approve`,
          {
            selection_id: selectedData.value,
          },
          {
            headers: {
              Authorization: `Bearer ${authStore.getToken}`,
            },
          }
        )
        .then((response) => {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Success!",
            text: `${response.data.message}`,
            showConfirmButton: false,
            timer: 1500,
          });

          getLeaves();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });
}

function bulkReject() {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Reject!",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .post(
          `${authStore.apiUrl}/leaves/bulk/reject`,
          {
            selection_id: selectedData.value,
          },
          {
            headers: {
              Authorization: `Bearer ${authStore.getToken}`,
            },
          }
        )
        .then((response) => {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Success!",
            text: `${response.data.message}`,
            showConfirmButton: false,
            timer: 1500,
          });

          getLeaves();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });
}

function bulkDelete() {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .post(
          `${authStore.apiUrl}/leaves/bulk/delete`,
          {
            selection_id: selectedData.value,
          },
          {
            headers: {
              Authorization: `Bearer ${authStore.getToken}`,
            },
          }
        )
        .then((response) => {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Success!",
            text: `${response.data.message}`,
            showConfirmButton: false,
            timer: 1500,
          });

          getLeaves();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });
}

// filter date
const buttonFilter = ref<boolean>(false);
const start_date = ref<string | null>(null);
const end_date = ref<string | null>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterByDate(range: { start: any; end: any }) {
  const start = range.start !== undefined ? range.start.toString() : null;
  const end = range.end !== undefined ? range.end.toString() : null;
  console.log(`Filter dari : ${range.start} sampai ${range.end}`);
  buttonFilter.value = true;
  axios
    .get(`${authStore.apiUrl}/leaves`, {
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
      leaves.value = response.data.leaves;
      start_date.value = start;
      end_date.value = end;
    })
    .catch((error) => {
      console.log(error);
      buttonFilter.value = false;
    })
    .finally(() => {
      buttonFilter.value = false;
    });
}

function exportLeaves() {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header
  doc.setFontSize(14);
  doc.text(" Leaves Report", 105, 15, { align: "center" });
  doc.setFontSize(10);
  doc.text(
    start_date.value && end_date.value
      ? `From: ${start_date.value} To: ${end_date.value}`
      : "All Leaves Data",
    105,
    22,
    { align: "center" }
  );

  // Table
  autoTable(doc, {
    startY: 30,
    head: [["#", "Status", "Employee", "Leave Type", "Reason", "Start", "End", "Approver"]],
    body: leaves.value.map((item, index) => [
      index + 1,
      item.status,
      item.employee?.full_name ?? "-",
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
  if (start_date.value && end_date.value)
    doc.save(`leave-report-${start_date.value}-to-${end_date.value}.pdf`);
  else {
    doc.save(`leaves-report.pdf`);
  }
}
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Leave Management"
    subheading="Manage all leave records"
  >
    <section clas="w-full">
      <main>
        <!-- filterBydate -->
        <div class="flex justify-end">
          <DatePicker :buttonStatus="buttonFilter" @updateDate="filterByDate"></DatePicker>
        </div>
        <div class="flex gap-2 items-center py-4 justify-between">
          <div class="flex gap-2 items-center">
            <Input
              class="w-full md:w-64 lg:w-96"
              placeholder="Search by name..."
              :model-value="table.getColumn('employee.full_name')?.getFilterValue() as string"
              @update:model-value="table.getColumn('employee.full_name')?.setFilterValue($event)"
            />
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  as-child
                  v-show="table.getFilteredSelectedRowModel().rows.length > 0"
                >
                  <Button variant="secondary"> Bulk Action </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-56">
                  <DropdownMenuLabel>Set Status for selected row</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem @click="bulkApprove" class="hover:cursor-pointer">
                    <Badge>Approved</Badge>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem @click="bulkReject" class="hover:cursor-pointer">
                    <Badge variant="destructive">Rejected</Badge>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem class="hover:cursor-pointer">
                    <Button variant="ghost" @click="bulkDelete" class="">
                      <Trash class="mr-2 h-4 w-4" /> Delete Selection
                    </Button>
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div class="flex gap-x-2">
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

            <Button @click.prevent="exportLeaves" :disabled="leaves.length == 0"
              >Export <Printer
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
    </section>

    <ModalDialog
      v-model:open="modalEdit"
      title="Edit Leave"
      description="Edit leave, fill in all the data correctly."
    >
      <section>
        <form class="space-y-3" @submit.prevent="updateLeave">
          <div class="space-y-2">
            <Label>Leave Type</Label>
            <Select v-model="editType">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="annual"> Annual </SelectItem>
                  <SelectItem value="sick"> Sick </SelectItem>
                  <SelectItem value="permission"> Permission </SelectItem>
                  <SelectItem value="maternity"> Maternity </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div class="flex gap-x-3 w-full">
            <div class="space-y-2 w-full">
              <Label>Start Date</Label>
              <Input v-model="editStartDate" type="date" />
            </div>
            <div class="space-y-2 w-full">
              <Label>End Date</Label>
              <Input v-model="editEndDate" type="date" />
            </div>
          </div>
          <div class="space-y-2">
            <Label>Reason</Label>
            <Textarea v-model="editReason" placeholder="Whats going on ?"></Textarea>
          </div>

          <div v-show="formErrors">
            <ul class="list-disc p-2 bg-red-100 rounded-md ps-6">
              <li v-for="(e, i) in formErrors" :key="i" class="text-sm list-disc text-red-600">
                {{ e[0] }}
              </li>
            </ul>
          </div>

          <div class="flex justify-end">
            <Button type="submit" :disabled="isLoading">Save</Button>
          </div>
        </form>
      </section>
    </ModalDialog>
  </DashboardLayout>
</template>
