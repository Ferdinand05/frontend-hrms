<script lang="ts" setup>
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
import SelectLabel from "@/components/ui/select/SelectLabel.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import Table from "@/components/ui/table/Table.vue";
import TableBody from "@/components/ui/table/TableBody.vue";
import TableCell from "@/components/ui/table/TableCell.vue";
import TableHead from "@/components/ui/table/TableHead.vue";
import TableHeader from "@/components/ui/table/TableHeader.vue";
import TableRow from "@/components/ui/table/TableRow.vue";
import { valueUpdater } from "@/components/ui/table/utils";
import { cn } from "@/lib/utils";
import { printDetailPayroll } from "@/services/payrollService";
import { formatToIDR } from "@/services/salaryService";
import { useAuthStore } from "@/stores/auth";
import type { breadcrumbItem } from "@/types/breadcrumb";
import type { Payroll } from "@/types/payroll";
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
import {
  ChevronDown,
  ChevronsUpDown,
  Edit,
  PlusCircle,
  Printer,
  Rocket,
  Trash,
} from "lucide-vue-next";
import Swal from "sweetalert2";
import { computed, h, onMounted, watch } from "vue";
import { ref } from "vue";

const breadcrumbs: breadcrumbItem[] = [
  {
    name: "Payroll",
    href: "/admin/payrolls",
  },
];
const authStore = useAuthStore();
const payrolls = ref<Payroll[]>([]);
function getPayrolls() {
  axios
    .get(`${authStore.apiUrl}/payrolls`, {
      headers: {
        Authorization: `Bearer ${authStore.getToken}`,
      },
    })
    .then((response) => {
      payrolls.value = response.data.payrolls;
    })
    .catch((error) => {
      console.log(error);
    });
}

onMounted(() => {
  getPayrolls();
});

