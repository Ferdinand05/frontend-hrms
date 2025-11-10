<script lang="ts" setup>
import ModalDialog from "@/components/home/ModalDialog.vue";
import Button from "@/components/ui/button/Button.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuCheckboxItem from "@/components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
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
import { cn } from "@/lib/utils";
import { formatToIDR } from "@/services/salaryService";
import { useAuthStore } from "@/stores/auth";
import type { breadcrumbItem } from "@/types/breadcrumb";
import type { Salary } from "@/types/salary";
import type { EmployeeType } from "@/types/user";
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
import { ChevronDown, ChevronsUpDown, Edit, PlusCircle, Printer, Trash } from "lucide-vue-next";
import Swal from "sweetalert2";
import { ref } from "vue";
import { computed, h, onMounted } from "vue";

const breadcrumbs: breadcrumbItem[] = [
  {
    name: "Employee Salary",
    href: "/admin/salaries",
  },
];
const authStore = useAuthStore();

const employees = ref<EmployeeType[]>([]);
const salaries = ref<Salary[]>([]);

function getEmployees() {
  axios
    .get(`${authStore.apiUrl}/employees-without-salary`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    .then((response) => {
      employees.value = response.data.employees;
    })
    .catch((error) => {
      console.error("Error fetching employees:", error);
    });
}

function getSalaries() {
  axios
    .get(`${authStore.apiUrl}/salaries`, {
      headers: {
        Authorization: `Bearer ${authStore.getToken}`,
      },
    })
    .then((response) => {
      salaries.value = response.data.salaries;
    })
    .catch((error) => {
      console.log(`Error Get Salaries : ${error}`);
    });
}

// when component di load
onMounted(() => {
  getSalaries();
  getEmployees();
});

const columnHelper = createColumnHelper<Salary>();
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
  columnHelper.accessor("employee.full_name", {
    id: "employee.full_name",
    enablePinning: true,
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
  columnHelper.accessor("employee.position", {
    id: "employee.position",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Position", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) =>
      h(
        "div",
        {
          class: "capitalize ",
        },
        row.original.employee.position
      ),
  }),
  columnHelper.accessor("base_salary", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Base Salary", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
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
        () => ["Allowance", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
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
        () => ["Deduction", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", formatToIDR(row.getValue("deduction"))),
  }),
  columnHelper.accessor("overtime_rate", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Overtime Rate", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", formatToIDR(row.original.overtime_rate)),
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
            onClick: () => deleteSalary(row.original.id),
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
  data: salaries,
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

// SECTION CRUD Salary
const modalEdit = ref<boolean>(false);
const modalCreate = ref<boolean>(false);

const employee_id = ref<number | null>();
const base_salary = ref<number>();
const allowance = ref<number>();
const deduction = ref<number>();
const overtime_rate = ref<number>();

const buttonCreate = ref<boolean>(false);
const formErrors = ref();
function createSalary() {
  buttonCreate.value = true;
  axios
    .post(
      `${authStore.apiUrl}/salaries`,
      {
        employee_id: employee_id.value,
        base_salary: base_salary.value,
        allowance: allowance.value,
        deduction: deduction.value,
        overtime_rate: overtime_rate.value,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.getToken}`,
        },
      }
    )
    .then((response) => {
      Swal.fire({
        title: "Success!",
        text: `${response.data.message}`,
        icon: "success",
      });

      // empty form
      employee_id.value = null;
      base_salary.value = 0;
      allowance.value = 0;
      deduction.value = 0;
      overtime_rate.value = 0;

      modalCreate.value = false;
      getSalaries();
      getEmployees();
    })
    .catch((error) => {
      console.log(error);
      formErrors.value = error.response.data.errors;
    })
    .finally(() => {
      buttonCreate.value = false;
    });
}

const salary_id = ref();
function openModalEdit(salary: Salary) {
  employee_id.value = salary.employee_id;
  base_salary.value = salary.base_salary;
  allowance.value = salary.allowance;
  deduction.value = salary.deduction;
  overtime_rate.value = salary.overtime_rate;
  salary_id.value = salary.id;
  modalEdit.value = true;
}

const buttonEdit = ref<boolean>(false);
function updateSalary() {
  buttonEdit.value = true;
  axios
    .put(
      `${authStore.apiUrl}/salaries/${salary_id.value}`,
      {
        employee_id: employee_id.value,
        base_salary: base_salary.value,
        allowance: allowance.value,
        deduction: deduction.value,
        overtime_rate: Number(overtime_rate.value),
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.getToken}`,
        },
      }
    )
    .then((response) => {
      Swal.fire({
        title: "Success!",
        text: `${response.data.message}`,
        icon: "success",
      });

      // empty form
      employee_id.value = null;
      base_salary.value = 0;
      allowance.value = 0;
      deduction.value = 0;
      overtime_rate.value = 0;

      modalEdit.value = false;
      getSalaries();
      getEmployees();
    })
    .catch((error) => {
      console.log(error);
      formErrors.value = error.response.data.errors;
    })
    .finally(() => {
      buttonEdit.value = false;
    });
}

function deleteSalary(id: number) {
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
        .delete(`${authStore.apiUrl}/salaries/${id}`, {
          headers: {
            Authorization: `Bearer ${authStore.getToken}`,
          },
        })
        .then((response) => {
          Swal.fire({
            title: "Deleted!",
            text: `${response.data.message}`,
            icon: "success",
          });

          getSalaries();
          getEmployees();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });
}

function exportSalaries() {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header
  doc.setFontSize(14);
  doc.text("Employe Salaries Report", 105, 15, { align: "center" });
  doc.setFontSize(10);

  // Table
  autoTable(doc, {
    startY: 30,
    head: [["#", "Employee", "Base Salary", "Allowance", "Deduction", "Overtime Rate"]],
    body: salaries.value.map((item, index) => [
      index + 1,
      item.employee.full_name,
      formatToIDR(item.base_salary),
      formatToIDR(item.allowance),
      formatToIDR(item.deduction),
      formatToIDR(item.overtime_rate),
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
  doc.save(`salaries-report.pdf`);
}
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Salaries Management"
    subheading="Manage all employee salary here"
  >
    <section clas="w-full">
      <main>
        <header class="my-4">
          <div class="flex justify-end">
            <Button @click="modalCreate = true"> <PlusCircle /> Create Salary</Button>
          </div>
        </header>
        <div class="flex gap-2 items-center py-4 justify-between">
          <div class="flex gap-2 items-center">
            <Input
              class="w-full md:w-64 lg:w-96"
              placeholder="Search by name..."
              :model-value="table.getColumn('employee.full_name')?.getFilterValue() as string"
              @update:model-value="table.getColumn('employee.full_name')?.setFilterValue($event)"
            />
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

            <Button @click.prevent="exportSalaries" :disabled="salaries.length == 0"
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

  <!-- modal form create  -->
  <ModalDialog
    v-model:open="modalCreate"
    title="Create Salary"
    description="Fill in all data correctly."
  >
    <section>
      <form @submit.prevent="createSalary" class="space-y-4">
        <div class="space-y-2">
          <Label for="employee">Employee</Label>
          <Select id="employee" v-model="employee_id">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select a employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="(e, i) in employees" :key="i" :value="e.id">
                  {{ e.full_name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="base_salary">Base Salary</Label>
          <Input type="number" id="base_salary" v-model="base_salary" />
        </div>
        <div class="space-y-2">
          <Label for="allowance">Allowance</Label>
          <Input type="number" id="allowance" v-model="allowance" />
        </div>
        <div class="space-y-2">
          <Label for="deduction">Deduction</Label>
          <Input type="number" id="deduction" v-model="deduction" />
        </div>
        <div class="space-y-2">
          <Label for="overtime_rate">Overtime Rate</Label>
          <Input type="number" id="overtime_rate" v-model="overtime_rate" />
        </div>

        <!-- errors message -->
        <div v-if="formErrors" class="mb-4 rounded-md bg-red-50">
          <ul class="list-inside p-3">
            <li
              class="text-sm list-disc text-red-600"
              v-for="(error, index) in formErrors"
              :key="index"
            >
              {{ error[0] }}
            </li>
          </ul>
        </div>

        <div class="flex justify-end">
          <Button type="submit" :disabled="buttonCreate">Submit</Button>
        </div>
      </form>
    </section>
  </ModalDialog>

  <!-- modal form edit -->
  <ModalDialog title="Edit Salary" description="Edit data correctly" v-model:open="modalEdit">
    <section>
      <form @submit.prevent="updateSalary" class="space-y-4">
        <div class="space-y-2">
          <Label for="employee">Employee</Label>
          <Select id="employee" v-model="employee_id">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select a employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="(e, i) in employees" :key="i" :value="e.id">
                  {{ e.full_name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="base_salary">Base Salary</Label>
          <Input type="number" id="base_salary" v-model="base_salary" />
        </div>
        <div class="space-y-2">
          <Label for="allowance">Allowance</Label>
          <Input type="number" id="allowance" v-model="allowance" />
        </div>
        <div class="space-y-2">
          <Label for="deduction">Deduction</Label>
          <Input type="number" id="deduction" v-model="deduction" />
        </div>
        <div class="space-y-2">
          <Label for="overtime_rate">Overtime Rate</Label>
          <Input type="number" id="overtime_rate" v-model="overtime_rate" />
        </div>

        <!-- errors message -->
        <div v-if="formErrors" class="mb-4 rounded-md bg-red-50">
          <ul class="list-inside p-3">
            <li
              class="text-sm list-disc text-red-600"
              v-for="(error, index) in formErrors"
              :key="index"
            >
              {{ error[0] }}
            </li>
          </ul>
        </div>

        <div class="flex justify-end">
          <Button type="submit" :disabled="buttonEdit">Submit</Button>
        </div>
      </form>
    </section>
  </ModalDialog>
</template>