const columnHelper = createColumnHelper<Payroll>();
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
        () => ["Status", h(ChevronsUpDown, { class: " h-4 w-4" })]
      );
    },
    cell: ({ row }) => {
      const status = row.original.status;
      const variant = status == "paid" ? "default" : "secondary";

      return h(Badge, { variant, class: "capitalize" }, status);
    },
  }),
  columnHelper.accessor("period", {
    id: "period",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Period", h(ChevronsUpDown, { class: " h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", row.getValue("period")),
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
        () => ["Employee", h(ChevronsUpDown, { class: " h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", row.original.employee?.full_name),
  }),
  columnHelper.accessor("base_salary", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Base Salary", h(ChevronsUpDown, { class: " h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", formatToIDR(row.getValue("base_salary"))),
  }),
  columnHelper.accessor("allowance", {
    id: "allowance",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Allowance", h(ChevronsUpDown, { class: " h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", formatToIDR(row.getValue("allowance"))),
  }),
  columnHelper.accessor("deduction", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Deduction", h(ChevronsUpDown, { class: " h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", formatToIDR(row.getValue("deduction"))),
  }),
  columnHelper.accessor("overtime_hours", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Overtime hours", h(ChevronsUpDown, { class: " h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", row.getValue("overtime_hours")),
  }),
  columnHelper.accessor("overtime_pay", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Overtime pay", h(ChevronsUpDown, { class: " h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", formatToIDR(row.original.overtime_pay)),
  }),
  columnHelper.accessor("total_salary", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Total Salary", h(ChevronsUpDown, { class: " h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", formatToIDR(row.original.total_salary)),
  }),
  columnHelper.display({
    id: "actions",
    header: () => "Actions",
    cell: ({ row }) => {
      return h("div", { class: "flex gap-2" }, [
        h(Button, { size: "sm", variant: "outline", asChild: true, title: "Edit" }, () =>
          h(
            Button,
            { variant: "outline", onClick: () => openModalAndFill(row.original) },
            h(Edit, { class: "h-4 w-4" })
          )
        ),
        h(
          Button,
          {
            variant: "default",
            size: "sm",
            title: "Print",
            onClick: () => printDetailPayroll(row.original),
          },
          () => h(Printer, { class: "h-4 w-4" })
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
  data: payrolls,
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

// SECTION Update and print

const period = ref<string>("");
const overtime_pay = ref(0);
const overtime_rate = ref(0);
const overtime_hours = ref(0);
const base_salary = ref(0);
const deduction = ref(0);
const allowance = ref(0);
const payroll_id = ref();
const status = ref<string>("");
const modalEdit = ref<boolean>(false);
function openModalAndFill(payroll: Payroll) {
  period.value = payroll.period;
  overtime_pay.value = Number(payroll.overtime_pay);
  overtime_hours.value = payroll.overtime_hours;
  overtime_rate.value = Number(payroll.salary?.overtime_rate) ?? 0;
  base_salary.value = Number(payroll.base_salary);
  deduction.value = Number(payroll.deduction);
  allowance.value = Number(payroll.allowance);
  payroll_id.value = payroll.id;
  status.value = payroll.status;
  modalEdit.value = true;
}

watch(overtime_hours, (newVal) => {
  overtime_pay.value = newVal * overtime_rate.value;
});

const total_salary = computed(() => {
  return base_salary.value + allowance.value + overtime_pay.value - deduction.value;
});

// update
const buttonUpdate = ref<boolean>(false);
function updatePayroll() {
  buttonUpdate.value = true;

  axios
    .put(
      `${authStore.apiUrl}/payrolls/${payroll_id.value}`,
      {
        period: period.value,
        total_salary: total_salary.value,
        overtime_hours: overtime_hours.value,
        overtime_pay: overtime_pay.value,
        status: status.value,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.getToken}`,
        },
      }
    )
    .then((response) => {
      Swal.fire({
        title: "Updated!",
        icon: "info",
        text: `${response.data.message}`,
      });

      getPayrolls();
      modalEdit.value = false;
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      buttonUpdate.value = false;
    });
}

// SECTION Selection
function selectionSetPaid() {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, set Paid!",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .put(
          `${authStore.apiUrl}/payrolls/bulk/paid`,
          {
            selectionId: selectedData.value,
          },
          {
            headers: {
              Authorization: `Bearer ${authStore.getToken}`,
            },
          }
        )
        .then((response) => {
          let timerInterval: number;
          Swal.fire({
            title: "Processing!",
            html: "I will close in <b></b> milliseconds.",
            timer: 3000,
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
              const popup = Swal.getPopup();
              const timer = popup?.querySelector("b");
              timerInterval = setInterval(() => {
                if (timer) {
                  timer.textContent = `${Swal.getTimerLeft()}`;
                }
              }, 300);
            },
            willClose: () => {
              clearInterval(timerInterval);
            },
          }).then((result) => {
            /* Read more about handling dismissals below */
            if (result.dismiss === Swal.DismissReason.timer) {
              console.log("I was closed by the timer");
              getPayrolls();
              Swal.fire({
                title: "Paid!",
                text: `${response.data.message}`,
                icon: "info",
              });
            }
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });
}

function bulkDelete() {
  console.log(selectedData.value);
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
          `${authStore.apiUrl}/payrolls/bulk/delete`,
          {
            selectionId: selectedData.value,
          },
          {
            headers: {
              Authorization: `Bearer ${authStore.getToken}`,
            },
          }
        )
        .then((response) => {
          let timerInterval: number;
          Swal.fire({
            title: "Processing!",
            html: "I will close in <b></b> milliseconds.",
            timer: 3000,
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
              const popup = Swal.getPopup();
              const timer = popup?.querySelector("b");
              timerInterval = setInterval(() => {
                if (timer) {
                  timer.textContent = `${Swal.getTimerLeft()}`;
                }
              }, 300);
            },
            willClose: () => {
              clearInterval(timerInterval);
            },
          }).then((result) => {
            /* Read more about handling dismissals below */
            if (result.dismiss === Swal.DismissReason.timer) {
              console.log("I was closed by the timer");
              getPayrolls();
              Swal.fire({
                title: "Deleted!",
                text: `${response.data.message}`,
                icon: "info",
              });
            }
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });
}

const monthValue = ref(new Date().toISOString().slice(0, 7)); // YYYY-MM format
watch(monthValue, (newVal) => {
  axios
    .get(`${authStore.apiUrl}/payrolls`, {
      headers: {
        Authorization: `Bearer ${authStore.getToken}`,
      },
      params: {
        month: newVal,
      },
    })
    .then((response) => {
      console.log(response.data);
      payrolls.value = response.data.payrolls;
    })
    .catch((error) => {
      console.log(error);
    });
});

const loadingGenerateAll = ref(false);
function generateAllEmployeePayroll() {
  loadingGenerateAll.value = true;
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Generate!",
  }).then((result) => {
    if (result.isConfirmed) {
      // store data

      axios
        .post(
          `${authStore.apiUrl}/payrolls/generate-all`,
          {},
          {
            headers: {
              Authorization: `Bearer ${authStore.getToken}`,
            },
          }
        )
        .then((response) => {
          let timerInterval: number;
          Swal.fire({
            title: "Processing!",
            html: "I will close in <b></b> milliseconds.",
            timer: 3000,
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
              const popup = Swal.getPopup();
              const timer = popup?.querySelector("b");
              timerInterval = setInterval(() => {
                if (timer) {
                  timer.textContent = `${Swal.getTimerLeft()}`;
                }
              }, 300);
            },
            willClose: () => {
              clearInterval(timerInterval);
            },
          }).then((result) => {
            /* Read more about handling dismissals below */
            if (result.dismiss === Swal.DismissReason.timer) {
              console.log("I was closed by the timer");
              getPayrolls();
              loadingGenerateAll.value = false;
              Swal.fire({
                title: "Generated!",
                icon: "info",
                text: `${response.data.message}`,
              });
            }
          });
        })
        .catch((error) => {
          console.log(error);
          loadingGenerateAll.value = false;
        })
        .finally(() => {
          loadingGenerateAll.value = false;
        });
    } else {
      loadingGenerateAll.value = false;
    }
  });
}

function exportPayrolls() {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header
  doc.setFontSize(14);
  doc.text("Employee Payroll Report", 105, 15, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Month: ${monthValue.value}`, 105, 22, { align: "center" });

  // Table
  autoTable(doc, {
    startY: 30,
    head: [
      [
        "#",
        "Status",
        "Period",
        "Employee",
        "Base Salary",
        "Allowance",
        "Deduction",
        "Overtime Hours",
        "Overtime Pay",
        "Total Salary",
      ],
    ],
    body: payrolls.value.map((item, index) => [
      index + 1,
      item.status,
      item.period,
      item.employee?.full_name ?? "-",
      formatToIDR(item.base_salary),
      formatToIDR(item.allowance),
      formatToIDR(item.deduction),
      item.overtime_hours ?? 0,
      formatToIDR(item.overtime_pay),
      formatToIDR(item.total_salary),
    ]),
    theme: "striped",
    headStyles: {
      fontSize: 9,
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
  doc.save(`payrolls-report-${monthValue.value}.pdf`);
}
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Payroll Management"
    subheading="Manage all payroll records"
  >
    <section clas="w-full">
      <main>
        <header class="my-3 flex justify-between">
          <div>
            <Label for="month" class="text-sm mb-1 font-normal">Period</Label>
            <Input type="month" id="month" v-model="monthValue" />
          </div>
          <div>
            <Button
              class="mr-2"
              variant="destructive"
              :disabled="loadingGenerateAll"
              @click="generateAllEmployeePayroll"
            >
              <Rocket /> Generate All Employee Payroll
            </Button>

            <router-link :to="{ name: 'payrolls-create' }">
              <Button> <PlusCircle /> Create Payroll</Button>
            </router-link>
          </div>
        </header>
        <div class="flex gap-2 items-center py-4 justify-between">
          <div class="flex gap-3 flex-col md:flex-row">
            <div class="flex gap-2 items-center">
              <Input
                class="w-full md:w-64 lg:w-96"
                placeholder="Search by name..."
                :model-value="table.getColumn('employee.full_name')?.getFilterValue() as string"
                @update:model-value="table.getColumn('employee.full_name')?.setFilterValue($event)"
              />
            </div>
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
                  <DropdownMenuCheckboxItem
                    class="hover:cursor-pointer"
                    @click.prevent="selectionSetPaid()"
                  >
                    <Badge>Paid</Badge>
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    class="hover:cursor-pointer"
                    @click.prevent="bulkDelete()"
                  >
                    <Button variant="ghost" class="">
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

            <Button @click="exportPayrolls" :disabled="payrolls.length == 0"
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
  </DashboardLayout>

  <ModalDialog
    v-model:open="modalEdit"
    title="Edit Payroll"
    description="Edit your payroll, make sure data correct"
  >
    <form @submit.prevent="updatePayroll">
      <section class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="space-y-2">
          <Label>Status</Label>
          <Select v-model="status">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="pending"> Pending </SelectItem>
                <SelectItem value="paid"> Paid </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>Period</Label>
          <Input type="month" v-model="period" />
        </div>

        <div class="space-y-2">
          <Label>Base Salary</Label>
          <Input
            type="number"
            v-model="base_salary"
            :disabled="true"
            class="disabled:bg-gray-100"
          />
        </div>
        <div class="space-y-2">
          <Label>Allowance</Label>
          <Input type="number" v-model="allowance" :disabled="true" class="disabled:bg-gray-100" />
        </div>
        <div class="space-y-2">
          <Label>Deduction</Label>
          <Input type="number" v-model="deduction" :disabled="true" class="disabled:bg-gray-100" />
        </div>
        <div class="space-y-2">
          <Label>Overtime Hours</Label>
          <Input type="number" v-model="overtime_hours" />
        </div>
        <div class="space-y-2">
          <Label>Overtime Rate</Label>
          <Input
            type="number"
            v-model="overtime_rate"
            :disabled="true"
            class="disabled:bg-gray-100"
          />
        </div>
        <div class="space-y-2">
          <Label>Overtime Pay</Label>
          <Input
            type="number"
            v-model="overtime_pay"
            :disabled="true"
            class="disabled:bg-gray-100"
          />
        </div>
        <div class="space-y-2">
          <Label>Total Salary</Label>
          <Input
            type="number"
            v-model="total_salary"
            :disabled="true"
            class="disabled:bg-gray-100"
          />
        </div>
        <div class="mt-4 col-span-2 flex justify-end">
          <Button type="submit" :disabled="buttonUpdate">Save Changes</Button>
        </div>
      </section>
    </form>
  </ModalDialog>
</template>
